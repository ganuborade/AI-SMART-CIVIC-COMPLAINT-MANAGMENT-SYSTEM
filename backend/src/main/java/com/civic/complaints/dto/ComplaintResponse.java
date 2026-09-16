package com.civic.complaints.dto;

import com.civic.complaints.model.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {
    private Long id;
    private Long citizenId;
    private String citizenName;
    private String citizenEmail;
    private String citizenPhone;
    private String title;
    private String description;
    private Category category;
    private Priority priority;
    private Double latitude;
    private Double longitude;
    private String address;
    private ComplaintStatus status;
    private Double aiConfidence;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private AIAnalysisDTO aiAnalysis;
    private List<ImageDTO> images;
    private List<StatusHistoryDTO> statusHistory;
    private AssignmentDTO assignment;
    private FeedbackDTO feedback;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageDTO {
        private Long id;
        private String imageUrl;
        private ImageType imageType;
        private LocalDateTime uploadedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusHistoryDTO {
        private Long id;
        private ComplaintStatus oldStatus;
        private ComplaintStatus newStatus;
        private String changedByName;
        private String comment;
        private LocalDateTime changedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentDTO {
        private Long id;
        private Long departmentId;
        private String departmentName;
        private Long employeeId;
        private String employeeName;
        private LocalDateTime assignedAt;
        private LocalDateTime completedAt;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackDTO {
        private Long id;
        private Integer rating;
        private String comments;
        private LocalDateTime createdAt;
    }
}
