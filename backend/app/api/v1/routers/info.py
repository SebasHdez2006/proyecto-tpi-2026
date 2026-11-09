import socket
from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["info"])


@router.get("/info")
def get_info():
    return {
        "app": settings.app_name,
        "node_id": settings.node_id,
        "hostname": socket.gethostname(),
        "environment": settings.environment,
        "cdn_base_url": settings.cdn_base_url,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
