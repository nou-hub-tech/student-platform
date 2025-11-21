import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StudentService } from '../../../services/student.service';
import { GradeService } from '../../../services/grade.service';
import { SubjectService } from '../../../services/subject.service';
import { Student, Grade, Subject } from '../../../models';
import { GradeFormComponent } from '../../grades/grade-form/grade-form.component';
import { StudentEditDialogComponent } from '../student-edit-dialog/student-edit-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss']
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  grades: Grade[] = [];
  subjects: Subject[] = [];
  loading = false;
  gradesLoading = false;
  studentId: number = 0;
  average: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private gradeService: GradeService,
    private subjectService: SubjectService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.studentId = +params['id'];
      if (this.studentId) {
        this.loadStudent();
        this.loadStudentGrades();
        this.loadSubjects();
      }
    });
  }

  loadStudent(): void {
    this.loading = true;
    this.studentService.getStudentById(this.studentId).subscribe({
      next: (student) => {
        this.student = student;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.snackBar.open('Error loading student details', 'Close', {
          duration: 3000
        });
        this.loading = false;
        this.router.navigate(['/students']);
      }
    });
  }

  loadStudentGrades(): void {
    this.gradesLoading = true;
    this.gradeService.getGradesByStudentId(this.studentId).subscribe({
      next: (grades) => {
        this.grades = grades;
        this.calculateAverage();
        this.gradesLoading = false;
      },
      error: (error) => {
        console.error('Error loading grades:', error);
        this.snackBar.open('Error loading grades', 'Close', {
          duration: 3000
        });
        this.gradesLoading = false;
      }
    });
  }

  loadSubjects(): void {
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      }
    });
  }

  calculateAverage(): void {
    if (this.grades.length === 0) {
      this.average = 0;
      return;
    }

    let totalWeightedGrades = 0;
    let totalCoefficients = 0;

    this.grades.forEach(grade => {
      const coefficient = grade.matiere?.coefficient || 1;
      totalWeightedGrades += grade.valeur * coefficient;
      totalCoefficients += coefficient;
    });

    this.average = totalCoefficients > 0 ? totalWeightedGrades / totalCoefficients : 0;
  }

  editStudent(): void {
    if (!this.student) return;

    const dialogRef = this.dialog.open(StudentEditDialogComponent, {
      width: '500px',
      data: { student: this.student }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStudent();
      }
    });
  }

  addGrade(): void {
    if (!this.student) return;

    const dialogRef = this.dialog.open(GradeFormComponent, {
      width: '500px',
      data: {
        students: [this.student],
        subjects: this.subjects
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStudentGrades();
      }
    });
  }

  editGrade(grade: Grade): void {
    if (!this.student) return;

    const dialogRef = this.dialog.open(GradeFormComponent, {
      width: '500px',
      data: {
        grade: grade,
        students: [this.student],
        subjects: this.subjects
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStudentGrades();
      }
    });
  }

  deleteGrade(grade: Grade): void {
    const subjectName = grade.matiere ? grade.matiere.nom : 'Unknown Subject';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Grade',
        message: `Are you sure you want to delete the grade ${grade.valeur} in ${subjectName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && grade.id) {
        this.gradeService.deleteGrade(grade.id).subscribe({
          next: () => {
            this.snackBar.open('Grade deleted successfully', 'Close', { duration: 3000 });
            this.loadStudentGrades();
          },
          error: (error) => {
            console.error('Error deleting grade:', error);
            this.snackBar.open('Error deleting grade', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getGradeClass(grade: number): string {
    if (grade >= 16) return 'excellent';
    if (grade >= 14) return 'good';
    if (grade >= 10) return 'average';
    return 'poor';
  }

  getAverageClass(): string {
    return this.getGradeClass(this.average);
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }
}