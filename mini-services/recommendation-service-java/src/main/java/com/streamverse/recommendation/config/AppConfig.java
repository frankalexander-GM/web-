package com.streamverse.recommendation.config;

/**
 * Configuración del servicio de recomendaciones.
 * Todas las constantes en un solo lugar.
 */
public final class AppConfig {
    private AppConfig() {}

    /** Puerto del servicio (3005). */
    public static final int PORT = 3005;

    /** Host del servicio. */
    public static final String HOST = "0.0.0.0";

    /** Ruta de la base de datos SQLite (compartida con Prisma/Next.js). */
    public static final String DB_PATH = "/home/z/my-project/db/custom.db";

    /** URL del backend Next.js (para llamadas API internas si hace falta). */
    public static final String NEXTJS_BASE_URL = "http://localhost:3000";

    /** Número máximo de recomendaciones a devolver. */
    public static final int MAX_RECOMMENDATIONS = 6;

    /** Peso de cada factor en el algoritmo de scoring. */
    public static final double WEIGHT_FOLLOWERS = 0.4;
    public static final double WEIGHT_LIVE_BONUS = 0.35;
    public static final double WEIGHT_LEVEL = 0.15;
    public static final double WEIGHT_COMMUNITY_AFFINITY = 0.10;
}
