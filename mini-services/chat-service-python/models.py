"""Modelos de datos del chat (dataclasses tipadas)."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Literal, Optional


@dataclass
class ChatUser:
    """Usuario conectado al chat."""
    socket_id: str
    username: str
    color: str
    avatar: str


@dataclass
class ChatMessage:
    """Mensaje del chat (de usuario o del sistema)."""
    id: str
    username: str
    content: str
    color: str
    avatar: Optional[str]
    timestamp: str  # ISO 8601
    type: Literal["user", "system"] = "user"
    pending: bool = False

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "content": self.content,
            "color": self.color,
            "avatar": self.avatar,
            "timestamp": self.timestamp,
            "type": self.type,
        }


def now_iso() -> str:
    """Timestamp actual en formato ISO 8601 (UTC)."""
    return datetime.now(timezone.utc).isoformat()


def generate_id() -> str:
    """ID corto aleatorio para mensajes."""
    import secrets
    return secrets.token_hex(8)
