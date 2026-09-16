package com.civic.complaints.service.ai;

import com.civic.complaints.model.Category;
import com.civic.complaints.model.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisResult {
    private Category category;
    private Priority priority;
    private String suggestedDepartment;
    private String summary;
    private Double confidence;
    private Long duplicateOfId;
    private String duplicateTitle;
    private String imageTags;
    private String rawResponse;
}
