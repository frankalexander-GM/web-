"""
StreamVerse - Chat Service (Python / FastAPI + WebSocket)
=========================================================
Capa: Servicio de chat en tiempo real
Puerto: 3003

Arquitectura por capas:
  - main.py            -> Punto de entrada (arranque del servidor)
  - config.py          -> Configuración (constantes, colores, BD)
  - repositories/      -> Capa de acceso a datos (SQLite)
  - services/          -> Capa de lógica de negocio (gestión de chat)
  - handlers/          -> Capa de transporte (WebSocket handlers)
  - models.py          -> Modelos de datos (dataclasses)

El servidor expone WebSocket en path "/" (requerido por el gateway Caddy)
y un endpoint REST /api/health para verificación.
"""
import asyncio
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from config import settings
from handlers.websocket_handler import router as ws_router
from repositories.chat_repository import ChatRepository

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("streamverse.chat")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización: abrir conexión a la BD y limpiar
    repo = ChatRepository(settings.DB_PATH)
    repo.init()
    app.state.repo = repo
    app.state.connections = {}  # {websocket: ChatUser}
    app.state.lock = asyncio.Lock()
    logger.info("💬 StreamVerse chat service (Python) iniciado en puerto %s", settings.PORT)
    yield
    # Cierre
    repo.close()
    logger.info("Chat service detenido.")


app = FastAPI(title="StreamVerse Chat", lifespan=lifespan)

# Endpoint REST de salud (para verificación vía gateway)
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "chat", "language": "python", "online": len(app.state.connections)}


# Router de WebSocket
app.include_router(ws_router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
        log_level="info",
    )
