package org.example.studentmanagement.repository;

import org.example.studentmanagement.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    
    @Query("SELECT cs FROM ClassSession cs JOIN cs.students s WHERE s.id = :studentId")
    List<ClassSession> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT cs FROM ClassSession cs WHERE cs.dayOfWeek = :dayOfWeek")
    List<ClassSession> findByDayOfWeek(@Param("dayOfWeek") DayOfWeek dayOfWeek);
    
    @Query("SELECT cs FROM ClassSession cs JOIN cs.students s WHERE s.id = :studentId AND cs.dayOfWeek = :dayOfWeek")
    List<ClassSession> findByStudentIdAndDayOfWeek(@Param("studentId") Long studentId, @Param("dayOfWeek") DayOfWeek dayOfWeek);
    
    @Query("SELECT cs FROM ClassSession cs WHERE cs.subject.id = :subjectId")
    List<ClassSession> findBySubjectId(@Param("subjectId") Long subjectId);
    
    @Query("SELECT cs FROM ClassSession cs WHERE cs.room = :room AND cs.dayOfWeek = :dayOfWeek AND " +
           "((cs.startTime <= :startTime AND cs.endTime > :startTime) OR " +
           "(cs.startTime < :endTime AND cs.endTime >= :endTime) OR " +
           "(cs.startTime >= :startTime AND cs.endTime <= :endTime))")
    List<ClassSession> findOverlappingClassSessions(@Param("room") String room, 
                                                   @Param("dayOfWeek") DayOfWeek dayOfWeek,
                                                   @Param("startTime") String startTime,
                                                   @Param("endTime") String endTime);
} 