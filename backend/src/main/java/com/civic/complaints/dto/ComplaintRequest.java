package com.civic.complaints.dto;

import com.civic.complaints.model.Category;
import com.civic.complaints.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComplaintRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private Category category; // Optional - AI can auto-detect

    private Priority priority; // Optional - AI can auto-detect

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String address;
}
