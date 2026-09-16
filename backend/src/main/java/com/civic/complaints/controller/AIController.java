package com.civic.complaints.controller;

import com.civic.complaints.service.ai.AIAnalysisResult;
import com.civic.complaints.service.ai.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/analyze-complaint")
    public ResponseEntity<AIAnalysisResult> analyzeComplaint(@RequestBody Map<String, Object> body) {
        String title = (String) body.getOrDefault("title", "");
        String description = (String) body.getOrDefault("description", "");
        Double lat = body.get("latitude") != null ? Double.valueOf(body.get("latitude").toString()) : null;
        Double lng = body.get("longitude") != null ? Double.valueOf(body.get("longitude").toString()) : null;
        String imageUrl = (String) body.get("imageUrl");

        return ResponseEntity.ok(aiService.analyzeComplaint(title, description, lat, lng, imageUrl));
    }

    @PostMapping("/analyze-image")
    public ResponseEntity<AIAnalysisResult> analyzeImage(@RequestParam("image") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(aiService.analyzeImage(file.getBytes(), file.getOriginalFilename()));
    }
}
