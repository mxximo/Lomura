from uuid import uuid4
from test_responses import client, login


def comment(**changes):
    return {"submission_id": str(uuid4()), "alias": "Lector", "body": "Me ayudó a recordar mis pausas.", "consent": True, **changes}


def test_comments_need_moderation_and_admin_session(client):
    payload = comment()
    assert client.post('/api/comments', json=payload).status_code == 201
    assert client.get('/api/comments').json()['total'] == 0
    assert client.get('/api/admin/comments').status_code == 401
    assert client.post('/api/admin/comments/'+payload['submission_id'], json={'status':'approved'}).status_code == 401
    login(client)
    pending = client.get('/api/admin/comments').json()
    assert pending['total'] == 1
    assert client.post('/api/admin/comments/'+payload['submission_id'], json={'status':'approved'}, headers={'origin':'https://attacker.example'}).status_code == 403
    assert client.post('/api/admin/comments/'+payload['submission_id'], json={'status':'approved'}).status_code == 200
    assert client.get('/api/comments').json()['items'][0]['body'] == payload['body']
    assert client.get('/api/admin/comments-export').status_code == 200
    client.post('/api/admin/comments/'+payload['submission_id'], json={'status':'rejected'})
    assert client.get('/api/comments').json()['total'] == 0


def test_comment_retries_validation_and_rate_limit(client):
    payload = comment()
    first = client.post('/api/comments', json=payload)
    assert client.post('/api/comments', json=payload).json() == first.json()
    assert client.post('/api/comments', json={**payload, 'body':'Una respuesta completamente distinta.'}).status_code == 409
    for update in [{'consent':False}, {'body':' '*20}, {'alias':'x'*41}, {'body':'x'*601}]:
        assert client.post('/api/comments', json=comment(**update)).status_code == 422
    for _ in range(4):
        assert client.post('/api/comments', json=comment()).status_code == 201
    assert client.post('/api/comments', json=comment()).status_code == 429


def test_comment_exports_are_private_and_formula_safe(client):
    assert client.get('/api/admin/comments-export').status_code == 401
    client.post('/api/comments', json=comment(alias='=1+1', body='<script>alert(1)</script>'))
    login(client)
    export = client.get('/api/admin/comments-export').text
    assert "'=1+1" in export
    assert 'pending' in export
    assert client.get('/api/comments').json()['items'] == []
