import { Component, OnInit } from '@angular/core';
import { ExamService } from '../../../services/exam.service';
import { ClassSessionService } from '../../../services/class-session.service';
import { AuthService } from '../../../services/auth.service';
import { StudentService } from '../../../services/student.service';
import { Exam, ExamResponse } from '../../../models/exam.model';
import { ClassSession, DayOfWeek } from '../../../models/class-session.model';
import { Student } from '../../../models/student.model';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'exam' | 'class';
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  subject: string;
  color: string;
}

@Component({
  selector: 'app-student-calendar',
  templateUrl: './student-calendar.component.html',
  styleUrls: ['./student-calendar.component.scss']
})
export class StudentCalendarComponent implements OnInit {
  currentStudent: Student | null = null;
  calendarEvents: CalendarEvent[] = [];
  currentDate = new Date();
  currentWeek: Date[] = [];
  loading = false;
  selectedDate: Date | null = null;
  selectedEvent: CalendarEvent | null = null;

  constructor(
    private examService: ExamService,
    private classSessionService: ClassSessionService,
    private authService: AuthService,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
    this.loadCurrentStudent();
    this.generateWeekDays();
  }

  loadCurrentStudent(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser?.id) {
      this.studentService.getStudentByUserId(currentUser.id).subscribe({
        next: (student) => {
          this.currentStudent = student;
          this.loadCalendarData();
        },
        error: (error) => {
          console.error('Error loading student:', error);
        }
      });
    }
  }

  loadCalendarData(): void {
    if (!this.currentStudent) return;

    this.loading = true;
    const startDate = this.getWeekStart(this.currentDate);
    const endDate = this.getWeekEnd(this.currentDate);

    Promise.all([
      this.examService.getExamsByStudentAndDateRange(
        this.currentStudent.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ).toPromise(),
      this.classSessionService.getClassSessionsByStudentId(this.currentStudent.id).toPromise()
    ]).then(([exams, classSessions]) => {
      this.calendarEvents = [];
      
      // Add exams
      (exams || []).forEach(exam => {
        this.calendarEvents.push({
          id: `exam-${exam.id}`,
          title: exam.title,
          type: 'exam',
          date: new Date(exam.date),
          startTime: exam.startTime,
          endTime: exam.endTime,
          location: exam.location,
          subject: exam.subjectName,
          color: '#f44336' // Red for exams
        });
      });

      // Add class sessions for the current week
      (classSessions || []).forEach(session => {
        const sessionDate = this.getDateForDayOfWeek(session.dayOfWeek);
        if (sessionDate >= startDate && sessionDate <= endDate) {
          this.calendarEvents.push({
            id: `class-${session.id}`,
            title: session.subject.nom,
            type: 'class',
            date: sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.room,
            subject: session.subject.nom,
            color: '#2196f3' // Blue for classes
          });
        }
      });

      this.loading = false;
    }).catch(error => {
      console.error('Error loading calendar data:', error);
      this.loading = false;
    });
  }

  generateWeekDays(): void {
    const startOfWeek = this.getWeekStart(this.currentDate);
    this.currentWeek = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.currentWeek.push(date);
    }
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  getWeekEnd(date: Date): Date {
    const start = this.getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  }

  getDateForDayOfWeek(dayOfWeek: DayOfWeek): Date {
    const dayMap: { [key in DayOfWeek]: number } = {
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
      [DayOfWeek.SUNDAY]: 0
    };

    const startOfWeek = this.getWeekStart(this.currentDate);
    const targetDay = dayMap[dayOfWeek];
    const currentDay = startOfWeek.getDay();
    const daysToAdd = (targetDay - currentDay + 7) % 7;
    
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + daysToAdd);
    return targetDate;
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.calendarEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  selectEvent(event: CalendarEvent): void {
    this.selectedEvent = event;
  }

  closeEventDetails(): void {
    this.selectedEvent = null;
  }

  previousWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeekDays();
    this.loadCalendarData();
  }

  nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDays();
    this.loadCalendarData();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateWeekDays();
    this.loadCalendarData();
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
} 