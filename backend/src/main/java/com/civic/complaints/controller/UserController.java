package com.civic.complaints.controller;

import com.civic.complaints.model.Complaint;
import com.civic.complaints.model.Role;
import com.civic.complaints.model.User;
import com.civic.complaints.repository.AssignmentRepository;
import com.civic.complaints.repository.ComplaintRepository;
import com.civic.complaints.repository.ComplaintStatusHistoryRepository;
import com.civic.complaints.repository.NotificationRepository;
import com.civic.complaints.repository.UserRepository;
import com.civic.complaints.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ComplaintRepository complaintRepository;
    private final AssignmentRepository assignmentRepository;
    private final ComplaintStatusHistoryRepository historyRepository;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User account not found"));
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/profile")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access."));
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User account not found"));

        Long userId = user.getId();

        // 1. Delete all notifications for this user
        try {
            notificationRepository.deleteByUserId(userId);
        } catch (Exception e) {
            log.warn("Could not clear notifications for user #{}: {}", userId, e.getMessage());
        }

        // 2. If CITIZEN, delete their filed complaints (cascading images, statusHistory, aiAnalysis, assignment, feedback)
        if (user.getRole() == Role.CITIZEN) {
            List<Complaint> complaints = complaintRepository.findByCitizenIdOrderByCreatedAtDesc(userId);
            for (Complaint c : complaints) {
                try {
                    notificationRepository.deleteByComplaintId(c.getId());
                } catch (Exception e) {
                    log.warn("Could not delete notifications for complaint #{}: {}", c.getId(), e.getMessage());
                }
                complaintRepository.delete(c);
            }
        }

        // 3. If EMPLOYEE, unassign from assignments
        if (user.getRole() == Role.EMPLOYEE) {
            try {
                assignmentRepository.unassignEmployee(userId);
            } catch (Exception e) {
                log.warn("Could not unassign employee #{}: {}", userId, e.getMessage());
            }
        }

        // 4. Nullify changedBy in status history if any
        try {
            historyRepository.nullifyChangedBy(userId);
        } catch (Exception e) {
            log.warn("Could not nullify changedBy in history for user #{}: {}", userId, e.getMessage());
        }

        // 5. Delete the user
        userRepository.delete(user);
        log.info("User account #{} ({}) has been permanently deleted by owner.", userId, user.getEmail());

        return ResponseEntity.ok(Map.of("message", "Your account and profile data have been permanently deleted from the system."));
    }
}

