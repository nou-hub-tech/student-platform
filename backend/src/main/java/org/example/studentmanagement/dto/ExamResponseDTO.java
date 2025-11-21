package org.example.studentmanagement.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class ExamResponseDTO {
    private Long id;
    private String title;
    private Long subjectId;
    private String subjectName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private List<Long> studentIds;
    
    public ExamResponseDTO(Long id, String title, Long subjectId, String subjectName, 
                          LocalDate date, LocalTime startTime, LocalTime endTime, 
                          String location, List<Long> studentIds) {
        this.id = id;
        this.title = title;
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.studentIds = studentIds;
    }
} 