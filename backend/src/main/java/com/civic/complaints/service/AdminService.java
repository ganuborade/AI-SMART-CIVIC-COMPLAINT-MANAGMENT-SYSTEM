package com.civic.complaints.service;

import com.civic.complaints.dto.AssignRequest;
import com.civic.complaints.dto.ComplaintResponse;
import com.civic.complaints.dto.DashboardStatsDTO;
import com.civic.complaints.dto.OverrideAIRequest;
import com.civic.complaints.model.*;
import com.civic.complaints.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final ComplaintService complaintService;
    private final NotificationService notificationService;

    public DashboardStatsDTO getDashboardStats() {
        List<Complaint> all = complaintRepository.findAll();

        long total = all.size();
        long pending = all.stream().filter(c -> c.getStatus() == ComplaintStatus.SUBMITTED
                || c.getStatus() == ComplaintStatus.AI_ANALYZED
                || c.getStatus() == ComplaintStatus.UNDER_REVIEW).count();

        long inProgress = all.stream().filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED
                || c.getStatus() == ComplaintStatus.IN_PROGRESS).count();

        long resolved = all.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED
                || c.getStatus() == ComplaintStatus.CLOSED).count();

        long critical = all.stream().filter(c -> c.getPriority() == Priority.CRITICAL).count();

        Map<String, Long> byCategory = all.stream()
                .collect(Collectors.groupingBy(c -> c.getCategory().name(), Collectors.counting()));

        Map<String, Long> byPriority = all.stream()
                .collect(Collectors.groupingBy(c -> c.getPriority().name(), Collectors.counting()));

        Map<String, Long> byDept = new HashMap<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department d : departments) {
            long count = all.stream()
                    .filter(c -> c.getAssignment() != null && c.getAssignment().getDepartment().getId().equals(d.getId()))
                    .count();
            byDept.put(d.getName(), count);
        }

        List<Feedback> allFeedback = feedbackRepository.findAll();
        double avgRating = allFeedback.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(4.5);

        return DashboardStatsDTO.builder()
                .totalComplaints(total)
                .pendingReview(pending)
                .inProgress(inProgress)
                .resolved(resolved)
                .critical(critical)
                .avgResolutionRating(Math.round(avgRating * 10.0) / 10.0)
                .complaintsByCategory(byCategory)
                .complaintsByPriority(byPriority)
                .complaintsByDepartment(byDept)
                .build();
    }

    @Transactional
    public ComplaintResponse assignComplaint(Long complaintId, AssignRequest request, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found: " + request.getDepartmentId()));

        User employee = null;
        if (request.getEmployeeId() != null) {
            employee = userRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + request.getEmployeeId()));
        }

        Assignment assignment = complaint.getAssignment();
        if (assignment == null) {
            assignment = Assignment.builder()
                    .complaint(complaint)
                    .department(department)
                    .employee(employee)
                    .assignedAt(LocalDateTime.now())
                    .notes(request.getNotes())
                    .build();
        } else {
            assignment.setDepartment(department);
            assignment.setEmployee(employee);
            assignment.setNotes(request.getNotes());
        }
        assignment = assignmentRepository.save(assignment);
        complaint.setAssignment(assignment);

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        String employeeText = employee != null ? " and officer " + employee.getName() : "";
        complaintService.recordStatusChange(
                complaint,
                oldStatus,
                ComplaintStatus.ASSIGNED,
                admin,
                "Assigned to " + department.getName() + employeeText + (request.getNotes() != null ? ". Notes: " + request.getNotes() : "")
        );

        complaint = complaintRepository.save(complaint);

        // Notify Citizen
        notificationService.createNotification(
                complaint.getCitizen(),
                "Complaint #" + complaint.getId() + " Assigned",
                "Your complaint has been assigned to " + department.getName() + " for prompt action.",
                "ASSIGNMENT",
                complaint.getId()
        );

        // Notify Employee if directly assigned
        if (employee != null) {
            notificationService.createNotification(
                    employee,
                    "New Task Assigned: #" + complaint.getId(),
                    "You have been assigned to resolve: " + complaint.getTitle(),
                    "TASK_ASSIGNED",
                    complaint.getId()
            );
        }

        return complaintService.mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse overrideAI(Long complaintId, OverrideAIRequest request, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        StringBuilder comment = new StringBuilder("Admin adjusted AI recommendations:");
        if (request.getCategory() != null && request.getCategory() != complaint.getCategory()) {
            comment.append(" Category: ").append(complaint.getCategory()).append(" -> ").append(request.getCategory()).append(";");
            complaint.setCategory(request.getCategory());
        }
        if (request.getPriority() != null && request.getPriority() != complaint.getPriority()) {
            comment.append(" Priority: ").append(complaint.getPriority()).append(" -> ").append(request.getPriority()).append(";");
            complaint.setPriority(request.getPriority());
        }
        if (request.getReason() != null) {
            comment.append(" Reason: ").append(request.getReason());
        }

        complaintService.recordStatusChange(
                complaint,
                complaint.getStatus(),
                complaint.getStatus(),
                admin,
                comment.toString()
        );

        complaint = complaintRepository.save(complaint);
        return complaintService.mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse rejectComplaint(Long complaintId, String reason, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.REJECTED);

        complaintService.recordStatusChange(
                complaint,
                oldStatus,
                ComplaintStatus.REJECTED,
                admin,
                "Complaint rejected. Reason: " + (reason != null ? reason : "Insufficient details or out of jurisdiction.")
        );

        complaint = complaintRepository.save(complaint);

        notificationService.createNotification(
                complaint.getCitizen(),
                "Complaint #" + complaint.getId() + " Rejected",
                "Your complaint could not be processed: " + reason,
                "REJECTION",
                complaint.getId()
        );

        return complaintService.mapToResponse(complaint);
    }

    public List<User> getEmployees(Long departmentId) {
        if (departmentId != null) {
            return userRepository.findByDepartmentId(departmentId);
        }
        return userRepository.findByRole(Role.EMPLOYEE);
    }
}
