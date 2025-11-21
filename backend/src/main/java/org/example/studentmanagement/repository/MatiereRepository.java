package org.example.studentmanagement.repository;

import org.example.studentmanagement.entity.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatiereRepository extends JpaRepository<Matiere, Long> {
}