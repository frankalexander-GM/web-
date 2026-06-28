package com.streamverse.recommendation.service;

import com.streamverse.recommendation.config.AppConfig;
import com.streamverse.recommendation.model.Community;
import com.streamverse.recommendation.model.Streamer;
import com.streamverse.recommendation.repository.DatabaseRepository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Capa de lógica de negocio: algoritmo de recomendaciones.
 *
 * No accede a la BD directamente; recibe los datos del repositorio.
 * Aquí vive el algoritmo de scoring que decide qué streamers/comunidades
 * recomendar a un usuario.
 */
public class RecommendationService {

    private final DatabaseRepository repository;

    public RecommendationService(DatabaseRepository repository) {
        this.repository = repository;
    }

    /**
     * Recomienda streamers priorizando los que están en vivo y tienen más engagement.
     * @param userId ID del usuario (para personalización futura)
     * @return lista de streamers recomendados, ordenada por score descendente
     */
    public List<Streamer> recommendStreamers(String userId) throws Exception {
        List<Streamer> all = repository.findAllStreamers();
        // Ordenar por score de recomendación (descendente)
        return all.stream()
                .sorted(Comparator.comparingDouble(Streamer::recommendationScore).reversed())
                .limit(AppConfig.MAX_RECOMMENDATIONS)
                .collect(Collectors.toList());
    }

    /**
     * Recomienda comunidades más populares (con un poco de aleatoriedad para variedad).
     */
    public List<Community> recommendCommunities(int limit) throws Exception {
        List<Community> top = repository.findTopCommunities(limit * 2);
        // Mezclar ligeramente para que no siempre salgan en el mismo orden
        Collections.shuffle(top, new Random(System.currentTimeMillis() % 7));
        return top.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * Estadísticas agregadas para el dashboard (totales).
     */
    public Map<String, Object> getStats() throws Exception {
        List<Streamer> all = repository.findAllStreamers();
        long liveCount = all.stream().filter(Streamer::isLive).count();
        int totalFollowers = all.stream().mapToInt(Streamer::followersCount).sum();
        int totalViewers = all.stream().filter(Streamer::isLive).mapToInt(Streamer::liveViewers).sum();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalStreamers", all.size());
        stats.put("liveNow", liveCount);
        stats.put("totalFollowers", totalFollowers);
        stats.put("totalLiveViewers", totalViewers);
        stats.put("language", "java");
        return stats;
    }
}
