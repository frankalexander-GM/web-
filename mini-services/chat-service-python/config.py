"""Configuración del Chat Service — todas las constantes en un solo lugar."""
import os


class Settings:
    # Servidor
    PORT: int = 3003
    HOST: str = "0.0.0.0"

    # Base de datos (misma BD que Prisma)
    DB_PATH: str = os.environ.get(
        "CHAT_DB_PATH",
        "/home/z/my-project/db/custom.db",
    )

    # WebSocket
    WS_PATH: str = "/"  # requerido por el gateway Caddy
    PING_INTERVAL: int = 25
    PING_TIMEOUT: int = 60

    # Chat
    MAX_MESSAGE_LENGTH: int = 500
    MAX_USERNAME_LENGTH: int = 24
    HISTORY_LIMIT: int = 40
    TYPING_TIMEOUT_MS: int = 3000

    # Avatar
    AVATAR_BASE: str = "https://api.dicebear.com/9.x/avataaars/svg?seed="

    # Colores neón disponibles para usuarios
    COLORS = [
        "#a855f7",  # púrpura
        "#ec4899",  # rosa
        "#06b6d4",  # cyan
        "#10b981",  # esmeralda
        "#f59e0b",  # ámbar
        "#8b5cf6",  # violeta
        "#ef4444",  # rojo
        "#14b8a6",  # teal
    ]


settings = Settings()
