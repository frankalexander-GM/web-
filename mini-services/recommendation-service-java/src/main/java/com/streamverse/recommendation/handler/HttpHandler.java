package com.streamverse.recommendation.handler;

import com.streamverse.recommendation.model.Community;
import com.streamverse.recommendation.model.Streamer;
import com.streamverse.recommendation.service.RecommendationService;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Capa de transporte HTTP.
 * Serializa los modelos a JSON y maneja las respuestas.
 * No contiene lógica de negocio; delega al servicio.
 */
public class HttpHandler {

    private final RecommendationService service;

    public HttpHandler(RecommendationService service) {
        this.service = service;
    }

    /** Maneja una petición y devuelve la respuesta JSON. */
    public Response handle(String path, String method) {
        try {
            // GET /api/recommendations/streamers
            if ("GET".equalsIgnoreCase(method) && "/api/recommendations/streamers".equals(path)) {
                return ok(streamersToJson(service.recommendStreamers(null)));
            }
            // GET /api/recommendations/communities
            if ("GET".equalsIgnoreCase(method) && "/api/recommendations/communities".equals(path)) {
                return ok(communitiesToJson(service.recommendCommunities(6)));
            }
            // GET /api/stats
            if ("GET".equalsIgnoreCase(method) && "/api/stats".equals(path)) {
                return ok(statsToJson(service.getStats()));
            }
            // GET /api/health
            if ("GET".equalsIgnoreCase(method) && "/api/health".equals(path)) {
                JSONObject health = new JSONObject();
                health.put("status", "ok");
                health.put("service", "recommendation");
                health.put("language", "java");
                return ok(health);
            }
            // 404
            JSONObject err = new JSONObject();
            err.put("error", "Ruta no encontrada");
            err.put("path", path);
            return new Response(404, err.toString());
        } catch (Exception e) {
            JSONObject err = new JSONObject();
            err.put("error", e.getMessage() != null ? e.getMessage() : "Error interno");
            return new Response(500, err.toString());
        }
    }

    /** Convierte una lista de streamers a JSON. */
    private JSONObject streamersToJson(List<Streamer> streamers) {
        JSONArray arr = new JSONArray();
        for (Streamer s : streamers) {
            JSONObject o = new JSONObject();
            o.put("id", s.id());
            o.put("username", s.username());
            o.put("displayName", s.displayName());
            o.put("avatar", s.avatar() != null ? s.avatar() : "");
            o.put("platform", s.platform() != null ? s.platform() : "");
            o.put("channelHandle", s.channelHandle() != null ? s.channelHandle() : "");
            o.put("level", s.level());
            o.put("followersCount", s.followersCount());
            o.put("isLive", s.isLive());
            o.put("liveViewers", s.liveViewers());
            o.put("liveTitle", s.liveTitle() != null ? s.liveTitle() : "");
            o.put("liveCategory", s.liveCategory() != null ? s.liveCategory() : "");
            o.put("score", s.recommendationScore());
            arr.put(o);
        }
        JSONObject wrapper = new JSONObject();
        wrapper.put("recommendations", arr);
        wrapper.put("language", "java");
        return wrapper;
    }

    private JSONObject communitiesToJson(List<Community> communities) {
        JSONArray arr = new JSONArray();
        for (Community c : communities) {
            JSONObject o = new JSONObject();
            o.put("id", c.id());
            o.put("name", c.name());
            o.put("slug", c.slug());
            o.put("description", c.description());
            o.put("category", c.category());
            o.put("color", c.color());
            o.put("membersCount", c.membersCount());
            arr.put(o);
        }
        JSONObject wrapper = new JSONObject();
        wrapper.put("recommendations", arr);
        wrapper.put("language", "java");
        return wrapper;
    }

    private JSONObject statsToJson(Map<String, Object> stats) {
        JSONObject o = new JSONObject();
        for (Map.Entry<String, Object> e : stats.entrySet()) {
            o.put(e.getKey(), e.getValue());
        }
        return o;
    }

    private Response ok(JSONObject body) {
        return new Response(200, body.toString());
    }

    /** Estructura de respuesta HTTP. */
    public static class Response {
        public final int status;
        public final String body;
        public Response(int status, String body) {
            this.status = status;
            this.body = body;
        }
    }

    /** Escribe una respuesta al OutputStream con las cabeceras CORS. */
    public static void writeResponse(OutputStream out, Response resp) throws IOException {
        byte[] body = resp.body.getBytes(StandardCharsets.UTF_8);
        String headers = "HTTP/1.1 " + resp.status + " OK\r\n" +
                "Content-Type: application/json; charset=utf-8\r\n" +
                "Content-Length: " + body.length + "\r\n" +
                "Access-Control-Allow-Origin: *\r\n" +
                "Access-Control-Allow-Methods: GET, OPTIONS\r\n" +
                "Access-Control-Allow-Headers: Content-Type\r\n" +
                "Connection: close\r\n\r\n";
        out.write(headers.getBytes(StandardCharsets.US_ASCII));
        out.write(body);
        out.flush();
    }
}
