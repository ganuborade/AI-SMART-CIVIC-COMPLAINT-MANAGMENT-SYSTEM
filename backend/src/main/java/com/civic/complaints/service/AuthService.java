package com.civic.complaints.service;

import com.civic.complaints.dto.AuthRequest;
import com.civic.complaints.dto.AuthResponse;
import com.civic.complaints.dto.RegisterRequest;
import com.civic.complaints.model.Department;
import com.civic.complaints.model.Role;
import com.civic.complaints.model.User;
import com.civic.complaints.repository.DepartmentRepository;
import com.civic.complaints.repository.UserRepository;
import com.civic.complaints.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.admin.secret-key:ADMIN12@2026}")
    private String adminSecretKey;

    @Value("${app.employee.secret-key:STAFF13@2026}")
    private String employeeSecretKey;

    private String getEffectiveAdminKey() {
        String key = System.getProperty("ADMIN_REGISTRATION_KEY");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        key = System.getProperty("app.admin.secret-key");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        key = System.getenv("ADMIN_REGISTRATION_KEY");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        return adminSecretKey != null ? adminSecretKey.trim() : "ADMIN12@2026";
    }

    private String getEffectiveEmployeeKey() {
        String key = System.getProperty("EMPLOYEE_REGISTRATION_KEY");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        key = System.getProperty("app.employee.secret-key");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        key = System.getenv("EMPLOYEE_REGISTRATION_KEY");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        return employeeSecretKey != null ? employeeSecretKey.trim() : "STAFF13@2026";
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        return buildAuthResponse(user, jwt);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        Role requestedRole = request.getRole() != null ? request.getRole() : Role.CITIZEN;

        // Security Passkey Validation for Staff and Admin
        if (requestedRole == Role.ADMIN) {
            String expected = getEffectiveAdminKey();
            if (request.getSecretKey() == null || !request.getSecretKey().trim().equals(expected)) {
                log.warn("Admin registration failed: passkey mismatch for email {}", request.getEmail());
                throw new IllegalArgumentException("Invalid Administrator Security Passkey. Admin authorization denied.");
            }
        } else if (requestedRole == Role.EMPLOYEE) {
            String expected = getEffectiveEmployeeKey();
            if (request.getSecretKey() == null || !request.getSecretKey().trim().equals(expected)) {
                log.warn("Employee registration failed: passkey mismatch for email {}", request.getEmail());
                throw new IllegalArgumentException("Invalid Municipal Staff Security Passkey. Employee authorization denied.");
            }
            if (request.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department selection is required for municipal employee registration.");
            }
        }

        Department department = null;
        if (requestedRole == Role.EMPLOYEE && request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected department does not exist"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(requestedRole)
                .department(department)
                .build();

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String jwt = tokenProvider.generateToken(authentication);

        log.info("Successfully registered new user #{} ({}) with role {}", user.getId(), user.getEmail(), user.getRole());
        return buildAuthResponse(user, jwt);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : null;

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .departmentId(deptId)
                .departmentName(deptName)
                .build();
    }
}
