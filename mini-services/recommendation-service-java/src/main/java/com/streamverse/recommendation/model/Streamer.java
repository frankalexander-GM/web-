package com.streamverse.recommendation.model;

/**
 * Modelo de un streamer con los datos relevantes para recomendaciones.
 * Es un POJO inmutable (record de Java 21).
 */
public record Streamer(
        String id,
        String username,
        String displayName,
        String avatar,
        String platform,
        String channelHandle,
        int level,
        int followersCount,
        boolean isLive,
        int liveViewers,
        String liveTitle,
        String liveCategory
) {
    /**
     * Calcula un "score" de recomendación basado en followers, si está en vivo, nivel, etc.
     * El algoritmo vive en el modelo para mantener la lógica de negocio cerca de los datos.
     */
    public double recommendationScore() {
        double score = 0;
        // Más followers = más relevante (normalizado logarítmicamente)
        score += Math.log10(followersCount + 1) * AppConfig_weightFollowers();
        // Bonus grande si está en vivo ahora
        if (isLive) {
            score += Math.log10(liveViewers + 1) * AppConfig_weightLiveBonus() + 5;
        }
        // Nivel del streamer
        score += level * AppConfig_weightLevel();
        return score;
    }

    // Constantes de pesos (delegadas a AppConfig)
    private static double AppConfig_weightFollowers() { return 0.4; }
    private static double AppConfig_weightLiveBonus() { return 0.35; }
    private static double AppConfig_weightLevel() { return 0.15; }
}
