package com.civic.complaints.service.ai;

import com.civic.complaints.model.Category;
import com.civic.complaints.model.Priority;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service("geminiAIService")
public class GeminiAIService implements AIService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    @Override
    public AIAnalysisResult analyzeComplaint(String title, String description, Double latitude, Double longitude, String imageUrl) {
        if (!isConfigured()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        try {
            String prompt = String.format("""
                You are an AI civic management assistant. Analyze the following citizen complaint:
                Title: %s
                Description: %s

                Respond with ONLY valid JSON strictly adhering to this schema:
                {
                  "category": "ROAD_DAMAGE" | "WATER_LEAKAGE" | "STREET_LIGHT" | "GARBAGE_WASTE" | "DRAINAGE_OVERFLOW" | "OTHER",
                  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                  "suggestedDepartment": "string",
                  "summary": "1-sentence concise description",
                  "confidence": 0.0 to 1.0
                }
                """, title, description);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> body = Map.of("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String textResponse = root.path("candidates").get(0)
                        .path("content").path("parts").get(0).path("text").asText();

                // Robust JSON extraction
                String cleanJson = extractJson(textResponse);
                JsonNode parsed = objectMapper.readTree(cleanJson);

                Category category = parseCategory(parsed.path("category").asText(Category.OTHER.name()));
                Priority priority = parsePriority(parsed.path("priority").asText(Priority.MEDIUM.name()));
                String department = parsed.path("suggestedDepartment").asText("Municipal Administration");
                String summary = parsed.path("summary").asText(title);
                double confidence = parsed.path("confidence").asDouble(0.90);

                return AIAnalysisResult.builder()
                        .category(category)
                        .priority(priority)
                        .suggestedDepartment(department)
                        .summary(summary)
                        .confidence(confidence)
                        .rawResponse(textResponse)
                        .build();
            }
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            throw new RuntimeException("Gemini processing error: " + e.getMessage(), e);
        }

        throw new RuntimeException("Empty response from Gemini API");
    }

    @Override
    public AIAnalysisResult analyzeImage(byte[] imageBytes, String originalFilename) {
        if (!isConfigured()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        try {
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String mimeType = originalFilename.endsWith(".png") ? "image/png" : "image/jpeg";

            String prompt = """
                Identify the civic issue in this photo.
                Respond with ONLY valid JSON:
                {
                  "category": "ROAD_DAMAGE" | "WATER_LEAKAGE" | "STREET_LIGHT" | "GARBAGE_WASTE" | "DRAINAGE_OVERFLOW" | "OTHER",
                  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                  "suggestedDepartment": "string",
                  "summary": "1-sentence description of visible problem",
                  "confidence": 0.0 to 1.0,
                  "imageTags": "comma-separated tags of visible objects"
                }
                """;

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            Map<String, Object> inlineData = Map.of("mimeType", mimeType, "data", base64Image);
            Map<String, Object> imagePart = Map.of("inlineData", inlineData);
            Map<String, Object> textPart = Map.of("text", prompt);

            Map<String, Object> content = Map.of("parts", List.of(imagePart, textPart));
            Map<String, Object> body = Map.of("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String textResponse = root.path("candidates").get(0)
                        .path("content").path("parts").get(0).path("text").asText();

                String cleanJson = extractJson(textResponse);
                JsonNode parsed = objectMapper.readTree(cleanJson);

                Category category = parseCategory(parsed.path("category").asText(Category.OTHER.name()));
                Priority priority = parsePriority(parsed.path("priority").asText(Priority.MEDIUM.name()));
                String department = parsed.path("suggestedDepartment").asText("Municipal Administration");
                String summary = parsed.path("summary").asText("Civic issue detected from photo");
                double confidence = parsed.path("confidence").asDouble(0.92);
                String imageTags = parsed.path("imageTags").asText("civic, damage, infrastructure");

                return AIAnalysisResult.builder()
                        .category(category)
                        .priority(priority)
                        .suggestedDepartment(department)
                        .summary(summary)
                        .confidence(confidence)
                        .imageTags(imageTags)
                        .rawResponse(textResponse)
                        .build();
            }
        } catch (Exception e) {
            log.error("Gemini Image API call failed: {}", e.getMessage());
            throw new RuntimeException("Gemini vision error: " + e.getMessage(), e);
        }

        throw new RuntimeException("Empty response from Gemini vision API");
    }

    private String extractJson(String text) {
        if (text == null) return "{}";
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return text.substring(start, end + 1);
        }
        return text.replace("```json", "").replace("```", "").trim();
    }

    private Category parseCategory(String val) {
        if (val == null) return Category.OTHER;
        try {
            return Category.valueOf(val.trim().toUpperCase());
        } catch (Exception e) {
            for (Category c : Category.values()) {
                if (c.name().equalsIgnoreCase(val.trim()) || val.trim().toUpperCase().contains(c.name())) {
                    return c;
                }
            }
            return Category.OTHER;
        }
    }

    private Priority parsePriority(String val) {
        if (val == null) return Priority.MEDIUM;
        try {
            return Priority.valueOf(val.trim().toUpperCase());
        } catch (Exception e) {
            return Priority.MEDIUM;
        }
    }
}
