from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

from app.core.config import settings

_service_key_header = APIKeyHeader(name="X-Service-Key", auto_error=False)


async def require_service_key(key: str | None = Depends(_service_key_header)) -> None:
    if key != settings.service_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="service authentication required",
        )
