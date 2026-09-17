package com.civic.complaints.repository;

import com.civic.complaints.model.ComplaintStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintStatusHistoryRepository extends JpaRepository<ComplaintStatusHistory, Long> {
    List<ComplaintStatusHistory> findByComplaintIdOrderByChangedAtAsc(Long complaintId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE ComplaintStatusHistory csh SET csh.changedBy = null WHERE csh.changedBy.id = :userId")
    void nullifyChangedBy(@org.springframework.data.repository.query.Param("userId") Long userId);
}
