package com.streamverse.recommendation;

import com.streamverse.recommendation.config.AppConfig;
import com.streamverse.recommendation.handler.HttpHandler;
import com.streamverse.recommendation.repository.DatabaseRepository;
import com.streamverse.recommendation.service.RecommendationService;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

/**
 * Punto de entrada del servicio de recomendaciones (Java).
 *
 * Arquitectura por capas:
 *   main (este archivo) -> handler (transporte) -> service (lógica) -> repository (datos)
 *
 * Usa el ServerSocket nativo de Java (sin frameworks pesados) para máxima portabilidad.
 * Expone endpoints REST en puerto 3005:
 *   GET /api/health
 *   GET /api/recommendations/streamers
 *   GET /api/recommendations/communities
 *   GET /api/stats
 */
public class Main {

    public static void main(String[] args) throws Exception {
        // 1. Capa de datos
        DatabaseRepository repository = new DatabaseRepository();
        repository.connect();

        // 2. Capa de lógica de negocio
        RecommendationService service = new RecommendationService(repository);

        // 3. Capa de transporte
        HttpHandler handler = new HttpHandler(service);

        // 4. Servidor HTTP nativo
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("[java] Cerrando servicio...");
            repository.close();
        }));

        try (ServerSocket server = new ServerSocket(AppConfig.PORT)) {
            System.out.println("🎯 StreamVerse Recommendation Service (Java) iniciado en puerto " + AppConfig.PORT);
            System.out.println("   Endpoints:");
            System.out.println("     GET /api/health");
            System.out.println("     GET /api/recommendations/streamers");
            System.out.println("     GET /api/recommendations/communities");
            System.out.println("     GET /api/stats");

            while (true) {
                Socket client = server.accept();
                // Atender cada petición en un hilo (concurrencia)
                new Thread(() -> handleRequest(client, handler)).start();
            }
        }
    }

    private static void handleRequest(Socket client, HttpHandler handler) {
        try (BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream(), StandardCharsets.UTF_8));
             OutputStream out = client.getOutputStream()) {

            String requestLine = in.readLine();
            if (requestLine == null || requestLine.isEmpty()) {
                client.close();
                return;
            }
            String[] parts = requestLine.split(" ");
            if (parts.length < 2) {
                client.close();
                return;
            }
            String method = parts[0];
            String fullPath = parts[1];
            // Quitar query string (ej: /api/health?XTransformPort=3005 -> /api/health)
            String path = fullPath.contains("?") ? fullPath.substring(0, fullPath.indexOf('?')) : fullPath;

            // Consumir cabeceras
            String line;
            while ((line = in.readLine()) != null && !line.isEmpty()) {
                /* descartar cabeceras */
            }

            // OPTIONS (preflight CORS)
            if ("OPTIONS".equalsIgnoreCase(method)) {
                String cors = "HTTP/1.1 204 No Content\r\n" +
                        "Access-Control-Allow-Origin: *\r\n" +
                        "Access-Control-Allow-Methods: GET, OPTIONS\r\n" +
                        "Access-Control-Allow-Headers: Content-Type\r\n\r\n";
                out.write(cors.getBytes(StandardCharsets.US_ASCII));
                out.flush();
                return;
            }

            HttpHandler.Response resp = handler.handle(path, method);
            HttpHandler.writeResponse(out, resp);

            System.out.println("[java] " + method + " " + path + " -> " + resp.status);
        } catch (Exception e) {
            System.err.println("[java] Error atendiendo petición: " + e.getMessage());
        } finally {
            try {
                client.close();
            } catch (Exception e) {
                // close fallido no debe tapar el error original
                Logger.getLogger(Main.class.getName()).fine("close del socket fallo: " + e.getMessage());
            }
        }
    }
}
