package com.civic.complaints.controller;

import com.civic.complaints.dto.ComplaintResponse;
import com.civic.complaints.dto.ResolveComplaintRequest;
import com.civic.complaints.model.User;
import com.civic.complaints.repository.UserRepository;
import com.civic.complaints.security.UserPrincipal;
import com.civic.complaints.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final UserRepository userRepository;

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(@AuthenticationPrincipal UserPrincipal principal) {
        User employee = getUser(principal);
        return ResponseEntity.ok(employeeService.getAssignedComplaints(employee));
    }

    @PutMapping("/complaints/{id}/start")
    public ResponseEntity<ComplaintResponse> startWork(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User employee = getUser(principal);
        return ResponseEntity.ok(employeeService.startWork(id, employee));
    }

    @PutMapping(value = "/complaints/{id}/resolve", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ComplaintResponse> resolveComplaintMultipart(
            @PathVariable Long id,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestPart(value = "afterImage", required = false) MultipartFile afterImage,
            @AuthenticationPrincipal UserPrincipal principal) {
        User employee = getUser(principal);
        ResolveComplaintRequest req = new ResolveComplaintRequest();
        req.setNotes(notes);
        return ResponseEntity.ok(employeeService.resolveComplaint(id, req, afterImage, employee));
    }

    @PutMapping(value = "/complaints/{id}/resolve", consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ComplaintResponse> resolveComplaintJson(
            @PathVariable Long id,
            @RequestBody ResolveComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User employee = getUser(principal);
        return ResponseEntity.ok(employeeService.resolveComplaint(id, request, null, employee));
    }

    private User getUser(UserPrincipal principal) {
        if (principal == null) {
            return userRepository.findByRole(com.civic.complaints.model.Role.EMPLOYEE).stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No employee found"));
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
