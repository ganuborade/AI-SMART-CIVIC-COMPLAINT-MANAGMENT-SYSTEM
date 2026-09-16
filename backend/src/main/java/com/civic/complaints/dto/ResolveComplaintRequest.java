package com.civic.complaints.dto;

import lombok.Data;

@Data
public class ResolveComplaintRequest {
    private String notes;
    private String resolutionImageUrl; // AFTER photo
}
