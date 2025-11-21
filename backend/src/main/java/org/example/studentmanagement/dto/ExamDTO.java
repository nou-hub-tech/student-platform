package org.example.studentmanagement.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class ExamDTO {
    private Long id;
    private String title;
    private Long subjectId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private List<Long> studentIds;
    
    @Override
    public String toString() {
        return "ExamDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", subjectId=" + subjectId +
                ", date=" + date +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", location='" + location + '\'' +
                ", studentIds=" + studentIds +
                '}';
    }
} 