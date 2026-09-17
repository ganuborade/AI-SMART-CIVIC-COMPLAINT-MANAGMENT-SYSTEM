package com.civic.complaints.controller;

import com.civic.complaints.model.User;
import com.civic.complaints.repository.NotificationRepository;
import com.civic.complaints.repository.UserRepository;
import com.civic.complaints.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

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

        try {
            notificationRepository.deleteByUserId(user.getId());
        } catch (Exception e) {
            log.warn("Could not clear notifications for user #{}: {}", user.getId(), e.getMessage());
        }

        userRepository.delete(user);
        log.info("User account #{} ({}) has been permanently deleted by owner.", user.getId(), user.getEmail());

        return ResponseEntity.ok(Map.of("message", "Your account and profile data have been permanently deleted from the system."));
    }
}
