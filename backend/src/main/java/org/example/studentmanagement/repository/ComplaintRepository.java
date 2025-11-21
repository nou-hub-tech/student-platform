package org.example.studentmanagement.repository;

import org.example.studentmanagement.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByEtudiantId(Long etudiantId);
    List<Complaint> findByStatus(String status);
    List<Complaint> findByEtudiantIdOrderByCreatedAtDesc(Long etudiantId);
}
