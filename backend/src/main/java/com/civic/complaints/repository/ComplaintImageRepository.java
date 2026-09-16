package com.civic.complaints.repository;

import com.civic.complaints.model.ComplaintImage;
import com.civic.complaints.model.ImageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintImageRepository extends JpaRepository<ComplaintImage, Long> {
    List<ComplaintImage> findByComplaintId(Long complaintId);
    List<ComplaintImage> findByComplaintIdAndImageType(Long complaintId, ImageType imageType);
}
