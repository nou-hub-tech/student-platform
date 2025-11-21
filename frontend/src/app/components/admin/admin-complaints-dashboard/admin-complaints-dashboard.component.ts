import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComplaintService } from '../../../services/complaint.service';
import { StudentService } from '../../../services/student.service';
import { Complaint, Student } from '../../../models';
import { CommonModule } from '@angular/common';

interface ComplaintStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  rejected: number;
  thisWeek: number;
  thisMonth: number;
}

@Component({
  selector: 'app-admin-complaints-dashboard',
  templateUrl: './admin-complaints-dashboard.component.html',
  styleUrls: ['./admin-complaints-dashboard.component.scss']
})
export class AdminComplaintsDashboardComponent implements OnInit {
  complaints: Complaint[] = [];
  students: Student[] = [];
  loading = true;
  stats: ComplaintStats = {
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    rejected: 0,
    thisWeek: 0,
    thisMonth: 0
  };

  recentComplaints: Complaint[] = [];
  urgentComplaints: Complaint[] = [];

  constructor(
    private complaintService: ComplaintService,
    private studentService: StudentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Load all complaints and students in parallel
    Promise.all([
      this.complaintService.getAllComplaints().toPromise(),
      this.studentService.getAllStudents().toPromise()
    ]).then(([complaints, students]) => {
      this.complaints = complaints || [];
      this.students = students || [];
      
      this.calculateStats();
      this.getRecentComplaints();
      this.getUrgentComplaints();
      this.loading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.snackBar.open('Error loading complaints data', 'Close', {
        duration: 3000
      });
      this.loading = false;
    });
  }

  private calculateStats(): void {
    this.stats.total = this.complaints.length;
    this.stats.pending = this.complaints.filter(c => c.status === 'PENDING').length;
    this.stats.reviewed = this.complaints.filter(c => c.status === 'REVIEWED').length;
    this.stats.resolved = this.complaints.filter(c => c.status === 'RESOLVED').length;
    this.stats.rejected = this.complaints.filter(c => c.status === 'REJECTED').length;

    // Calculate this week and this month
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.stats.thisWeek = this.complaints.filter(c => {
      const createdDate = new Date(c.createdAt || '');
      return createdDate >= oneWeekAgo;
    }).length;

    this.stats.thisMonth = this.complaints.filter(c => {
      const createdDate = new Date(c.createdAt || '');
      return createdDate >= oneMonthAgo;
    }).length;
  }

  private getRecentComplaints(): void {
    this.recentComplaints = this.complaints
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);
  }

  private getUrgentComplaints(): void {
    // Urgent complaints are pending complaints older than 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    this.urgentComplaints = this.complaints
      .filter(c => c.status === 'PENDING' && new Date(c.createdAt || '') < threeDaysAgo)
      .sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime())
      .slice(0, 5);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return '#ff9800';
      case 'REVIEWED': return '#2196f3';
      case 'RESOLVED': return '#4caf50';
      case 'REJECTED': return '#f44336';
      default: return '#666';
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

  getStudentName(studentId: number): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? `${student.prenom} ${student.nom}` : 'Unknown Student';
  }

  navigateToComplaintsList(): void {
    this.router.navigate(['/admin/complaints/list']);
  }

  navigateToComplaintDetail(complaint: Complaint): void {
    this.router.navigate(['/admin/complaints', complaint.id]);
  }

  getResolutionRate(): number {
    if (this.stats.total === 0) return 0;
    return ((this.stats.resolved + this.stats.rejected) / this.stats.total) * 100;
  }

  getPendingPercentage(): number {
    if (this.stats.total === 0) return 0;
    return (this.stats.pending / this.stats.total) * 100;
  }

  getDaysSinceCreated(createdAt: string): number {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
