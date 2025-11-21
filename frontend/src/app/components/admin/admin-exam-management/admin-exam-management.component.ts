import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExamService } from '../../../services/exam.service';
import { SubjectService } from '../../../services/subject.service';
import { StudentService } from '../../../services/student.service';
import { Exam, ExamFormData, ExamResponse } from '../../../models/exam.model';
import { Subject } from '../../../models/subject.model';
import { Student } from '../../../models/student.model';
import { ExamFormDialogComponent } from './exam-form-dialog/exam-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-exam-management',
  templateUrl: './admin-exam-management.component.html',
  styleUrls: ['./admin-exam-management.component.scss']
})
export class AdminExamManagementComponent implements OnInit {
  exams: ExamResponse[] = [];
  subjects: Subject[] = [];
  students: Student[] = [];
  loading = false;
  displayedColumns: string[] = ['title', 'subject', 'date', 'startTime', 'endTime', 'location', 'actions'];

  constructor(
    private examService: ExamService,
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
      this.examService.getAllExams().toPromise(),
      this.subjectService.getAllSubjects().toPromise(),
      this.studentService.getAllStudents().toPromise()
    ]).then(([exams, subjects, students]) => {
      this.exams = exams || [];
      this.subjects = subjects || [];
      this.students = students || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.snackBar.open('Error loading data', 'Close', { duration: 3000 });
      this.loading = false;
    });
  }

  openExamFormDialog(exam?: Exam): void {
    const dialogRef = this.dialog.open(ExamFormDialogComponent, {
      width: '600px',
      data: {
        exam,
        subjects: this.subjects,
        students: this.students
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (exam) {
          this.updateExam(exam.id!, result);
        } else {
          this.createExam(result);
        }
      }
    });
  }

  createExam(examData: ExamFormData): void {
    console.log('Creating exam with data:', examData);
    this.examService.createExam(examData).subscribe({
      next: (result) => {
        console.log('Exam created successfully:', result);
        this.snackBar.open('Exam created successfully', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (error) => {
        console.error('Error creating exam:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        this.snackBar.open('Error creating exam: ' + (error.error?.message || error.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }

  updateExam(id: number, examData: ExamFormData): void {
    this.examService.updateExam(id, examData).subscribe({
      next: () => {
        this.snackBar.open('Exam updated successfully', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating exam:', error);
        this.snackBar.open('Error updating exam', 'Close', { duration: 3000 });
      }
    });
  }

  deleteExam(exam: ExamResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Exam',
        message: `Are you sure you want to delete the exam "${exam.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.examService.deleteExam(exam.id!).subscribe({
          next: () => {
            this.snackBar.open('Exam deleted successfully', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            console.error('Error deleting exam:', error);
            this.snackBar.open('Error deleting exam', 'Close', { duration: 3000 });
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
} 