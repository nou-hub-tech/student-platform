import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { SubjectService } from '../../services/subject.service';
import { GradeService } from '../../services/grade.service';
import { Student, Subject, Grade, StudentWithAverage } from '../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  students: Student[] = [];
  subjects: Subject[] = [];
  grades: Grade[] = [];
  studentsWithAverages: StudentWithAverage[] = [];
  loading = true;
  today = new Date(); // Added for displaying current date

  // Dashboard stats
  totalStudents = 0;
  totalSubjects = 0;
  totalGrades = 0;
  averageGrade = 0;

  constructor(
    private studentService: StudentService,
    private subjectService: SubjectService,
    private gradeService: GradeService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Load all data in parallel using forkJoin instead of Promise.all with toPromise
    forkJoin({
      students: this.studentService.getAllStudents(),
      subjects: this.subjectService.getAllSubjects(),
      grades: this.gradeService.getAllGrades(),
      studentsWithAverages: this.gradeService.getStudentsWithAverages()
    }).subscribe({
      next: (data) => {
        this.students = data.students || [];
        this.subjects = data.subjects || [];
        this.grades = data.grades || [];
        this.studentsWithAverages = data.studentsWithAverages || [];

        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private calculateStats(): void {
    this.totalStudents = this.students.length;
    this.totalSubjects = this.subjects.length;
    this.totalGrades = this.grades.length;
    
    if (this.grades.length > 0) {
      const totalGrade = this.grades.reduce((sum, grade) => sum + grade.valeur, 0);
      this.averageGrade = totalGrade / this.grades.length;
    }
  }

  getTopStudents(): StudentWithAverage[] {
    return this.studentsWithAverages
      .sort((a, b) => b.moyenne - a.moyenne)
      .slice(0, 5);
  }

  getRecentGrades(): Grade[] {
    return this.grades
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);
  }
}
