from fastapi import APIRouter
from ..content_store import modules
from ..schemas.models import Module

router = APIRouter()


@router.get("/modules", response_model=list[Module])
def get_modules():
    return modules
