package org.example.studentmanagement.service;

import org.example.studentmanagement.entity.ClassSession;
import org.example.studentmanagement.entity.Etudiant;
import org.example.studentmanagement.repository.ClassSessionRepository;
import org.example.studentmanagement.repository.EtudiantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClassSessionService {

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    public List<ClassSession> getAllClassSessions() {
        return classSessionRepository.findAll();
    }

    public Optional<ClassSession> getClassSessionById(Long id) {
        return classSessionRepository.findById(id);
    }

    public List<ClassSession> getClassSessionsByStudentId(Long studentId) {
        return classSessionRepository.findByStudentId(studentId);
    }

    public List<ClassSession> getClassSessionsByDayOfWeek(DayOfWeek dayOfWeek) {
        return classSessionRepository.findByDayOfWeek(dayOfWeek);
    }

    public List<ClassSession> getClassSessionsByStudentAndDayOfWeek(Long studentId, DayOfWeek dayOfWeek) {
        return classSessionRepository.findByStudentIdAndDayOfWeek(studentId, dayOfWeek);
    }

    public List<ClassSession> getClassSessionsBySubjectId(Long subjectId) {
        return classSessionRepository.findBySubjectId(subjectId);
    }

    public ClassSession createClassSession(ClassSession classSession) {
        // Validate that class sessions are not on weekends
        if (classSession.getDayOfWeek() == DayOfWeek.SATURDAY || classSession.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new IllegalArgumentException("Class sessions cannot be scheduled on weekends");
        }
        
        // Validate that the class session doesn't overlap with existing sessions in the same room
        validateClassSessionOverlap(classSession);
        
        // Validate that end time is after start time
        if (classSession.getEndTime().isBefore(classSession.getStartTime()) || 
            classSession.getEndTime().equals(classSession.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        return classSessionRepository.save(classSession);
    }

    public ClassSession updateClassSession(Long id, ClassSession classSessionDetails) {
        Optional<ClassSession> classSessionOptional = classSessionRepository.findById(id);
        if (classSessionOptional.isPresent()) {
            ClassSession classSession = classSessionOptional.get();
            
            // Validate that class sessions are not on weekends
            if (classSessionDetails.getDayOfWeek() == DayOfWeek.SATURDAY || 
                classSessionDetails.getDayOfWeek() == DayOfWeek.SUNDAY) {
                throw new IllegalArgumentException("Class sessions cannot be scheduled on weekends");
            }
            
            // Validate that the class session doesn't overlap with existing sessions in the same room
            validateClassSessionOverlap(classSessionDetails);
            
            // Validate that end time is after start time
            if (classSessionDetails.getEndTime().isBefore(classSessionDetails.getStartTime()) || 
                classSessionDetails.getEndTime().equals(classSessionDetails.getStartTime())) {
                throw new IllegalArgumentException("End time must be after start time");
            }
            
            classSession.setSubject(classSessionDetails.getSubject());
            classSession.setInstructor(classSessionDetails.getInstructor());
            classSession.setDayOfWeek(classSessionDetails.getDayOfWeek());
            classSession.setStartTime(classSessionDetails.getStartTime());
            classSession.setEndTime(classSessionDetails.getEndTime());
            classSession.setRoom(classSessionDetails.getRoom());
            classSession.setStudents(classSessionDetails.getStudents());
            
            return classSessionRepository.save(classSession);
        }
        throw new RuntimeException("Class session not found with id: " + id);
    }

    public void deleteClassSession(Long id) {
        classSessionRepository.deleteById(id);
    }

    public void addStudentToClassSession(Long classSessionId, Long studentId) {
        Optional<ClassSession> classSessionOptional = classSessionRepository.findById(classSessionId);
        Optional<Etudiant> studentOptional = etudiantRepository.findById(studentId);
        
        if (classSessionOptional.isPresent() && studentOptional.isPresent()) {
            ClassSession classSession = classSessionOptional.get();
            Etudiant student = studentOptional.get();
            
            if (!classSession.getStudents().contains(student)) {
                classSession.getStudents().add(student);
                classSessionRepository.save(classSession);
            }
        }
    }

    public void removeStudentFromClassSession(Long classSessionId, Long studentId) {
        Optional<ClassSession> classSessionOptional = classSessionRepository.findById(classSessionId);
        Optional<Etudiant> studentOptional = etudiantRepository.findById(studentId);
        
        if (classSessionOptional.isPresent() && studentOptional.isPresent()) {
            ClassSession classSession = classSessionOptional.get();
            Etudiant student = studentOptional.get();
            
            classSession.getStudents().remove(student);
            classSessionRepository.save(classSession);
        }
    }

    private void validateClassSessionOverlap(ClassSession classSession) {
        List<ClassSession> overlappingSessions = classSessionRepository.findOverlappingClassSessions(
            classSession.getRoom(),
            classSession.getDayOfWeek(),
            classSession.getStartTime().toString(),
            classSession.getEndTime().toString()
        );
        
        // Remove the current class session from the list if it's an update
        overlappingSessions.removeIf(cs -> cs.getId().equals(classSession.getId()));
        
        if (!overlappingSessions.isEmpty()) {
            throw new IllegalArgumentException("Class session overlaps with existing sessions in the same room and time");
        }
    }
} 