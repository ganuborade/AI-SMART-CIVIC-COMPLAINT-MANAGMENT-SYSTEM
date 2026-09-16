package com.civic.complaints.controller;

import com.civic.complaints.dto.ComplaintRequest;
import com.civic.complaints.dto.ComplaintResponse;
import com.civic.complaints.dto.FeedbackRequest;
import com.civic.complaints.model.Category;
import com.civic.complaints.model.Priority;
import com.civic.complaints.model.User;
import com.civic.complaints.repository.UserRepository;
import com.civic.complaints.security.UserPrincipal;
import com.civic.complaints.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ComplaintResponse> createComplaintMultipart(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String categoryStr,
            @RequestParam(value = "priority", required = false) String priorityStr,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "address", required = false) String address,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal principal) {

        User user = getUser(principal);

        ComplaintRequest req = new ComplaintRequest();
        req.setTitle(title);
        req.setDescription(description);
        if (categoryStr != null && !categoryStr.isEmpty()) {
            req.setCategory(Category.valueOf(categoryStr));
        }
        if (priorityStr != null && !priorityStr.isEmpty()) {
            req.setPriority(Priority.valueOf(priorityStr));
        }
        req.setLatitude(latitude);
        req.setLongitude(longitude);
        req.setAddress(address);

        return ResponseEntity.ok(complaintService.createComplaint(req, user, image));
    }

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ComplaintResponse> createComplaintJson(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(complaintService.createComplaint(request, user, null));
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(complaintService.getCitizenComplaints(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<ComplaintResponse> addFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(complaintService.addFeedback(id, user, request));
    }

    private User getUser(UserPrincipal principal) {
        if (principal == null) {
            // Fallback for public demo testing if needed: find first citizen
            return userRepository.findAll().stream()
                    .filter(u -> u.getRole() == com.civic.complaints.model.Role.CITIZEN)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No citizen found"));
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
