import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../models';
import { SubjectEditDialogComponent } from '../subject-edit-dialog/subject-edit-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-subject-list',
  templateUrl: './subject-list.component.html',
  styleUrls: ['./subject-list.component.scss']
})
export class SubjectListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nom', 'coefficient', 'actions'];
  dataSource: MatTableDataSource<Subject> = new MatTableDataSource<Subject>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private subjectService: SubjectService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadSubjects();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSubjects(): void {
    this.loading = true;
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.dataSource.data = subjects;
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

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addSubject(): void {
    const dialogRef = this.dialog.open(SubjectEditDialogComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSubjects();
      }
    });
  }

  editSubject(subject: Subject): void {
    const dialogRef = this.dialog.open(SubjectEditDialogComponent, {
      width: '500px',
      data: { subject: subject }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSubjects();
      }
    });
  }

  deleteSubject(subject: Subject): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Subject',
        message: `Are you sure you want to delete the subject "${subject.nom}"? This action cannot be undone and will affect all related grades.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && subject.id) {
        this.subjectService.deleteSubject(subject.id).subscribe({
          next: () => {
            this.snackBar.open('Subject deleted successfully', 'Close', { duration: 3000 });
            this.loadSubjects();
          },
          error: (error) => {
            console.error('Error deleting subject:', error);
            this.snackBar.open('Error deleting subject', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getCoefficientClass(coefficient: number): string {
    if (coefficient >= 3) return 'high-coefficient';
    if (coefficient >= 2) return 'medium-coefficient';
    return 'low-coefficient';
  }
}