package com.civic.complaints.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Slf4j
@Primary
@Service("compositeAIService")
public class AIServiceComposite implements AIService {

    private final GeminiAIService geminiAIService;
    private final LocalIntelligentAIService localAIService;

    public AIServiceComposite(
            @Qualifier("geminiAIService") GeminiAIService geminiAIService,
            @Qualifier("localAIService") LocalIntelligentAIService localAIService) {
        this.geminiAIService = geminiAIService;
        this.localAIService = localAIService;
    }

    @Override
    public AIAnalysisResult analyzeComplaint(String title, String description, Double latitude, Double longitude, String imageUrl) {
        if (geminiAIService.isConfigured()) {
            try {
                log.info("Analyzing complaint using Cloud Gemini AI API...");
                AIAnalysisResult result = geminiAIService.analyzeComplaint(title, description, latitude, longitude, imageUrl);
                try {
                    // Also run local duplicate check
                    AIAnalysisResult localCheck = localAIService.analyzeComplaint(title, description, latitude, longitude, imageUrl);
                    result.setDuplicateOfId(localCheck.getDuplicateOfId());
                    result.setDuplicateTitle(localCheck.getDuplicateTitle());
                } catch (Throwable t) {
                    log.warn("Local duplicate check warning: {}", t.getMessage());
                }
                return result;
            } catch (Throwable e) {
                log.warn("Gemini API call failed ({}), falling back to Local Intelligent AI Engine", e.getMessage());
            }
        }
        log.info("Analyzing complaint using Built-in Local Intelligent AI Engine...");
        return localAIService.analyzeComplaint(title, description, latitude, longitude, imageUrl);
    }

    @Override
    public AIAnalysisResult analyzeImage(byte[] imageBytes, String originalFilename) {
        if (geminiAIService.isConfigured()) {
            try {
                log.info("Analyzing image using Cloud Gemini Vision API...");
                return geminiAIService.analyzeImage(imageBytes, originalFilename);
            } catch (Throwable e) {
                log.warn("Gemini Vision API call failed ({}), falling back to Local Vision Heuristics", e.getMessage());
            }
        }
        log.info("Analyzing image using Local Vision Heuristics...");
        return localAIService.analyzeImage(imageBytes, originalFilename);
    }
}
