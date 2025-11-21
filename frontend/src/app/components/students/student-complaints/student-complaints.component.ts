import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { StudentService } from '../../../services/student.service';
import { ComplaintService } from '../../../services/complaint.service';
import { GradeService } from '../../../services/grade.service';
import { SubjectService } from '../../../services/subject.service';
import { Student, Complaint, Grade, Subject, User } from '../../../models';
import { ComplaintFormDialogComponent } from './complaint-form-dialog/complaint-form-dialog.component';

@Component({
  selector: 'app-student-complaints',
  templateUrl: './student-complaints.component.html',
  styleUrls: ['./student-complaints.component.scss']
})
export class StudentComplaintsComponent implements OnInit {
  currentUser: User | null = null;
  student: Student | null = null;
  complaints: Complaint[] = [];
  grades: Grade[] = [];
  subjects: Subject[] = [];
  loading = true;

  displayedColumns: string[] = ['title', 'status', 'createdAt', 'actions'];

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private complaintService: ComplaintService,
    private gradeService: GradeService,
    private subjectService: SubjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.loadStudentData(user.id);
      }
    });
  }

  private loadStudentData(userId: number): void {
    this.loading = true;
    
    // Get student record by user ID
    this.studentService.getStudentByUserId(userId).subscribe({
      next: (student) => {
        this.student = student;
        if (student.id) {
          this.loadComplaints(student.id);
          this.loadGrades(student.id);
        }
      },
      error: (error) => {
        console.error('Error loading student data:', error);
        this.snackBar.open('Error loading student information', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });

    // Load subjects for reference
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      }
    });
  }

  private loadComplaints(studentId: number): void {
    this.complaintService.getComplaintsByStudentId(studentId).subscribe({
      next: (complaints) => {
        this.complaints = complaints;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading complaints:', error);
        this.snackBar.open('Error loading complaints', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  private loadGrades(studentId: number): void {
    this.gradeService.getGradesByStudentId(studentId).subscribe({
      next: (grades) => {
        this.grades = grades;
      },
      error: (error) => {
        console.error('Error loading grades:', error);
      }
    });
  }

  openComplaintDialog(): void {
    if (!this.student) {
      this.snackBar.open('Student information not available', 'Close', {
        duration: 3000
      });
      return;
    }

    const dialogRef = this.dialog.open(ComplaintFormDialogComponent, {
      width: '600px',
      data: {
        studentId: this.student.id,
        grades: this.grades,
        subjects: this.subjects
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.student?.id) {
        this.loadComplaints(this.student.id);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'REVIEWED': return 'accent';
      case 'RESOLVED': return 'primary';
      case 'REJECTED': return 'warn';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING': return 'schedule';
      case 'REVIEWED': return 'visibility';
      case 'RESOLVED': return 'check_circle';
      case 'REJECTED': return 'cancel';
      default: return 'help';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  viewComplaint(complaint: Complaint): void {
    // Implementation for viewing complaint details
    console.log('View complaint:', complaint);
  }

  getComplaintsByStatus(status: string): Complaint[] {
    return this.complaints.filter(c => c.status === status);
  }
}
