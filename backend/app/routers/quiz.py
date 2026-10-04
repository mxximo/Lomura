from fastapi import APIRouter, HTTPException
from ..content_store import questions, question_index
from ..schemas.models import PublicQuestion, Submission, QuizResult, AnswerResult

router = APIRouter()


@router.get("/quiz", response_model=list[PublicQuestion])
def get_quiz():
    return [PublicQuestion.model_validate(q.model_dump(exclude={"correct_option", "explanation", "source_id"})) for q in questions]


@router.post("/quiz/submit", response_model=QuizResult)
def submit_quiz(payload: Submission):
    # Single-answer submissions support immediate feedback; the final request
    # includes all 10 answers for a complete server-calculated score.
    results = []
    for answer in payload.answers:
        question = question_index.get(answer.question_id)
        if question is None or answer.option_id not in {o.id for o in question.options}:
            raise HTTPException(422, "Unknown question or option")
        results.append(AnswerResult(
            question_id=question.id,
            correct=answer.option_id == question.correct_option,
            correct_option=question.correct_option,
            explanation=question.explanation,
        ))
    return QuizResult(score=sum(r.correct for r in results), total=len(results), results=results)
