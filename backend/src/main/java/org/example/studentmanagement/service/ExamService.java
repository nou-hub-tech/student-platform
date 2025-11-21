package org.example.studentmanagement.service;

import org.example.studentmanagement.entity.Exam;
import org.example.studentmanagement.entity.Etudiant;
import org.example.studentmanagement.entity.Matiere;
import org.example.studentmanagement.repository.ExamRepository;
import org.example.studentmanagement.repository.EtudiantRepository;
import org.example.studentmanagement.repository.MatiereRepository;
import org.example.studentmanagement.dto.ExamDTO;
import org.example.studentmanagement.dto.ExamResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private MatiereRepository matiereRepository;

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }

    public List<Exam> getExamsByStudentId(Long studentId) {
        return examRepository.findByStudentId(studentId);
    }

    public List<Exam> getExamsByDateRange(LocalDate startDate, LocalDate endDate) {
        return examRepository.findByDateBetween(startDate, endDate);
    }

    public List<Exam> getExamsByStudentAndDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        return examRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
    }

    public List<Exam> getExamsBySubjectId(Long subjectId) {
        return examRepository.findBySubjectId(subjectId);
    }

    public Exam createExam(Exam exam) {
        // Validate that the exam doesn't overlap with existing exams in the same location
        validateExamOverlap(exam);
        
        // Validate that end time is after start time
        if (exam.getEndTime().isBefore(exam.getStartTime()) || exam.getEndTime().equals(exam.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        return examRepository.save(exam);
    }

    public Exam createExamFromDTO(ExamDTO examDTO) {
        try {
            System.out.println("Creating exam from DTO: " + examDTO);
            
            // Validate input
            if (examDTO.getTitle() == null || examDTO.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Title is required");
            }
            if (examDTO.getSubjectId() == null) {
                throw new IllegalArgumentException("Subject ID is required");
            }
            if (examDTO.getDate() == null) {
                throw new IllegalArgumentException("Date is required");
            }
            if (examDTO.getStartTime() == null) {
                throw new IllegalArgumentException("Start time is required");
            }
            if (examDTO.getEndTime() == null) {
                throw new IllegalArgumentException("End time is required");
            }
            if (examDTO.getLocation() == null || examDTO.getLocation().trim().isEmpty()) {
                throw new IllegalArgumentException("Location is required");
            }
            
            // Find the subject
            Matiere subject = matiereRepository.findById(examDTO.getSubjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found with id: " + examDTO.getSubjectId()));
            
            System.out.println("Found subject: " + subject.getNom());
            
            // Create the exam entity
            Exam exam = new Exam();
            exam.setTitle(examDTO.getTitle());
            exam.setSubject(subject);
            exam.setDate(examDTO.getDate());
            exam.setStartTime(examDTO.getStartTime());
            exam.setEndTime(examDTO.getEndTime());
            exam.setLocation(examDTO.getLocation());
            exam.setStudents(new ArrayList<>()); // Initialize empty list
            
            System.out.println("Created exam entity: " + exam);
            
            // Validate that end time is after start time
            if (exam.getEndTime().isBefore(exam.getStartTime()) || exam.getEndTime().equals(exam.getStartTime())) {
                throw new IllegalArgumentException("End time must be after start time");
            }
            
            // Validate that the exam doesn't overlap with existing exams in the same location
            validateExamOverlap(exam);
            
            // Save the exam first
            Exam savedExam = examRepository.save(exam);
            System.out.println("Saved exam with ID: " + savedExam.getId());
            
            // Add students if provided
            if (examDTO.getStudentIds() != null && !examDTO.getStudentIds().isEmpty()) {
                for (Long studentId : examDTO.getStudentIds()) {
                    addStudentToExam(savedExam.getId(), studentId);
                }
            }
            
            return savedExam;
        } catch (Exception e) {
            System.err.println("Error in createExamFromDTO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Exam updateExam(Long id, Exam examDetails) {
        Optional<Exam> examOptional = examRepository.findById(id);
        if (examOptional.isPresent()) {
            Exam exam = examOptional.get();
            
            // Validate that the exam doesn't overlap with existing exams in the same location
            validateExamOverlap(examDetails);
            
            // Validate that end time is after start time
            if (examDetails.getEndTime().isBefore(examDetails.getStartTime()) || 
                examDetails.getEndTime().equals(examDetails.getStartTime())) {
                throw new IllegalArgumentException("End time must be after start time");
            }
            
            exam.setTitle(examDetails.getTitle());
            exam.setSubject(examDetails.getSubject());
            exam.setDate(examDetails.getDate());
            exam.setStartTime(examDetails.getStartTime());
            exam.setEndTime(examDetails.getEndTime());
            exam.setLocation(examDetails.getLocation());
            exam.setStudents(examDetails.getStudents());
            
            return examRepository.save(exam);
        }
        throw new RuntimeException("Exam not found with id: " + id);
    }

    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

    public void addStudentToExam(Long examId, Long studentId) {
        Optional<Exam> examOptional = examRepository.findById(examId);
        Optional<Etudiant> studentOptional = etudiantRepository.findById(studentId);
        
        if (examOptional.isPresent() && studentOptional.isPresent()) {
            Exam exam = examOptional.get();
            Etudiant student = studentOptional.get();
            
            if (exam.getStudents() == null) {
                exam.setStudents(new ArrayList<>());
            }
            
            if (!exam.getStudents().contains(student)) {
                exam.getStudents().add(student);
                examRepository.save(exam);
            }
        }
    }

    public void removeStudentFromExam(Long examId, Long studentId) {
        Optional<Exam> examOptional = examRepository.findById(examId);
        Optional<Etudiant> studentOptional = etudiantRepository.findById(studentId);
        
        if (examOptional.isPresent() && studentOptional.isPresent()) {
            Exam exam = examOptional.get();
            Etudiant student = studentOptional.get();
            
            if (exam.getStudents() != null) {
                exam.getStudents().remove(student);
                examRepository.save(exam);
            }
        }
    }

    private void validateExamOverlap(Exam exam) {
        List<Exam> overlappingExams = examRepository.findOverlappingExams(
            exam.getLocation(),
            exam.getDate(),
            exam.getStartTime(),
            exam.getEndTime()
        );
        
        // Remove the current exam from the list if it's an update
        if (exam.getId() != null) {
            overlappingExams.removeIf(e -> e.getId().equals(exam.getId()));
        }
        
        if (!overlappingExams.isEmpty()) {
            throw new IllegalArgumentException("Exam overlaps with existing exams in the same location and time");
        }
    }
    
    public ExamResponseDTO convertToResponseDTO(Exam exam) {
        List<Long> studentIds = exam.getStudents() != null ? 
            exam.getStudents().stream().map(Etudiant::getId).toList() : 
            new ArrayList<>();
            
        return new ExamResponseDTO(
            exam.getId(),
            exam.getTitle(),
            exam.getSubject().getId(),
            exam.getSubject().getNom(),
            exam.getDate(),
            exam.getStartTime(),
            exam.getEndTime(),
            exam.getLocation(),
            studentIds
        );
    }
    
    public List<ExamResponseDTO> getAllExamsAsDTO() {
        List<Exam> exams = examRepository.findAll();
        return exams.stream().map(this::convertToResponseDTO).toList();
    }
    
    public ExamResponseDTO getExamByIdAsDTO(Long id) {
        Optional<Exam> exam = examRepository.findById(id);
        return exam.map(this::convertToResponseDTO).orElse(null);
    }
    
    public List<ExamResponseDTO> getExamsByStudentIdAsDTO(Long studentId) {
        List<Exam> exams = examRepository.findByStudentId(studentId);
        return exams.stream().map(this::convertToResponseDTO).toList();
    }
    
    public List<ExamResponseDTO> getExamsByDateRangeAsDTO(LocalDate startDate, LocalDate endDate) {
        List<Exam> exams = examRepository.findByDateBetween(startDate, endDate);
        return exams.stream().map(this::convertToResponseDTO).toList();
    }
    
    public List<ExamResponseDTO> getExamsByStudentAndDateRangeAsDTO(Long studentId, LocalDate startDate, LocalDate endDate) {
        List<Exam> exams = examRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
        return exams.stream().map(this::convertToResponseDTO).toList();
    }
    
    public List<ExamResponseDTO> getExamsBySubjectIdAsDTO(Long subjectId) {
        List<Exam> exams = examRepository.findBySubjectId(subjectId);
        return exams.stream().map(this::convertToResponseDTO).toList();
    }
} 