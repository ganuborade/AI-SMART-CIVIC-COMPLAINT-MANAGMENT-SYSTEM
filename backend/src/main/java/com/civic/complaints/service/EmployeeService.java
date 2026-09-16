package com.civic.complaints.service;

import com.civic.complaints.dto.ComplaintResponse;
import com.civic.complaints.dto.ResolveComplaintRequest;
import com.civic.complaints.model.*;
import com.civic.complaints.repository.AssignmentRepository;
import com.civic.complaints.repository.ComplaintImageRepository;
import com.civic.complaints.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintImageRepository imageRepository;
    private final AssignmentRepository assignmentRepository;
    private final ComplaintService complaintService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public List<ComplaintResponse> getAssignedComplaints(User employee) {
        List<Complaint> complaints;
        if (employee.getDepartment() != null) {
            complaints = complaintRepository.findByDepartmentId(employee.getDepartment().getId());
        } else {
            complaints = complaintRepository.findByEmployeeId(employee.getId());
        }

        return complaints.stream()
                .map(complaintService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse startWork(Long complaintId, User employee) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);

        complaintService.recordStatusChange(
                complaint,
                oldStatus,
                ComplaintStatus.IN_PROGRESS,
                employee,
                "Officer " + employee.getName() + " commenced resolution work on-site."
        );

        complaint = complaintRepository.save(complaint);

        notificationService.createNotification(
                complaint.getCitizen(),
                "Work In Progress: Complaint #" + complaint.getId(),
                "Field team has initiated work on site to fix the reported problem.",
                "WORK_STARTED",
                complaint.getId()
        );

        return complaintService.mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse resolveComplaint(Long complaintId, ResolveComplaintRequest request, MultipartFile afterImage, User employee) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        String imageUrl = null;
        if (afterImage != null && !afterImage.isEmpty()) {
            imageUrl = fileStorageService.storeFile(afterImage);
            ComplaintImage img = ComplaintImage.builder()
                    .complaint(complaint)
                    .imageUrl(imageUrl)
                    .imageType(ImageType.AFTER)
                    .build();
            imageRepository.save(img);
        } else if (request.getResolutionImageUrl() != null) {
            ComplaintImage img = ComplaintImage.builder()
                    .complaint(complaint)
                    .imageUrl(request.getResolutionImageUrl())
                    .imageType(ImageType.AFTER)
                    .build();
            imageRepository.save(img);
        }

        Assignment assignment = complaint.getAssignment();
        if (assignment != null) {
            assignment.setCompletedAt(LocalDateTime.now());
            if (request.getNotes() != null) {
                assignment.setNotes((assignment.getNotes() != null ? assignment.getNotes() + "\n" : "") + "Resolution Note: " + request.getNotes());
            }
            assignmentRepository.save(assignment);
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.RESOLVED);

        String note = request.getNotes() != null ? " Resolution notes: " + request.getNotes() : "";
        complaintService.recordStatusChange(
                complaint,
                oldStatus,
                ComplaintStatus.RESOLVED,
                employee,
                "Work completed successfully by " + employee.getName() + "." + note
        );

        complaint = complaintRepository.save(complaint);

        notificationService.createNotification(
                complaint.getCitizen(),
                "Problem Resolved! Complaint #" + complaint.getId(),
                "Your complaint has been successfully resolved. Please tap to view the resolution and provide your feedback.",
                "RESOLVED",
                complaint.getId()
        );

        return complaintService.mapToResponse(complaint);
    }
}
