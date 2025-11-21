import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../models';

@Component({
  selector: 'app-student-subjects',
  templateUrl: './student-subjects.component.html',
  styleUrls: ['./student-subjects.component.scss']
})
export class StudentSubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  loading = true;
  displayedColumns: string[] = ['nom', 'coefficient'];

  constructor(
    private subjectService: SubjectService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadSubjects();
  }

  private loadSubjects(): void {
    this.loading = true;
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.snackBar.open('Error loading subjects', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  getTotalCoefficients(): number {
    return this.subjects.reduce((total, subject) => total + subject.coefficient, 0);
  }

  getCoefficientPercentage(coefficient: number): number {
    const total = this.getTotalCoefficients();
    return total > 0 ? (coefficient / total) * 100 : 0;
  }
}
