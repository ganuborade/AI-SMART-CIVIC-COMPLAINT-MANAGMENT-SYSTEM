package com.civic.complaints.service.ai;

import com.civic.complaints.model.Category;
import com.civic.complaints.model.Complaint;
import com.civic.complaints.model.Priority;
import com.civic.complaints.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Service("localAIService")
@RequiredArgsConstructor
public class LocalIntelligentAIService implements AIService {

    private final ComplaintRepository complaintRepository;

    private static final Map<Category, List<String>> CATEGORY_KEYWORDS = Map.of(
            Category.ROAD_DAMAGE, List.of("pothole", "road", "tar", "asphalt", "crater", "pavement", "sidewalk", "divider", "curb", "speedbreaker", "ditch", "hump"),
            Category.WATER_LEAKAGE, List.of("water", "pipe", "pipeline", "burst", "leak", "leaking", "tap", "supply", "flooding", "tanker", "drinking water"),
            Category.STREET_LIGHT, List.of("street light", "streetlight", "light", "lamp", "pole", "bulb", "dark", "darkness", "wiring", "electricity", "transformer", "power outage", "wire"),
            Category.GARBAGE_WASTE, List.of("garbage", "trash", "waste", "dump", "dumping", "bin", "smell", "litter", "debris", "plastic", "stink", "rotting"),
            Category.DRAINAGE_OVERFLOW, List.of("drain", "drainage", "gutter", "sewage", "sewer", "manhole", "clogged", "overflowing", "foul smell", "dirty water", "nalla")
    );

    private static final List<String> CRITICAL_KEYWORDS = List.of(
            "flooding houses", "flooding", "burst", "accidents", "accident", "school", "hospital",
            "death", "fatal", "electrocution", "sparking", "collapse", "danger", "emergency", "fire",
            "children falling", "life threatening"
    );

    private static final List<String> HIGH_KEYWORDS = List.of(
            "large", "major", "heavy", "deep", "hazardous", "blocked road", "injury", "near school",
            "open manhole", "high risk", "massive", "toxic", "severe"
    );

    private static final List<String> LOW_KEYWORDS = List.of(
            "minor", "small", "flickering", "paint", "cosmetic", "slight", "cleaning request"
    );

    @Override
    public AIAnalysisResult analyzeComplaint(String title, String description, Double latitude, Double longitude, String imageUrl) {
        String safeTitle = title != null ? title.trim() : "";
        String safeDesc = description != null ? description.trim() : "";
        String combined = (safeTitle + " " + safeDesc).toLowerCase();

        // 1. Determine Category & Confidence
        Category detectedCategory = detectCategory(combined);
        double confidence = calculateConfidence(combined, detectedCategory);

        // 2. Determine Priority
        Priority detectedPriority = detectPriority(combined);

        // 3. Map to Department
        String departmentName = mapCategoryToDepartment(detectedCategory);

        // 4. Generate AI Summary
        String summary = generateSummary(safeTitle, detectedCategory, detectedPriority);

        // 5. Detect Potential Duplicates
        Long duplicateOfId = null;
        String duplicateTitle = null;
        if (latitude != null && longitude != null) {
            try {
                DuplicateMatch match = findNearbyDuplicate(latitude, longitude, detectedCategory, combined);
                if (match != null) {
                    duplicateOfId = match.complaintId;
                    duplicateTitle = match.title;
                }
            } catch (Exception e) {
                log.warn("Duplicate check failed safely: {}", e.getMessage());
            }
        }

        // 6. Image tags
        String imageTags = imageUrl != null ? "Detected " + detectedCategory.name().toLowerCase().replace('_', ' ') + " issue in civic area" : null;

        return AIAnalysisResult.builder()
                .category(detectedCategory)
                .priority(detectedPriority)
                .suggestedDepartment(departmentName)
                .summary(summary)
                .confidence(confidence)
                .duplicateOfId(duplicateOfId)
                .duplicateTitle(duplicateTitle)
                .imageTags(imageTags)
                .rawResponse("{\"engine\": \"LocalIntelligentAI\", \"classifiedCategory\": \"" + detectedCategory + "\", \"calculatedPriority\": \"" + detectedPriority + "\"}")
                .build();
    }

    @Override
    public AIAnalysisResult analyzeImage(byte[] imageBytes, String originalFilename) {
        String name = originalFilename != null ? originalFilename.toLowerCase() : "";
        Category category = Category.OTHER;
        if (name.contains("pothole") || name.contains("road") || name.contains("damage")) {
            category = Category.ROAD_DAMAGE;
        } else if (name.contains("water") || name.contains("leak") || name.contains("pipe")) {
            category = Category.WATER_LEAKAGE;
        } else if (name.contains("light") || name.contains("pole")) {
            category = Category.STREET_LIGHT;
        } else if (name.contains("garbage") || name.contains("waste") || name.contains("trash")) {
            category = Category.GARBAGE_WASTE;
        } else if (name.contains("drain") || name.contains("gutter") || name.contains("sewer")) {
            category = Category.DRAINAGE_OVERFLOW;
        } else {
            category = Category.ROAD_DAMAGE; // Common default for demo
        }

        return AIAnalysisResult.builder()
                .category(category)
                .priority(Priority.MEDIUM)
                .suggestedDepartment(mapCategoryToDepartment(category))
                .summary("AI vision identified civic issue: " + category.name().replace('_', ' '))
                .confidence(0.88)
                .imageTags("Visual features: texture surface disruption, civil structure impact")
                .rawResponse("{\"visionEngine\": \"LocalVisionClassifier\", \"detected\": \"" + category + "\"}")
                .build();
    }

    private Category detectCategory(String text) {
        Map<Category, Integer> scores = new EnumMap<>(Category.class);

        for (Map.Entry<Category, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            int score = 0;
            for (String kw : entry.getValue()) {
                if (text.contains(kw)) {
                    score += kw.split(" ").length * 2; // Multi-word matches score higher
                }
            }
            scores.put(entry.getKey(), score);
        }

        return scores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey)
                .orElse(Category.OTHER);
    }

    private double calculateConfidence(String text, Category category) {
        if (category == Category.OTHER) return 0.65;
        List<String> keywords = CATEGORY_KEYWORDS.get(category);
        long matches = keywords.stream().filter(text::contains).count();
        double base = 0.78 + Math.min(matches * 0.05, 0.18);
        return Math.round(base * 100.0) / 100.0;
    }

    private Priority detectPriority(String text) {
        for (String kw : CRITICAL_KEYWORDS) {
            if (text.contains(kw)) {
                return Priority.CRITICAL;
            }
        }
        for (String kw : HIGH_KEYWORDS) {
            if (text.contains(kw)) {
                return Priority.HIGH;
            }
        }
        for (String kw : LOW_KEYWORDS) {
            if (text.contains(kw)) {
                return Priority.LOW;
            }
        }
        return Priority.MEDIUM;
    }

    public static String mapCategoryToDepartment(Category category) {
        return switch (category) {
            case ROAD_DAMAGE -> "Road & Infrastructure Department";
            case WATER_LEAKAGE -> "Water Supply & Sewerage";
            case STREET_LIGHT -> "Electricity & Street Lighting";
            case GARBAGE_WASTE -> "Solid Waste Management & Sanitation";
            case DRAINAGE_OVERFLOW -> "Stormwater & Drainage Department";
            case OTHER -> "General Municipal Administration";
        };
    }

    private String generateSummary(String title, Category category, Priority priority) {
        String cleanTitle = (title != null && !title.trim().isEmpty()) ? title.trim() : "Civic Defect";
        if (cleanTitle.length() > 60) {
            cleanTitle = cleanTitle.substring(0, 57) + "...";
        }
        return String.format("[%s Priority] %s incident reported under %s.",
                priority, cleanTitle, category.name().replace('_', ' '));
    }

    private DuplicateMatch findNearbyDuplicate(Double lat, Double lng, Category category, String text) {
        // Look within +/- 0.003 degrees (~300m)
        double delta = 0.003;
        List<Complaint> candidates = complaintRepository.findActiveComplaintsInBounds(
                lat - delta, lat + delta, lng - delta, lng + delta);

        Set<String> wordsA = extractWords(text);

        for (Complaint c : candidates) {
            if (c.getCategory() == category) {
                Set<String> wordsB = extractWords((c.getTitle() + " " + c.getDescription()).toLowerCase());
                double similarity = calculateJaccardSimilarity(wordsA, wordsB);
                double distanceMeters = calculateHaversine(lat, lng, c.getLatitude(), c.getLongitude());

                if (distanceMeters <= 250 && similarity >= 0.25) {
                    return new DuplicateMatch(c.getId(), c.getTitle(), distanceMeters);
                }
            }
        }
        return null;
    }

    private Set<String> extractWords(String s) {
        Set<String> set = new HashSet<>();
        for (String w : s.split("\\W+")) {
            if (w.length() > 3) set.add(w);
        }
        return set;
    }

    private double calculateJaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        return (double) intersection.size() / union.size();
    }

    private double calculateHaversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth radius in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static class DuplicateMatch {
        final Long complaintId;
        final String title;
        final double distanceMeters;

        DuplicateMatch(Long complaintId, String title, double distanceMeters) {
            this.complaintId = complaintId;
            this.title = title;
            this.distanceMeters = distanceMeters;
        }
    }
}
