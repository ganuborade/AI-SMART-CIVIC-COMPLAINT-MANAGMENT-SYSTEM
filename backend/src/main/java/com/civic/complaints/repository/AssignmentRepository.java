package com.civic.complaints.repository;

import com.civic.complaints.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Optional<Assignment> findByComplaintId(Long complaintId);
    List<Assignment> findByDepartmentId(Long departmentId);
    List<Assignment> findByEmployeeId(Long employeeId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Assignment a SET a.employee = null WHERE a.employee.id = :employeeId")
    void unassignEmployee(@org.springframework.data.repository.query.Param("employeeId") Long employeeId);
}
