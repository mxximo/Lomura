from fastapi import APIRouter
from ..content_store import credits
from ..schemas.models import Credits

router = APIRouter()


@router.get("/credits", response_model=Credits)
def get_credits():
    return credits
