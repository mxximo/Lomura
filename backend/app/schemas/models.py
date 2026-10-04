from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Text(StrictModel):
    es: str = Field(min_length=1)
    en: str = Field(min_length=1)


class Source(StrictModel):
    id: str
    name: str
    url: HttpUrl
    review: str


class ExtraVideo(StrictModel):
    url: str = Field(pattern=r"^https://www\.youtube-nocookie\.com/embed/[\w-]{11}$")
    title: Text


class Media(StrictModel):
    image: str
    alt: Text
    video: str | None = None
    video_title: Text | None = None
    review: str | None = None
    extra_videos: list[ExtraVideo] = Field(default_factory=list)


class EmailExample(StrictModel):
    sender: str
    subject: Text
    body: Text
    explanation: Text
    is_phishing: bool


class ActivityCard(StrictModel):
    title: Text
    description: Text
    seconds: int = Field(ge=1, le=300)


class Tool(StrictModel):
    name: str
    platform: Literal["Android", "iOS", "browser"]
    icon: str
    url: HttpUrl
    description: Text


class InteractionData(StrictModel):
    checklist: list[Text] = Field(default_factory=list)
    cards: list[ActivityCard] = Field(default_factory=list)
    emails: list[EmailExample] = Field(default_factory=list)
    tools: list[Tool] = Field(default_factory=list)


class Lesson(StrictModel):
    id: str
    slug: str
    title: Text
    intro: Text
    paragraphs: list[Text] = Field(min_length=1)
    takeaway: Text
    sources: list[Source] = Field(min_length=1)
    media: Media
    interaction: Literal["eyes", "display", "ergonomics", "stretch", "password", "phishing", "pomodoro", "blockers", "notifications", "sleep"]
    review: str
    interaction_data: InteractionData = Field(default_factory=InteractionData)

    @model_validator(mode="after")
    def validate_activity_data(self):
        required = {"ergonomics": "checklist", "stretch": "cards", "phishing": "emails", "blockers": "tools", "sleep": "checklist"}
        field = required.get(self.interaction)
        if field and not getattr(self.interaction_data, field):
            raise ValueError(f"Missing activity data: {field}")
        return self


class Module(StrictModel):
    id: str
    title: Text
    description: Text
    color: str
    icon: str
    lessons: list[Lesson] = Field(min_length=2, max_length=2)


class Option(StrictModel):
    id: str
    text: Text


class PublicQuestion(StrictModel):
    id: str
    module_id: str
    lesson_id: str
    prompt: Text
    options: list[Option] = Field(min_length=2)


class Question(PublicQuestion):
    correct_option: str
    explanation: Text
    source_id: str

    @model_validator(mode="after")
    def valid_options(self):
        ids = [o.id for o in self.options]
        if len(ids) != len(set(ids)) or self.correct_option not in ids:
            raise ValueError("Invalid question options")
        return self


class Answer(StrictModel):
    question_id: str = Field(min_length=1, max_length=40)
    option_id: str = Field(min_length=1, max_length=40)


class Submission(StrictModel):
    answers: list[Answer] = Field(min_length=1, max_length=10)

    @model_validator(mode="after")
    def unique_questions(self):
        ids = [a.question_id for a in self.answers]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate question IDs")
        return self


class AnswerResult(StrictModel):
    question_id: str
    correct: bool
    correct_option: str
    explanation: Text


class QuizResult(StrictModel):
    score: int
    total: int
    results: list[AnswerResult]


class Credit(StrictModel):
    id: str
    category: Literal["source", "art", "video", "software"]
    title: Text
    citation: Text
    url: HttpUrl | None = None
    note: Text
    review: str


class Credits(StrictModel):
    ai_note: Text
    references: list[Credit]
