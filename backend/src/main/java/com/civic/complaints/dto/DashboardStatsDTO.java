package com.civic.complaints.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalComplaints;
    private long pendingReview;
    private long inProgress;
    private long resolved;
    private long critical;
    private double avgResolutionRating;
    private Map<String, Long> complaintsByCategory;
    private Map<String, Long> complaintsByPriority;
    private Map<String, Long> complaintsByDepartment;
}
