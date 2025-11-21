package org.example.studentmanagement.repository;

import org.example.studentmanagement.entity.user;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface userRepository extends JpaRepository<user, Long> {
    Optional<user> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}