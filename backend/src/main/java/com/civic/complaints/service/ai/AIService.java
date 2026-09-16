package com.civic.complaints.service.ai;

public interface AIService {
    AIAnalysisResult analyzeComplaint(String title, String description, Double latitude, Double longitude, String imageUrl);
    AIAnalysisResult analyzeImage(byte[] imageBytes, String originalFilename);
}
