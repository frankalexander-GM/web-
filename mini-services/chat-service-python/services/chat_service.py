"""
Capa de lógica de negocio (Service Pattern)
============================================
Gestiona usuarios conectados, mensajes, indicadores de escritura.
No toca la BD directamente (usa el repositorio) ni el transporte (WebSocket).
"""
from __future__ import annotations

import asyncio
import logging
import random
from typing import Dict, List, Set
from urllib.parse import quote

from config import settings
from models import ChatMessage, ChatUser, generate_id, now_iso
from repositories.chat_repository import ChatRepository

logger = logging.getLogger("streamverse.chat.service")


class ChatService:
    """Servicio principal del chat: gestiona estado en memoria y persistencia."""

    def __init__(self, repo: ChatRepository):
        self._repo = repo
        self._connections: Dict[object, ChatUser] = {}  # {websocket: user}
        self._lock = asyncio.Lock()
        self._typing: Dict[str, float] = {}  # {username: last_seen_timestamp}

    # ---- Gestión de conexiones ----

    async def register_user(self, websocket, username: str) -> ChatUser:
        """Registra un usuario conectado. Devuelve el objeto ChatUser."""
        username = (username or "Invitado").strip()[: settings.MAX_USERNAME_LENGTH]
        color = random.choice(settings.COLORS)
        avatar = f"{settings.AVATAR_BASE}{quote(username)}"
        user = ChatUser(socket_id=str(id(websocket)), username=username, color=color, avatar=avatar)
        async with self._lock:
            self._connections[websocket] = user
        return user

    async def unregister_user(self, websocket) -> ChatUser | None:
        """Elimina un usuario conectado. Devuelve el usuario eliminado o None."""
        async with self._lock:
            user = self._connections.pop(websocket, None)
        if user:
            self._typing.pop(user.username, None)
        return user

    async def get_user(self, websocket) -> ChatUser | None:
        async with self._lock:
            return self._connections.get(websocket)

    async def online_count(self) -> int:
        async with self._lock:
            return len(self._connections)

    # ---- Mensajes ----

    async def get_history(self) -> List[ChatMessage]:
        """Historial reciente desde la BD."""
        return self._repo.get_recent_history(settings.HISTORY_LIMIT)

    async def create_message(self, user: ChatUser, content: str) -> ChatMessage:
        """Crea, persiste y devuelve un mensaje de usuario."""
        content = (content or "").strip()[: settings.MAX_MESSAGE_LENGTH]
        msg = ChatMessage(
            id=generate_id(),
            username=user.username,
            content=content,
            color=user.color,
            avatar=user.avatar,
            timestamp=now_iso(),
            type="user",
        )
        # Persistir en un hilo para no bloquear el loop async
        await asyncio.to_thread(self._repo.save_message, msg)
        return msg

    async def create_system_message(self, content: str) -> ChatMessage:
        """Crea un mensaje del sistema (no se persiste)."""
        return ChatMessage(
            id=generate_id(),
            username="System",
            content=content,
            color="#64748b",
            avatar=None,
            timestamp=now_iso(),
            type="system",
        )

    # ---- Indicadores de escritura ----

    async def mark_typing(self, username: str) -> None:
        async with self._lock:
            self._typing[username] = asyncio.get_event_loop().time()

    async def clear_typing(self, username: str) -> None:
        async with self._lock:
            self._typing.pop(username, None)

    async def prune_stale_typing(self) -> List[str]:
        """Elimina indicadores de escritura viejos. Devuelve la lista de usernames limpiados."""
        async with self._lock:
            now = asyncio.get_event_loop().time()
            stale = [u for u, t in self._typing.items() if now - t > settings.TYPING_TIMEOUT_MS / 1000]
            for u in stale:
                self._typing.pop(u, None)
            return stale
