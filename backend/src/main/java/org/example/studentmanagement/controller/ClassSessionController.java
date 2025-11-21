package org.example.studentmanagement.controller;

import org.example.studentmanagement.entity.ClassSession;
import org.example.studentmanagement.service.ClassSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/class-sessions")
@CrossOrigin(origins = "*")
public class ClassSessionController {

    @Autowired
    private ClassSessionService classSessionService;

    // Admin endpoints - full CRUD operations
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClassSession>> getAllClassSessions() {
        return ResponseEntity.ok(classSessionService.getAllClassSessions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassSession> getClassSessionById(@PathVariable Long id) {
        return classSessionService.getClassSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassSession> createClassSession(@RequestBody ClassSession classSession) {
        try {
            ClassSession createdClassSession = classSessionService.createClassSession(classSession);
            return ResponseEntity.ok(createdClassSession);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassSession> updateClassSession(@PathVariable Long id, @RequestBody ClassSession classSessionDetails) {
        try {
            ClassSession updatedClassSession = classSessionService.updateClassSession(id, classSessionDetails);
            return ResponseEntity.ok(updatedClassSession);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClassSession(@PathVariable Long id) {
        classSessionService.deleteClassSession(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{classSessionId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addStudentToClassSession(@PathVariable Long classSessionId, @PathVariable Long studentId) {
        classSessionService.addStudentToClassSession(classSessionId, studentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{classSessionId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeStudentFromClassSession(@PathVariable Long classSessionId, @PathVariable Long studentId) {
        classSessionService.removeStudentFromClassSession(classSessionId, studentId);
        return ResponseEntity.ok().build();
    }

    // Student endpoints - read-only access
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ClassSession>> getClassSessionsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(classSessionService.getClassSessionsByStudentId(studentId));
    }

    @GetMapping("/student/{studentId}/day/{dayOfWeek}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ClassSession>> getClassSessionsByStudentAndDayOfWeek(
            @PathVariable Long studentId, @PathVariable DayOfWeek dayOfWeek) {
        return ResponseEntity.ok(classSessionService.getClassSessionsByStudentAndDayOfWeek(studentId, dayOfWeek));
    }

    // Additional endpoints for filtering
    @GetMapping("/day/{dayOfWeek}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClassSession>> getClassSessionsByDayOfWeek(@PathVariable DayOfWeek dayOfWeek) {
        return ResponseEntity.ok(classSessionService.getClassSessionsByDayOfWeek(dayOfWeek));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClassSession>> getClassSessionsBySubjectId(@PathVariable Long subjectId) {
        return ResponseEntity.ok(classSessionService.getClassSessionsBySubjectId(subjectId));
    }
} 