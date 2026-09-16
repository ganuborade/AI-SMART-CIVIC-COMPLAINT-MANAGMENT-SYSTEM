package com.civic.complaints.service;

import com.civic.complaints.dto.ComplaintRequest;
import com.civic.complaints.dto.ComplaintResponse;
import com.civic.complaints.dto.FeedbackRequest;
import com.civic.complaints.dto.AIAnalysisDTO;
import com.civic.complaints.model.*;
import com.civic.complaints.repository.*;
import com.civic.complaints.service.ai.AIAnalysisResult;
import com.civic.complaints.service.ai.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintImageRepository imageRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final FeedbackRepository feedbackRepository;
    private final AIService aiService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, User citizen, MultipartFile image) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeFile(image);
        }

        // 1. Run AI Analysis
        AIAnalysisResult aiResult = aiService.analyzeComplaint(
                request.getTitle(),
                request.getDescription(),
                request.getLatitude(),
                request.getLongitude(),
                imageUrl
        );

        // 2. Set Category & Priority (use AI detection if not explicitly specified by user)
        Category category = request.getCategory() != null ? request.getCategory() : aiResult.getCategory();
        Priority priority = request.getPriority() != null ? request.getPriority() : aiResult.getPriority();

        // 3. Create and save Complaint entity
        Complaint complaint = Complaint.builder()
                .citizen(citizen)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .priority(priority)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .status(ComplaintStatus.SUBMITTED)
                .aiConfidence(aiResult.getConfidence())
                .build();

        complaint = complaintRepository.save(complaint);

        // 4. Attach Image
        if (imageUrl != null) {
            ComplaintImage complaintImage = ComplaintImage.builder()
                    .complaint(complaint)
                    .imageUrl(imageUrl)
                    .imageType(ImageType.BEFORE)
                    .build();
            imageRepository.save(complaintImage);
        }

        // 5. Initial Status History: SUBMITTED
        recordStatusChange(complaint, null, ComplaintStatus.SUBMITTED, citizen, "Complaint filed by citizen.");

        // 6. Save AI Analysis record
        AIAnalysis aiAnalysis = AIAnalysis.builder()
                .complaint(complaint)
                .category(aiResult.getCategory())
                .priority(aiResult.getPriority())
                .suggestedDepartment(aiResult.getSuggestedDepartment())
                .summary(aiResult.getSummary())
                .confidence(aiResult.getConfidence())
                .duplicateOfId(aiResult.getDuplicateOfId())
                .imageTags(aiResult.getImageTags())
                .aiResponse(aiResult.getRawResponse())
                .build();
        aiAnalysisRepository.save(aiAnalysis);
        complaint.setAiAnalysis(aiAnalysis);

        // 7. Transition: SUBMITTED -> AI_ANALYZED -> UNDER_REVIEW
        recordStatusChange(complaint, ComplaintStatus.SUBMITTED, ComplaintStatus.AI_ANALYZED, null,
                "AI categorized as " + aiResult.getCategory() + " with " + aiResult.getPriority() + " priority.");

        complaint.setStatus(ComplaintStatus.UNDER_REVIEW);
        recordStatusChange(complaint, ComplaintStatus.AI_ANALYZED, ComplaintStatus.UNDER_REVIEW, null,
                "Complaint moved to Under Review for Admin verification.");

        complaint = complaintRepository.save(complaint);

        // 8. Notification
        notificationService.createNotification(
                citizen,
                "Complaint Registered: #" + complaint.getId(),
                "Your complaint '" + complaint.getTitle() + "' has been analyzed by AI and queued for review.",
                "SUBMISSION",
                complaint.getId()
        );

        return mapToResponse(complaint);
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        return mapToResponse(complaint);
    }

    public List<ComplaintResponse> getCitizenComplaints(Long citizenId) {
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllWithDetails()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse addFeedback(Long complaintId, User citizen, FeedbackRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new IllegalArgumentException("Only the citizen who submitted the complaint can provide feedback.");
        }

        if (complaint.getStatus() != ComplaintStatus.RESOLVED && complaint.getStatus() != ComplaintStatus.CLOSED) {
            throw new IllegalStateException("Feedback can only be submitted after resolution.");
        }

        Feedback feedback = Feedback.builder()
                .complaint(complaint)
                .citizen(citizen)
                .rating(request.getRating())
                .comments(request.getComments())
                .build();
        feedbackRepository.save(feedback);
        complaint.setFeedback(feedback);

        // Transition to CLOSED if not already closed
        if (complaint.getStatus() == ComplaintStatus.RESOLVED) {
            ComplaintStatus oldStatus = complaint.getStatus();
            complaint.setStatus(ComplaintStatus.CLOSED);
            recordStatusChange(complaint, oldStatus, ComplaintStatus.CLOSED, citizen,
                    "Citizen rated " + request.getRating() + "/5 stars. Complaint officially closed.");
            complaint = complaintRepository.save(complaint);
        }

        return mapToResponse(complaint);
    }

    public void recordStatusChange(Complaint complaint, ComplaintStatus oldStatus, ComplaintStatus newStatus, User changedBy, String comment) {
        ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .comment(comment)
                .build();
        historyRepository.save(history);
    }

    public ComplaintResponse mapToResponse(Complaint c) {
        AIAnalysisDTO aiDto = null;
        if (c.getAiAnalysis() != null) {
            String dupTitle = null;
            if (c.getAiAnalysis().getDuplicateOfId() != null) {
                dupTitle = complaintRepository.findById(c.getAiAnalysis().getDuplicateOfId())
                        .map(Complaint::getTitle).orElse(null);
            }

            aiDto = AIAnalysisDTO.builder()
                    .category(c.getAiAnalysis().getCategory())
                    .priority(c.getAiAnalysis().getPriority())
                    .suggestedDepartment(c.getAiAnalysis().getSuggestedDepartment())
                    .summary(c.getAiAnalysis().getSummary())
                    .confidence(c.getAiAnalysis().getConfidence())
                    .duplicateOfId(c.getAiAnalysis().getDuplicateOfId())
                    .duplicateTitle(dupTitle)
                    .imageTags(c.getAiAnalysis().getImageTags())
                    .rawResponse(c.getAiAnalysis().getAiResponse())
                    .build();
        }

        List<ComplaintResponse.ImageDTO> images = imageRepository.findByComplaintId(c.getId())
                .stream()
                .map(img -> ComplaintResponse.ImageDTO.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .imageType(img.getImageType())
                        .uploadedAt(img.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        List<ComplaintResponse.StatusHistoryDTO> history = historyRepository.findByComplaintIdOrderByChangedAtAsc(c.getId())
                .stream()
                .map(h -> ComplaintResponse.StatusHistoryDTO.builder()
                        .id(h.getId())
                        .oldStatus(h.getOldStatus())
                        .newStatus(h.getNewStatus())
                        .changedByName(h.getChangedBy() != null ? h.getChangedBy().getName() : "System AI")
                        .comment(h.getComment())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());

        ComplaintResponse.AssignmentDTO assignmentDto = null;
        if (c.getAssignment() != null) {
            Assignment a = c.getAssignment();
            assignmentDto = ComplaintResponse.AssignmentDTO.builder()
                    .id(a.getId())
                    .departmentId(a.getDepartment().getId())
                    .departmentName(a.getDepartment().getName())
                    .employeeId(a.getEmployee() != null ? a.getEmployee().getId() : null)
                    .employeeName(a.getEmployee() != null ? a.getEmployee().getName() : "Unassigned")
                    .assignedAt(a.getAssignedAt())
                    .completedAt(a.getCompletedAt())
                    .notes(a.getNotes())
                    .build();
        }

        ComplaintResponse.FeedbackDTO feedbackDto = null;
        if (c.getFeedback() != null) {
            Feedback f = c.getFeedback();
            feedbackDto = ComplaintResponse.FeedbackDTO.builder()
                    .id(f.getId())
                    .rating(f.getRating())
                    .comments(f.getComments())
                    .createdAt(f.getCreatedAt())
                    .build();
        }

        return ComplaintResponse.builder()
                .id(c.getId())
                .citizenId(c.getCitizen().getId())
                .citizenName(c.getCitizen().getName())
                .citizenEmail(c.getCitizen().getEmail())
                .citizenPhone(c.getCitizen().getPhone())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .priority(c.getPriority())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .address(c.getAddress())
                .status(c.getStatus())
                .aiConfidence(c.getAiConfidence())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .aiAnalysis(aiDto)
                .images(images)
                .statusHistory(history)
                .assignment(assignmentDto)
                .feedback(feedbackDto)
                .build();
    }
}
