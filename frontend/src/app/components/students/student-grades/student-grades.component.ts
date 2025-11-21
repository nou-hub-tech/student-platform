import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { StudentService } from '../../../services/student.service';
import { GradeService } from '../../../services/grade.service';
import { SubjectService } from '../../../services/subject.service';
import { Student, Grade, Subject, User } from '../../../models';

@Component({
  selector: 'app-student-grades',
  templateUrl: './student-grades.component.html',
  styleUrls: ['./student-grades.component.scss']
})

export class StudentGradesComponent implements OnInit {
  currentUser: User | null = null;
  student: Student | null = null;
  grades: Grade[] = [];
  subjects: Subject[] = [];
  loading = true;
  average = 0;

  displayedColumns: string[] = ['matiere', 'valeur', 'coefficient'];

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private gradeService: GradeService,
    private subjectService: SubjectService,
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
    
    // First get the student record by user ID
    this.studentService.getStudentByUserId(userId).subscribe({
      next: (student) => {
        this.student = student;
        if (student.id) {
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

  private loadGrades(studentId: number): void {
    this.gradeService.getGradesByStudentId(studentId).subscribe({
      next: (grades) => {
        this.grades = grades;
        this.calculateAverage();
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

  private calculateAverage(): void {
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

  getSubjectName(matiereId: number): string {
    const subject = this.subjects.find(s => s.id === matiereId);
    return subject ? subject.nom : 'Unknown Subject';
  }

  getSubjectCoefficient(matiereId: number): number {
    const subject = this.subjects.find(s => s.id === matiereId);
    return subject ? subject.coefficient : 1;
  }

  getGradeColor(grade: number): string {
    if (grade >= 16) return 'excellent';
    if (grade >= 14) return 'good';
    if (grade >= 12) return 'average';
    if (grade >= 10) return 'passing';
    return 'failing';
  }
}
