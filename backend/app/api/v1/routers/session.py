import json
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel

from app.core.config import settings
from app.services.redis_client import get_redis

router = APIRouter(prefix="/session", tags=["session"])


class LoginRequest(BaseModel):
    username: str


def _key(session_id: str) -> str:
    return f"session:{session_id}"


def _load(session_id: str) -> dict:
    raw = get_redis().get(_key(session_id))
    if raw is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid session")
    return json.loads(raw)


def _save(session_id: str, data: dict) -> None:
    get_redis().set(_key(session_id), json.dumps(data), ex=settings.session_ttl_seconds)


@router.post("/login", status_code=status.HTTP_201_CREATED)
def login(body: LoginRequest, response: Response):
    session_id = secrets.token_urlsafe(32)
    data = {
        "username": body.username,
        "visits": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_on_node": settings.node_id,
    }
    _save(session_id, data)
    response.set_cookie(
        settings.session_cookie_name,
        session_id,
        max_age=settings.session_ttl_seconds,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        path="/",
    )
    return {"session": data, "served_by": settings.node_id}


@router.get("")
def get_session(request: Request):
    session_id = request.cookies.get(settings.session_cookie_name)
    if not session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="no session cookie")
    data = _load(session_id)
    data["visits"] += 1
    data["last_node"] = settings.node_id
    _save(session_id, data)
    return {"session": data, "served_by": settings.node_id}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, response: Response):
    session_id = request.cookies.get(settings.session_cookie_name)
    if session_id:
        get_redis().delete(_key(session_id))
    response.delete_cookie(settings.session_cookie_name, path="/")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
