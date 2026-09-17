package com.civic.complaints.controller;

import com.civic.complaints.service.ai.AIAnalysisResult;
import com.civic.complaints.service.ai.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/analyze-complaint")
    public ResponseEntity<AIAnalysisResult> analyzeComplaint(@RequestBody Map<String, Object> body) {
        String title = body.get("title") != null ? body.get("title").toString() : "";
        String description = body.get("description") != null ? body.get("description").toString() : "";
        Double lat = null;
        if (body.get("latitude") != null) {
            try {
                lat = Double.valueOf(body.get("latitude").toString());
            } catch (NumberFormatException ignored) {}
        }
        Double lng = null;
        if (body.get("longitude") != null) {
            try {
                lng = Double.valueOf(body.get("longitude").toString());
            } catch (NumberFormatException ignored) {}
        }
        String imageUrl = body.get("imageUrl") != null ? body.get("imageUrl").toString() : null;

        log.info("API analyze-complaint received: title='{}', lat={}, lng={}", title, lat, lng);
        AIAnalysisResult result = aiService.analyzeComplaint(title, description, lat, lng, imageUrl);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/analyze-image")
    public ResponseEntity<AIAnalysisResult> analyzeImage(@RequestParam(value = "image", required = false) MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(aiService.analyzeImage(file.getBytes(), file.getOriginalFilename()));
    }
}
