"""
Capa de acceso a datos (Repository Pattern)
============================================
Aísla toda la interacción con SQLite del resto de la aplicación.
Usa sqlite3 estándar de Python (síncrono, suficiente para chat).
"""
from __future__ import annotations

import logging
import sqlite3
from typing import List, Optional

from models import ChatMessage, generate_id, now_iso

logger = logging.getLogger("streamverse.chat.repository")


class ChatRepository:
    """Repositorio para persistir y recuperar mensajes del chat."""

    def __init__(self, db_path: str):
        self._db_path = db_path
        self._conn: Optional[sqlite3.Connection] = None

    def init(self) -> None:
        """Inicializa la conexión y crea la tabla si no existe."""
        try:
            self._conn = sqlite3.connect(self._db_path, check_same_thread=False)
            self._conn.row_factory = sqlite3.Row
            # Asegurar que la tabla exista (compatible con la de Prisma)
            self._conn.execute(
                """
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    username TEXT NOT NULL,
                    content TEXT NOT NULL,
                    color TEXT DEFAULT '#a855f7',
                    avatar TEXT,
                    createdAt TEXT
                )
                """
            )
            self._conn.commit()
            logger.info("Repositorio de chat inicializado: %s", self._db_path)
        except Exception as e:
            logger.error("Error inicializando repositorio: %s", e)
            raise

    def close(self) -> None:
        if self._conn:
            self._conn.close()
            self._conn = None

    def save_message(self, msg: ChatMessage) -> None:
        """Persiste un mensaje de usuario en la BD."""
        if msg.type != "user":
            return  # Los mensajes del sistema no se persisten
        try:
            assert self._conn is not None
            self._conn.execute(
                "INSERT INTO chat_messages (id, username, content, color, avatar, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
                (msg.id, msg.username, msg.content, msg.color, msg.avatar, msg.timestamp),
            )
            self._conn.commit()
        except Exception as e:
            logger.error("Error guardando mensaje: %s", e)

    def get_recent_history(self, limit: int = 40) -> List[ChatMessage]:
        """Recupera los mensajes más recientes (orden ascendente)."""
        try:
            assert self._conn is not None
            rows = self._conn.execute(
                "SELECT id, username, content, color, avatar, createdAt FROM chat_messages ORDER BY createdAt DESC LIMIT ?",
                (limit,),
            ).fetchall()
            # Invertir para orden ascendente (más antiguo primero)
            rows = list(reversed(rows))
            messages = []
            for r in rows:
                ts = r["createdAt"]
                # Normalizar timestamp: si es número (epoch ms), convertir a ISO
                if isinstance(ts, (int, float)):
                    from datetime import datetime, timezone
                    ts = datetime.fromtimestamp(ts / 1000, tz=timezone.utc).isoformat()
                messages.append(ChatMessage(
                    id=r["id"],
                    username=r["username"],
                    content=r["content"],
                    color=r["color"] or "#a855f7",
                    avatar=r["avatar"],
                    timestamp=ts,
                    type="user",
                ))
            return messages
        except Exception as e:
            logger.error("Error obteniendo historial: %s", e)
            return []
