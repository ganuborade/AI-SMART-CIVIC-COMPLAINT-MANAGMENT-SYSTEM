package com.civic.complaints.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRequest {
    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long employeeId; // Optional: can be assigned to department first, or direct to employee

    private String notes;
}
