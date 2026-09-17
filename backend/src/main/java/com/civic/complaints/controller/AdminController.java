package com.civic.complaints.controller;

import com.civic.complaints.dto.AssignRequest;
import com.civic.complaints.dto.ComplaintResponse;
import com.civic.complaints.dto.DashboardStatsDTO;
import com.civic.complaints.dto.OverrideAIRequest;
import com.civic.complaints.model.User;
import com.civic.complaints.repository.NotificationRepository;
import com.civic.complaints.repository.UserRepository;
import com.civic.complaints.security.UserPrincipal;
import com.civic.complaints.service.AdminService;
import com.civic.complaints.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ComplaintService complaintService;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = getUser(principal);
        return ResponseEntity.ok(adminService.assignComplaint(id, request, admin));
    }

    @PutMapping("/complaints/{id}/override-ai")
    public ResponseEntity<ComplaintResponse> overrideAI(
            @PathVariable Long id,
            @RequestBody OverrideAIRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = getUser(principal);
        return ResponseEntity.ok(adminService.overrideAI(id, request, admin));
    }

    @PutMapping("/complaints/{id}/reject")
    public ResponseEntity<ComplaintResponse> rejectComplaint(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = getUser(principal);
        String reason = body.getOrDefault("reason", "Rejected after review");
        return ResponseEntity.ok(adminService.rejectComplaint(id, reason, admin));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<User>> getEmployees(@RequestParam(value = "departmentId", required = false) Long departmentId) {
        return ResponseEntity.ok(adminService.getEmployees(departmentId));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<Map<String, String>> deleteComplaint(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = getUser(principal);
        complaintService.deleteComplaint(id, admin);
        return ResponseEntity.ok(Map.of("message", "Complaint #" + id + " has been permanently deleted by administrator."));
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = getUser(principal);
        if (admin.getId().equals(id)) {
            notificationRepository.deleteByUserId(id);
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Administrator account #" + id + " deleted successfully."));
        }
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        notificationRepository.deleteByUserId(id);
        userRepository.delete(target);
        return ResponseEntity.ok(Map.of("message", "User #" + id + " (" + target.getName() + ") has been deleted."));
    }

    private User getUser(UserPrincipal principal) {
        if (principal == null) {
            return userRepository.findByRole(com.civic.complaints.model.Role.ADMIN).stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
