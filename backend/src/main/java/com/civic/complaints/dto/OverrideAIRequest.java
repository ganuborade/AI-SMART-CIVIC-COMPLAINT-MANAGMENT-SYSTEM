package com.civic.complaints.dto;

import com.civic.complaints.model.Category;
import com.civic.complaints.model.Priority;
import lombok.Data;

@Data
public class OverrideAIRequest {
    private Category category;
    private Priority priority;
    private Long departmentId;
    private String reason;
}
