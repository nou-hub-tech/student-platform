import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GradeService } from '../../../services/grade.service';
import { StudentService } from '../../../services/student.service';
import { SubjectService } from '../../../services/subject.service';
import { Grade, Student, Subject } from '../../../models';
import { GradeFormComponent } from '../grade-form/grade-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-grade-list',
  templateUrl: './grade-list.component.html',
  styleUrls: ['./grade-list.component.scss']
})
export class GradeListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'valeur', 'etudiant', 'matiere', 'actions'];
  dataSource: MatTableDataSource<Grade> = new MatTableDataSource<Grade>([]);
  loading = false;
  students: Student[] = [];
  subjects: Subject[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private gradeService: GradeService,
    private studentService: StudentService,
    private subjectService: SubjectService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log('Grade list component initialized');

    // Test backend connectivity first
    this.studentService.testConnection().subscribe({
      next: (response) => {
        console.log('Backend is reachable:', response);
        this.loadGrades();
        this.loadStudents();
        this.loadSubjects();
      },
      error: (error) => {
        console.error('Backend is not reachable:', error);
        this.snackBar.open('Backend server is not reachable. Please check if the server is running.', 'Close', {
          duration: 5000
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadGrades(): void {
    this.loading = true;
    this.gradeService.getAllGrades().subscribe({
      next: (grades) => {
        this.dataSource.data = grades;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading grades:', error);
        this.snackBar.open('Error loading grades', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  loadStudents(): void {
    console.log('Loading students...');
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        console.log('Students loaded successfully:', students);
        this.students = students;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        console.error('Error details:', error.error);
        this.snackBar.open('Error loading students', 'Close', {
          duration: 3000
        });
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

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addGrade(): void {
    const dialogRef = this.dialog.open(GradeFormComponent, {
      width: '500px',
      data: { students: this.students, subjects: this.subjects }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGrades();
      }
    });
  }

  editGrade(grade: Grade): void {
    const dialogRef = this.dialog.open(GradeFormComponent, {
      width: '500px',
      data: {
        grade: grade,
        students: this.students,
        subjects: this.subjects
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGrades();
      }
    });
  }

  deleteGrade(grade: Grade): void {
    const studentName = grade.etudiant ? `${grade.etudiant.prenom} ${grade.etudiant.nom}` : 'Unknown Student';
    const subjectName = grade.matiere ? grade.matiere.nom : 'Unknown Subject';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Grade',
        message: `Are you sure you want to delete the grade ${grade.valeur} for ${studentName} in ${subjectName}? This action cannot be undone.`,
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
            this.loadGrades();
          },
          error: (error) => {
            console.error('Error deleting grade:', error);
            this.snackBar.open('Error deleting grade', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getStudentName(grade: Grade): string {
    return grade.etudiant ? `${grade.etudiant.prenom} ${grade.etudiant.nom}` : 'Unknown Student';
  }

  getSubjectName(grade: Grade): string {
    return grade.matiere ? grade.matiere.nom : 'Unknown Subject';
  }

  getGradeClass(grade: number): string {
    if (grade >= 16) return 'excellent';
    if (grade >= 14) return 'good';
    if (grade >= 10) return 'average';
    return 'poor';
  }
}