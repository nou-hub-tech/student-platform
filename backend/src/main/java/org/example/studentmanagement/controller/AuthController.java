package org.example.studentmanagement.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.example.studentmanagement.entity.user;
import org.example.studentmanagement.service.userService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private static final Logger logger = Logger.getLogger(AuthController.class.getName());

    @Autowired
    private userService userService;

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        logger.info("Test endpoint called");
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend is running!");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-post")
    public ResponseEntity<?> testPost(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {
        logger.info("Test POST endpoint called");
        logger.info("Request method: " + request.getMethod());
        logger.info("Request URL: " + request.getRequestURL());
        logger.info("Content-Type: " + request.getContentType());
        logger.info("Request body: " + requestBody);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "POST request successful!");
        response.put("receivedData", requestBody);
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/db-test")
    public ResponseEntity<?> testDatabase() {
        logger.info("Database test endpoint called");
        try {
            // Try to count users to test database connection
            long userCount = userService.getUserCount();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Database connection successful!");
            response.put("userCount", userCount);
            response.put("status", "OK");
            logger.info("Database test successful, user count: " + userCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Database test failed: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Database connection failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody user user, HttpServletRequest request) {
        logger.info("Registration endpoint called for user: " + user.getUsername());
        logger.info("Request body: " + user.toString());
        logger.info("Request method: " + request.getMethod());
        logger.info("Request URL: " + request.getRequestURL());
        logger.info("Content-Type: " + request.getContentType());
        logger.info("User-Agent: " + request.getHeader("User-Agent"));
        logger.info("Origin: " + request.getHeader("Origin"));
        logger.info("Referer: " + request.getHeader("Referer"));
        
        try {
            logger.info("Registration attempt for user: " + user.getUsername());
            user registeredUser = userService.registerUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", registeredUser);
            
            logger.info("Registration successful for user: " + registeredUser.getUsername());
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            logger.warning("Registration failed for user " + user.getUsername() + ": " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        } catch (Exception e) {
            logger.severe("Unexpected error during registration: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        logger.info("Login endpoint called for user: " + loginRequest.getUsername());
        logger.info("Request method: " + request.getMethod());
        logger.info("Request URL: " + request.getRequestURL());
        logger.info("Content-Type: " + request.getContentType());
        
        try {
            logger.info("Login attempt for user: " + loginRequest.getUsername());
            user user = userService.findByUsername(loginRequest.getUsername());
            
            if (user != null && userService.checkPassword(loginRequest.getPassword(), user.getPassword())) {
                // Create a simple token (in production, use proper JWT)
                String token = "token_" + user.getUsername() + "_" + System.currentTimeMillis();
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", user);
                response.put("message", "Login successful");
                
                logger.info("Login successful for user: " + loginRequest.getUsername());
                return ResponseEntity.ok(response);
            } else {
                logger.warning("Login failed for user: " + loginRequest.getUsername() + " - Invalid credentials");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid username or password");
                return ResponseEntity.status(401).body(error);
            }
        } catch (RuntimeException e) {
            logger.warning("Login failed for user " + loginRequest.getUsername() + ": " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.severe("Unexpected error during login: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

class LoginRequest {
    private String username;
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}