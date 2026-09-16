package com.civic.complaints.service;

import com.civic.complaints.dto.DepartmentStatsDTO;
import com.civic.complaints.model.Complaint;
import com.civic.complaints.model.ComplaintStatus;
import com.civic.complaints.model.Department;
import com.civic.complaints.model.Role;
import com.civic.complaints.repository.ComplaintRepository;
import com.civic.complaints.repository.DepartmentRepository;
import com.civic.complaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Optional<Department> getDepartmentByName(String name) {
        return departmentRepository.findByNameIgnoreCase(name);
    }

    @Transactional
    public Department createDepartment(Department department) {
        if (departmentRepository.findByNameIgnoreCase(department.getName()).isPresent()) {
            throw new IllegalArgumentException("Department with name '" + department.getName() + "' already exists.");
        }
        return departmentRepository.save(department);
    }

    @Transactional
    public Department updateDepartment(Long id, Department updated) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setIcon(updated.getIcon());
        existing.setContactEmail(updated.getContactEmail());
        existing.setContactPhone(updated.getContactPhone());
        existing.setHeadName(updated.getHeadName());

        return departmentRepository.save(existing);
    }

    public List<DepartmentStatsDTO> getDepartmentStats() {
        List<Department> departments = departmentRepository.findAll();
        List<Complaint> allComplaints = complaintRepository.findAll();
        List<DepartmentStatsDTO> results = new ArrayList<>();

        for (Department d : departments) {
            long total = allComplaints.stream()
                    .filter(c -> c.getAssignment() != null && c.getAssignment().getDepartment().getId().equals(d.getId()))
                    .count();

            long pending = allComplaints.stream()
                    .filter(c -> c.getAssignment() != null && c.getAssignment().getDepartment().getId().equals(d.getId())
                            && (c.getStatus() == ComplaintStatus.ASSIGNED))
                    .count();

            long inProgress = allComplaints.stream()
                    .filter(c -> c.getAssignment() != null && c.getAssignment().getDepartment().getId().equals(d.getId())
                            && c.getStatus() == ComplaintStatus.IN_PROGRESS)
                    .count();

            long resolved = allComplaints.stream()
                    .filter(c -> c.getAssignment() != null && c.getAssignment().getDepartment().getId().equals(d.getId())
                            && (c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED))
                    .count();

            long officerCount = userRepository.findByDepartmentId(d.getId()).size();

            results.add(DepartmentStatsDTO.builder()
                    .id(d.getId())
                    .name(d.getName())
                    .description(d.getDescription())
                    .icon(d.getIcon())
                    .contactEmail(d.getContactEmail())
                    .contactPhone(d.getContactPhone())
                    .headName(d.getHeadName())
                    .totalComplaints(total)
                    .pendingComplaints(pending)
                    .inProgressComplaints(inProgress)
                    .resolvedComplaints(resolved)
                    .officerCount(officerCount)
                    .build());
        }

        return results;
    }
}
