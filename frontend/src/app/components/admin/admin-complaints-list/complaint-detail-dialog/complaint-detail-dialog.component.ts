import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComplaintService } from '../../../../services/complaint.service';
import { Complaint, Student } from '../../../../models';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ComplaintDetailDialogData {
  complaint: Complaint;
  student?: Student;
}

@Component({
  selector: 'app-complaint-detail-dialog',
  templateUrl: './complaint-detail-dialog.component.html',
  styleUrls: ['./complaint-detail-dialog.component.scss']
})
export class ComplaintDetailDialogComponent implements OnInit {
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  complaint: Complaint;
  student?: Student;
  loading = false;

  statusOptions = [
    { value: 'PENDING', label: 'Pending', color: '#ff9800', icon: 'schedule' },
    { value: 'REVIEWED', label: 'Reviewed', color: '#2196f3', icon: 'visibility' },
    { value: 'RESOLVED', label: 'Resolved', color: '#4caf50', icon: 'check_circle' },
    { value: 'REJECTED', label: 'Rejected', color: '#f44336', icon: 'cancel' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ComplaintDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComplaintDetailDialogData,
    private complaintService: ComplaintService,
    private snackBar: MatSnackBar
  ) {
    this.complaint = { ...data.complaint };
    this.student = data.student;
  }

  ngOnInit(): void {
    // Component initialization
  }

  updateStatus(newStatus: string): void {
    if (this.complaint.status === newStatus) {
      return;
    }

    this.loading = true;
    const updatedComplaint = {
      ...this.complaint,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    this.complaintService.updateComplaint(this.complaint.id!, updatedComplaint).subscribe({
      next: (updated) => {
        this.complaint = updated;
        this.snackBar.open(`Complaint status updated to ${newStatus}`, 'Close', {
          duration: 3000
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating complaint status:', error);
        this.snackBar.open('Error updating complaint status', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }



  getStatusInfo(status: string) {
    return this.statusOptions.find(option => option.value === status) || this.statusOptions[0];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getTimeSinceCreated(): string {
    if (!this.complaint.createdAt) return '';
    
    const created = new Date(this.complaint.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  }

  isUrgent(): boolean {
    if (!this.complaint.createdAt || this.complaint.status !== 'PENDING') {
      return false;
    }
    
    const created = new Date(this.complaint.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    return diffDays > 3;
  }

  onClose(): void {
    this.dialogRef.close(true); // Return true to indicate data might have changed
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  exportToPDF(): void {
    const DATA = this.pdfContent.nativeElement;

    html2canvas(DATA).then(canvas => {
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      let position = 10;

      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save(`Complaint-${this.complaint.id}.pdf`);
    });
  }
}
