package com.streamverse.recommendation.repository;

import com.streamverse.recommendation.config.AppConfig;
import com.streamverse.recommendation.model.Community;
import com.streamverse.recommendation.model.Streamer;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/**
 * Capa de acceso a datos (Repository Pattern).
 * Aísla todo el SQL del resto de la aplicación.
 * Lee de la misma base SQLite que Prisma/Next.js.
 */
public class DatabaseRepository {

    private static final Logger LOGGER = Logger.getLogger(DatabaseRepository.class.getName());

    private Connection connection;

    /** Abre la conexión a SQLite y carga el driver. */
    public void connect() throws SQLException {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new SQLException("Driver SQLite no encontrado", e);
        }
        connection = DriverManager.getConnection("jdbc:sqlite:" + AppConfig.DB_PATH);
        System.out.println("[repo] Conectado a SQLite: " + AppConfig.DB_PATH);
    }

    /** Cierra la conexión. */
    public void close() {
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                // close fallido no debe tapar el error original
                LOGGER.fine("close de SQLite fallo: " + e.getMessage());
            }
        }
    }

    /**
     * Obtiene todos los streamers con su info de "en vivo" y conteo de followers.
     * Usa LEFT JOINs para traer followers y streams en una sola consulta (evita N+1).
     */
    public List<Streamer> findAllStreamers() throws SQLException {
        String sql = """
            SELECT u.id, u.username, u.displayName, u.avatar, u.platform, u.channelHandle, u.level,
                   (SELECT COUNT(*) FROM follows f WHERE f.followingId = u.id) AS followersCount,
                   s.viewers AS liveViewers, s.title AS liveTitle, s.category AS liveCategory,
                   CASE WHEN s.id IS NOT NULL AND s.isLive = 1 THEN 1 ELSE 0 END AS isLive
            FROM users u
            LEFT JOIN streams s ON s.streamerId = u.id AND s.isLive = 1
            WHERE u.isStreamer = 1
            ORDER BY u.level DESC
            """;
        List<Streamer> result = new ArrayList<>();
        try (PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                result.add(new Streamer(
                        rs.getString("id"),
                        rs.getString("username"),
                        rs.getString("displayName"),
                        rs.getString("avatar"),
                        rs.getString("platform"),
                        rs.getString("channelHandle"),
                        rs.getInt("level"),
                        rs.getInt("followersCount"),
                        rs.getInt("isLive") == 1,
                        rs.getInt("liveViewers"),
                        rs.getString("liveTitle"),
                        rs.getString("liveCategory")
                ));
            }
        }
        return result;
    }

    /** Obtiene las comunidades más populares. */
    public List<Community> findTopCommunities(int limit) throws SQLException {
        String sql = "SELECT id, name, slug, description, category, color, membersCount " +
                     "FROM communities ORDER BY membersCount DESC LIMIT ?";
        List<Community> result = new ArrayList<>();
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    result.add(new Community(
                            rs.getString("id"),
                            rs.getString("name"),
                            rs.getString("slug"),
                            rs.getString("description"),
                            rs.getString("category"),
                            rs.getString("color"),
                            rs.getInt("membersCount")
                    ));
                }
            }
        }
        return result;
    }
}
