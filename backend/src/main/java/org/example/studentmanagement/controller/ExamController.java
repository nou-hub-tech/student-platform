package org.example.studentmanagement.controller;

import org.example.studentmanagement.entity.Exam;
import org.example.studentmanagement.repository.ExamRepository;
import org.example.studentmanagement.service.ExamService;
import org.example.studentmanagement.dto.ExamDTO;
import org.example.studentmanagement.dto.ExamResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    @Autowired
    private ExamService examService;
    
    @Autowired
    private ExamRepository examRepository;

    // Admin endpoints - full CRUD operations
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExamResponseDTO>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExamsAsDTO());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamResponseDTO> getExamById(@PathVariable Long id) {
        ExamResponseDTO exam = examService.getExamByIdAsDTO(id);
        if (exam != null) {
            return ResponseEntity.ok(exam);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamResponseDTO> createExam(@RequestBody ExamDTO examDTO) {
        try {
            System.out.println("Received exam DTO: " + examDTO);
            System.out.println("Exam DTO details:");
            System.out.println("  Title: " + examDTO.getTitle());
            System.out.println("  Subject ID: " + examDTO.getSubjectId());
            System.out.println("  Date: " + examDTO.getDate());
            System.out.println("  Start Time: " + examDTO.getStartTime());
            System.out.println("  End Time: " + examDTO.getEndTime());
            System.out.println("  Location: " + examDTO.getLocation());
            System.out.println("  Student IDs: " + examDTO.getStudentIds());
            
            Exam createdExam = examService.createExamFromDTO(examDTO);
            ExamResponseDTO responseDTO = examService.convertToResponseDTO(createdExam);
            return ResponseEntity.ok(responseDTO);
        } catch (IllegalArgumentException e) {
            System.err.println("Error creating exam: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Unexpected error creating exam: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @RequestBody Exam examDetails) {
        try {
            Exam updatedExam = examService.updateExam(id, examDetails);
            return ResponseEntity.ok(updatedExam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{examId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addStudentToExam(@PathVariable Long examId, @PathVariable Long studentId) {
        examService.addStudentToExam(examId, studentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{examId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeStudentFromExam(@PathVariable Long examId, @PathVariable Long studentId) {
        examService.removeStudentFromExam(examId, studentId);
        return ResponseEntity.ok().build();
    }

    // Student endpoints - read-only access
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExamResponseDTO>> getExamsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(examService.getExamsByStudentIdAsDTO(studentId));
    }

    @GetMapping("/student/{studentId}/date-range")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExamResponseDTO>> getExamsByStudentAndDateRange(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(examService.getExamsByStudentAndDateRangeAsDTO(studentId, startDate, endDate));
    }

    // Additional endpoints for filtering
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExamResponseDTO>> getExamsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(examService.getExamsByDateRangeAsDTO(startDate, endDate));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExamResponseDTO>> getExamsBySubjectId(@PathVariable Long subjectId) {
        return ResponseEntity.ok(examService.getExamsBySubjectIdAsDTO(subjectId));
    }

    // Test endpoint to verify the backend is working
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Exam controller is working!");
    }
    
    // Test endpoint to verify database connection and subject availability
    @GetMapping("/test-db")
    public ResponseEntity<String> testDatabase() {
        try {
            long examCount = examRepository.count();
            return ResponseEntity.ok("Database connection OK. Exam count: " + examCount);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Database error: " + e.getMessage());
        }
    }
} 