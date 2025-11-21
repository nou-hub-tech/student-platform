import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { ComplaintService } from '../../../services/complaint.service';
import { StudentService } from '../../../services/student.service';
import { Complaint, Student } from '../../../models';
import { ComplaintDetailDialogComponent } from './complaint-detail-dialog/complaint-detail-dialog.component';
import { ComplaintResponseDialogComponent } from './complaint-response-dialog/complaint-response-dialog.component';

@Component({
  selector: 'app-admin-complaints-list',
  templateUrl: './admin-complaints-list.component.html',
  styleUrls: ['./admin-complaints-list.component.scss']
})
export class AdminComplaintsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Complaint>();
  complaints: Complaint[] = [];
  students: Student[] = [];
  loading = true;

  displayedColumns: string[] = [
    'title', 
    'student', 
    'status', 
    'createdAt', 
    'subject', 
    'actions'
  ];

  // Filter controls
  statusFilter = new FormControl('');
  searchFilter = new FormControl('');
  
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REVIEWED', label: 'Reviewed' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  constructor(
    private complaintService: ComplaintService,
    private studentService: StudentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sorting for nested properties
    this.dataSource.sortingDataAccessor = (data: Complaint, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'student':
          return this.getStudentName(data.etudiant?.id || 0);
        case 'subject':
          return data.matiere?.nom || '';
        case 'createdAt':
          return new Date(data.createdAt || '').getTime();
        default:
          return (data as any)[sortHeaderId];
      }
    };
  }

  private loadData(): void {
    this.loading = true;

    Promise.all([
      this.complaintService.getAllComplaints().toPromise(),
      this.studentService.getAllStudents().toPromise()
    ]).then(([complaints, students]) => {
      this.complaints = complaints || [];
      this.students = students || [];
      this.dataSource.data = this.complaints;
      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.snackBar.open('Error loading complaints', 'Close', {
        duration: 3000
      });
      this.loading = false;
    });
  }

  private setupFilters(): void {
    // Status filter
    this.statusFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Search filter
    this.searchFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Complaint, filter: string) => {
      const filterObj = JSON.parse(filter);
      
      // Status filter
      if (filterObj.status && data.status !== filterObj.status) {
        return false;
      }

      // Search filter
      if (filterObj.search) {
        const searchTerm = filterObj.search.toLowerCase();
        const studentName = this.getStudentName(data.etudiant?.id || 0).toLowerCase();
        const title = data.title.toLowerCase();
        const description = data.description.toLowerCase();
        const subjectName = (data.matiere?.nom || '').toLowerCase();

        return studentName.includes(searchTerm) ||
               title.includes(searchTerm) ||
               description.includes(searchTerm) ||
               subjectName.includes(searchTerm);
      }

      return true;
    };
  }

  private applyFilters(): void {
    const filterValue = {
      status: this.statusFilter.value || '',
      search: this.searchFilter.value || ''
    };
    
    this.dataSource.filter = JSON.stringify(filterValue);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStudentName(studentId: number): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? `${student.prenom} ${student.nom}` : 'Unknown Student';
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
    const dialogRef = this.dialog.open(ComplaintDetailDialogComponent, {
      width: '800px',
      data: { 
        complaint, 
        student: this.students.find(s => s.id === complaint.etudiant?.id) 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData(); // Reload data if complaint was updated
      }
    });
  }

  respondToComplaint(complaint: Complaint): void {
    const dialogRef = this.dialog.open(ComplaintResponseDialogComponent, {
      width: '600px',
      data: { 
        complaint,
        student: this.students.find(s => s.id === complaint.etudiant?.id)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData(); // Reload data if response was added
      }
    });
  }

  clearFilters(): void {
    this.statusFilter.setValue('');
    this.searchFilter.setValue('');
  }

  exportComplaints(): void {
    // Implementation for exporting complaints data
    this.snackBar.open('Export functionality coming soon', 'Close', {
      duration: 3000
    });
  }

  getFilteredCount(): number {
    return this.dataSource.filteredData.length;
  }

  getTotalCount(): number {
    return this.complaints.length;
  }

  isUrgentComplaint(complaint: Complaint): boolean {
    if (!complaint.createdAt || complaint.status !== 'PENDING') {
      return false;
    }
    const created = new Date(complaint.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 3;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchFilter.value || this.statusFilter.value);
  }

  hasNoActiveFilters(): boolean {
    return !this.searchFilter.value && !this.statusFilter.value;
  }
}
