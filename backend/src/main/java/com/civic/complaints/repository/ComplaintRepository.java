package com.civic.complaints.repository;

import com.civic.complaints.model.Category;
import com.civic.complaints.model.Complaint;
import com.civic.complaints.model.ComplaintStatus;
import com.civic.complaints.model.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<Complaint> findByStatus(ComplaintStatus status);
    List<Complaint> findByPriority(Priority priority);
    List<Complaint> findByCategory(Category category);

    @Query("SELECT c FROM Complaint c LEFT JOIN FETCH c.citizen LEFT JOIN FETCH c.aiAnalysis LEFT JOIN FETCH c.assignment ORDER BY c.createdAt DESC")
    List<Complaint> findAllWithDetails();

    @Query("SELECT c FROM Complaint c WHERE c.assignment.department.id = :departmentId ORDER BY c.createdAt DESC")
    List<Complaint> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT c FROM Complaint c WHERE c.assignment.employee.id = :employeeId ORDER BY c.createdAt DESC")
    List<Complaint> findByEmployeeId(@Param("employeeId") Long employeeId);

    Long countByStatus(ComplaintStatus status);
    Long countByPriority(Priority priority);
    Long countByCategory(Category category);

    // Find nearby complaints for duplicate detection within ~300 meters (approx 0.003 degrees)
    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') " +
           "AND c.latitude BETWEEN :minLat AND :maxLat " +
           "AND c.longitude BETWEEN :minLng AND :maxLng")
    List<Complaint> findActiveComplaintsInBounds(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng);
}
