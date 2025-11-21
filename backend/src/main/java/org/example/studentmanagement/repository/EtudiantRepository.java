package org.example.studentmanagement.repository;

import org.example.studentmanagement.entity.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByUserId(Long userId);
    
    @Query("SELECT e FROM Etudiant e WHERE e.userId IN (SELECT u.id FROM user u WHERE u.username = :username)")
    Optional<Etudiant> findByUsername(@Param("username") String username);
}