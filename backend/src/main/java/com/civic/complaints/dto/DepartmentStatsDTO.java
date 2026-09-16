package com.civic.complaints.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatsDTO {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String contactEmail;
    private String contactPhone;
    private String headName;
    private long totalComplaints;
    private long pendingComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;
    private long officerCount;
}
