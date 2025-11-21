package org.example.studentmanagement.service;

import org.example.studentmanagement.entity.Etudiant;
import org.example.studentmanagement.entity.user;
import org.example.studentmanagement.repository.userRepository;
import org.example.studentmanagement.repository.EtudiantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class userService {
    private static final Logger logger = Logger.getLogger(userService.class.getName());
    
    private final userRepository userRepository;
    private final EtudiantRepository etudiantRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public userService(userRepository userRepository, BCryptPasswordEncoder passwordEncoder,EtudiantRepository etudiantRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.etudiantRepository = etudiantRepository;
    }

    public long getUserCount() {
        return userRepository.count();
    }

    public user registerUser(user user) {
        logger.info("Attempting to register user: " + user.getUsername());
        
        if (userRepository.existsByUsername(user.getUsername())) {
            logger.warning("Registration failed: Username already exists - " + user.getUsername());
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            logger.warning("Registration failed: Email already exists - " + user.getEmail());
            throw new RuntimeException("Email already exists");
        }
        
        // Encode password
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        
        // Set default role if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("ROLE_STUDENT"); // Default role
        }
        
        try {
            user savedUser = userRepository.save(user);
            logger.info("User registered successfully: " + savedUser.getUsername());
            if (user.getRole().equals("ROLE_STUDENT")) {
                Etudiant etudiant = new Etudiant();
                etudiant.setNom(user.getNom());
                etudiant.setPrenom(user.getPrenom());
                etudiant.setEmail(user.getEmail());
                etudiant.setUserId(savedUser.getId());
                etudiantRepository.save(etudiant);
            }
            return savedUser;
        } catch (Exception e) {
            logger.severe("Error saving user to database: " + e.getMessage());
            throw new RuntimeException("Failed to save user: " + e.getMessage());
        }
    }

    public user findByUsername(String username) {
        logger.info("Looking for user by username: " + username);
        try {
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
        } catch (Exception e) {
            logger.warning("Error finding user by username: " + e.getMessage());
            throw new RuntimeException("User not found: " + username);
        }
    }

    public boolean checkPassword(String rawPassword, String encodedPassword) {
        try {
            boolean matches = passwordEncoder.matches(rawPassword, encodedPassword);
            logger.info("Password check result: " + matches);
            return matches;
        } catch (Exception e) {
            logger.warning("Error checking password: " + e.getMessage());
            return false;
        }
    }
}