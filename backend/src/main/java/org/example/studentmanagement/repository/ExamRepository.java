package org.example.studentmanagement.repository;

import org.example.studentmanagement.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    @Query("SELECT e FROM Exam e JOIN e.students s WHERE s.id = :studentId")
    List<Exam> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT e FROM Exam e WHERE e.date BETWEEN :startDate AND :endDate")
    List<Exam> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e FROM Exam e JOIN e.students s WHERE s.id = :studentId AND e.date BETWEEN :startDate AND :endDate")
    List<Exam> findByStudentIdAndDateBetween(@Param("studentId") Long studentId, 
                                           @Param("startDate") LocalDate startDate, 
                                           @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e FROM Exam e WHERE e.subject.id = :subjectId")
    List<Exam> findBySubjectId(@Param("subjectId") Long subjectId);
    
    @Query("SELECT e FROM Exam e WHERE e.location = :location AND e.date = :date AND " +
           "((e.startTime <= :startTime AND e.endTime > :startTime) OR " +
           "(e.startTime < :endTime AND e.endTime >= :endTime) OR " +
           "(e.startTime >= :startTime AND e.endTime <= :endTime))")
    List<Exam> findOverlappingExams(@Param("location") String location, 
                                   @Param("date") LocalDate date,
                                   @Param("startTime") LocalTime startTime,
                                   @Param("endTime") LocalTime endTime);
} 