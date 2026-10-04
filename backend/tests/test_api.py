import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.content_store import modules, questions, credits

client = TestClient(app)


def test_health_and_bilingual_curriculum():
    assert client.get('/api/health').json() == {'status': 'ok'}
    data = client.get('/api/modules').json()
    assert len(data) == 5
    lessons = [l for m in data for l in m['lessons']]
    assert len({l['slug'] for l in lessons}) == 10
    for lesson in lessons:
        assert lesson['title']['es'] and lesson['title']['en']
        assert lesson['sources'] and '[VERIFICAR]' in lesson['review']


def test_public_quiz_never_exposes_solutions():
    response = client.get('/api/quiz')
    assert response.status_code == 200
    assert len(response.json()) == 10
    assert all('correct_option' not in q and 'explanation' not in q for q in response.json())
    assert response.headers['cache-control'] == 'no-store'
    for module in modules:
        assert sum(q.module_id == module.id for q in questions) == 2
    lessons = {l.id: m.id for m in modules for l in m.lessons}
    assert all(lessons[q['lesson_id']] == q['module_id'] for q in response.json())


def test_grading_full_score_and_wrong_answers():
    answers = [{'question_id': q.id, 'option_id': q.correct_option} for q in questions]
    result = client.post('/api/quiz/submit', json={'answers': answers}).json()
    assert result['score'] == result['total'] == 10
    assert all(r['correct'] and r['explanation']['es'] and r['explanation']['en'] for r in result['results'])
    answers[0]['option_id'] = next(o.id for o in questions[0].options if o.id != questions[0].correct_option)
    result = client.post('/api/quiz/submit', json={'answers': answers}).json()
    assert result['score'] == 9
    assert result['results'][0]['correct'] is False


@pytest.mark.parametrize('answers', [[], [{'question_id':'bad','option_id':'a'}], [{'question_id':'q1','option_id':'z'}], [{'question_id':'q1','option_id':'a'}]*2, [{'question_id':'q1','option_id':'a'}]*11, [{'question_id':'q1','option_id':'a','password':'not-accepted'}]])
def test_rejects_invalid_answers(answers):
    assert client.post('/api/quiz/submit', json={'answers': answers}).status_code == 422


def test_partial_feedback():
    result = client.post('/api/quiz/submit', json={'answers':[{'question_id':'q1','option_id':'a'}]}).json()
    assert result['score'] == result['total'] == 1


def test_cors_exact_origins():
    headers = {'Origin':'http://localhost:5173','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}
    response = client.options('/api/quiz/submit', headers=headers)
    assert response.headers['access-control-allow-origin'] == 'http://localhost:5173'
    headers['Origin'] = 'https://untrusted.example'
    assert 'access-control-allow-origin' not in client.options('/api/quiz/submit', headers=headers).headers


def test_credits_cover_all_media():
    data = client.get('/api/credits').json()
    assert data['ai_note']['es'] and data['ai_note']['en']
    refs = {ref.id for ref in credits.references}
    public = Path(__file__).resolve().parents[2] / 'frontend' / 'public'
    for module in modules:
        for lesson in module.lessons:
            assert (public / lesson.media.image.lstrip('/')).is_file()
            assert f'art-{lesson.interaction}' in refs
            if lesson.media.video:
                assert f'video-{lesson.interaction}' in refs
                assert lesson.media.review == '[VERIFICAR VIDEO]'


def test_spa_routes_and_real_404s():
    for path in ['/', '/quiz', '/credits'] + [f'/learn/{l.slug}' for m in modules for l in m.lessons]:
        response = client.get(path)
        assert response.status_code == 200
        assert '<div id="root">' in response.text
    for path in ['/api/missing', '/api', '/assets/missing.js', '/media/missing.svg', '/%2e%2e/backend/app/data/quiz.json']:
        assert client.get(path).status_code == 404
    assert client.get('/media/hero.svg').headers['content-type'].startswith('image/svg+xml')


def test_missing_build_is_actionable(tmp_path, monkeypatch):
    import app.main as main
    monkeypatch.setattr(main, 'DIST', tmp_path)
    assert client.get('/quiz').status_code == 503
