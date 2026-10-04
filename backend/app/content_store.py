import json
from pathlib import Path
from pydantic import TypeAdapter
from .schemas.models import Module, Question, Credits

DATA = Path(__file__).parent / "data"


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


# Fail startup on invalid authored content; no partial or unvalidated responses.
modules = TypeAdapter(list[Module]).validate_python(read_json("modules.json"))
questions = TypeAdapter(list[Question]).validate_python(read_json("quiz.json"))
credits = Credits.model_validate(read_json("credits.json"))
question_index = {q.id: q for q in questions}
lesson_slugs = [lesson.slug for module in modules for lesson in module.lessons]
if len(modules) != 5 or len(set(lesson_slugs)) != 10 or len(question_index) != 10:
    raise ValueError("Expected 5 modules, 10 unique lessons and 10 unique questions")
lesson_modules = {lesson.id: module.id for module in modules for lesson in module.lessons}
if any(lesson_modules.get(q.lesson_id) != q.module_id for q in questions):
    raise ValueError("Every question must refer to a lesson in its module")
