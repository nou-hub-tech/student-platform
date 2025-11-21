import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClassSessionService } from '../../../services/class-session.service';
import { SubjectService } from '../../../services/subject.service';
import { StudentService } from '../../../services/student.service';
import { ClassSession, ClassSessionFormData, DayOfWeek } from '../../../models/class-session.model';
import { Subject } from '../../../models/subject.model';
import { Student } from '../../../models/student.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-class-session-management',
  templateUrl: './admin-class-session-management.component.html',
  styleUrls: ['./admin-class-session-management.component.scss']
})
export class AdminClassSessionManagementComponent implements OnInit {
  classSessions: ClassSession[] = [];
  subjects: Subject[] = [];
  students: Student[] = [];
  loading = false;
  displayedColumns: string[] = ['subject', 'instructor', 'dayOfWeek', 'startTime', 'endTime', 'room', 'actions'];

  constructor(
    private classSessionService: ClassSessionService,
    private subjectService: SubjectService,
    private studentService: StudentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.classSessionService.getAllClassSessions().toPromise(),
      this.subjectService.getAllSubjects().toPromise(),
      this.studentService.getAllStudents().toPromise()
    ]).then(([classSessions, subjects, students]) => {
      this.classSessions = classSessions || [];
      this.subjects = subjects || [];
      this.students = students || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.snackBar.open('Error loading data', 'Close', { duration: 3000 });
      this.loading = false;
    });
  }

  openClassSessionFormDialog(classSession?: ClassSession): void {
    // For now, we'll use a simple form. You can create a proper dialog component later
    const formData: ClassSessionFormData = {
      subjectId: 1,
      instructor: '',
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      studentIds: []
    };

    if (classSession) {
      // Update existing class session
      this.updateClassSession(classSession.id!, formData);
    } else {
      // Create new class session
      this.createClassSession(formData);
    }
  }

  createClassSession(classSessionData: ClassSessionFormData): void {
    this.classSessionService.createClassSession(classSessionData).subscribe({
      next: () => {
        this.snackBar.open('Class session created successfully', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (error) => {
        console.error('Error creating class session:', error);
        this.snackBar.open('Error creating class session', 'Close', { duration: 3000 });
      }
    });
  }

  updateClassSession(id: number, classSessionData: ClassSessionFormData): void {
    this.classSessionService.updateClassSession(id, classSessionData).subscribe({
      next: () => {
        this.snackBar.open('Class session updated successfully', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating class session:', error);
        this.snackBar.open('Error updating class session', 'Close', { duration: 3000 });
      }
    });
  }

  deleteClassSession(classSession: ClassSession): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Class Session',
        message: `Are you sure you want to delete the class session for "${classSession.subject.nom}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.classSessionService.deleteClassSession(classSession.id!).subscribe({
          next: () => {
            this.snackBar.open('Class session deleted successfully', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            console.error('Error deleting class session:', error);
            this.snackBar.open('Error deleting class session', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getSubjectName(subjectId: number): string {
    const subject = this.subjects.find(s => s.id === subjectId);
    return subject ? subject.nom : 'Unknown';
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // Display HH:mm format
  }

  getDayOfWeekName(dayOfWeek: DayOfWeek): string {
    const dayNames: { [key in DayOfWeek]: string } = {
      [DayOfWeek.MONDAY]: 'Monday',
      [DayOfWeek.TUESDAY]: 'Tuesday',
      [DayOfWeek.WEDNESDAY]: 'Wednesday',
      [DayOfWeek.THURSDAY]: 'Thursday',
      [DayOfWeek.FRIDAY]: 'Friday',
      [DayOfWeek.SATURDAY]: 'Saturday',
      [DayOfWeek.SUNDAY]: 'Sunday'
    };
    return dayNames[dayOfWeek] || dayOfWeek;
  }
} 