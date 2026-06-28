"""
Capa de transporte (WebSocket Handler)
======================================
Traduce eventos de WebSocket a llamadas del servicio de chat.
No contiene lógica de negocio; solo orquestación.
"""
from __future__ import annotations

import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.chat_service import ChatService

logger = logging.getLogger("streamverse.chat.handler")
router = APIRouter()


def _get_service(ws: WebSocket) -> ChatService | None:
    """Obtiene el servicio desde el estado de la app."""
    return getattr(ws.app.state, "_chat_service", None)


@router.websocket("/")
async def chat_endpoint(websocket: WebSocket):
    """
    Endpoint principal del WebSocket.
    Path '/' es requerido por el gateway Caddy para forwarding.
    """
    await websocket.accept()
    app = websocket.app
    repo = app.state.repo
    connections: dict = app.state.connections
    lock: asyncio.Lock = app.state.lock

    # Instanciar servicio para esta conexión (comparte repositorio y estado)
    from services.chat_service import ChatService
    service = ChatService(repo)
    service._connections = connections  # compartir mapa de conexiones
    service._lock = lock

    logger.info("[chat] conexión establecida: %s", websocket.client)

    # 1. Enviar historial al nuevo usuario
    try:
        history = await service.get_history()
        await websocket.send_json({
            "event": "chat:history",
            "data": [m.to_dict() for m in history],
        })
    except Exception as e:
        logger.error("Error enviando historial: %s", e)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                continue

            event = payload.get("event")
            data = payload.get("data", {})

            # ---- JOIN ----
            if event == "chat:join":
                username = data.get("username", "Invitado")
                user = await service.register_user(websocket, username)
                await websocket.send_json({"event": "chat:joined", "data": {"user": user.__dict__}})
                count = await service.online_count()
                await _broadcast(connections, {"event": "chat:users", "data": {"count": count}})
                sys_msg = await service.create_system_message(f"{user.username} se unió al chat")
                await _broadcast(connections, {"event": "chat:system", "data": sys_msg.to_dict()})
                logger.info("[chat] %s se unió (%d en línea)", user.username, count)

            # ---- MESSAGE ----
            elif event == "chat:message":
                user = await service.get_user(websocket)
                if not user:
                    continue
                content = data.get("content", "")
                if not content.strip():
                    continue
                msg = await service.create_message(user, content)
                await _broadcast(connections, {"event": "chat:message", "data": msg.to_dict()})

            # ---- TYPING ----
            elif event == "chat:typing":
                user = await service.get_user(websocket)
                if not user:
                    continue
                is_typing = bool(data.get("isTyping", False))
                if is_typing:
                    await service.mark_typing(user.username)
                else:
                    await service.clear_typing(user.username)
                # Reenviar a los demás (sin el emisor)
                await _broadcast(connections, {
                    "event": "chat:typing",
                    "data": {"username": user.username, "isTyping": is_typing},
                }, exclude=websocket)

    except WebSocketDisconnect:
        logger.info("[chat] conexión cerrada: %s", websocket.client)
    except Exception as e:
        logger.error("[chat] error: %s", e)
    finally:
        user = await service.unregister_user(websocket)
        if user:
            count = await service.online_count()
            await _broadcast(connections, {"event": "chat:users", "data": {"count": count}})
            sys_msg = await service.create_system_message(f"{user.username} salió del chat")
            await _broadcast(connections, {"event": "chat:system", "data": sys_msg.to_dict()})
            logger.info("[chat] %s salió (%d en línea)", user.username, count)


async def _broadcast(connections: dict, message: dict, exclude: WebSocket | None = None) -> None:
    """Envía un mensaje a todas las conexiones activas (opcionalmente excluyendo una)."""
    dead = []
    for ws in list(connections.keys()):
        if ws is exclude:
            continue
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(ws)
    # Limpiar conexiones muertas
    for ws in dead:
        connections.pop(ws, None)
