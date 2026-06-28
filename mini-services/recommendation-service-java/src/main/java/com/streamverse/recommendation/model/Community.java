package com.streamverse.recommendation.model;

/**
 * Modelo de una comunidad para recomendaciones.
 */
public record Community(
        String id,
        String name,
        String slug,
        String description,
        String category,
        String color,
        int membersCount
) {}
