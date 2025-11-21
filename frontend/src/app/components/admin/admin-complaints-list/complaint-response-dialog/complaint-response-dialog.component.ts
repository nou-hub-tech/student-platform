import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComplaintService } from '../../../../services/complaint.service';
import { Complaint, Student } from '../../../../models';

export interface ComplaintResponseDialogData {
  complaint: Complaint;
  student?: Student;
}

@Component({
  selector: 'app-complaint-response-dialog',
  templateUrl: './complaint-response-dialog.component.html',
  styleUrls: ['./complaint-response-dialog.component.scss']
})
export class ComplaintResponseDialogComponent implements OnInit {
  responseForm: FormGroup;
  complaint: Complaint;
  student?: Student;
  loading = false;

  statusOptions = [
    { value: 'REVIEWED', label: 'Mark as Reviewed', color: '#2196f3', icon: 'visibility' },
    { value: 'RESOLVED', label: 'Mark as Resolved', color: '#4caf50', icon: 'check_circle' },
    { value: 'REJECTED', label: 'Mark as Rejected', color: '#f44336', icon: 'cancel' }
  ];

  responseTemplates = [
    {
      title: 'Request More Information',
      content: 'Thank you for your complaint. To better assist you, we need additional information about this matter. Please provide more details about the specific circumstances and any supporting documentation.'
    },
    {
      title: 'Grade Review Initiated',
      content: 'We have received your complaint regarding your grade and have initiated a review process. The relevant faculty members will examine your case and we will update you on the outcome within 5-7 business days.'
    },
    {
      title: 'Complaint Resolved',
      content: 'After careful review of your complaint, we have taken appropriate action to address your concerns. The matter has been resolved and any necessary corrections have been made.'
    },
    {
      title: 'Complaint Rejected',
      content: 'After thorough investigation, we have determined that the original grade/decision was appropriate and in accordance with our academic policies. No changes will be made at this time.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ComplaintResponseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComplaintResponseDialogData,
    private complaintService: ComplaintService,
    private snackBar: MatSnackBar
  ) {
    this.complaint = data.complaint;
    this.student = data.student;

    this.responseForm = this.fb.group({
      adminResponse: [this.complaint.adminResponse || '', [Validators.required, Validators.minLength(10)]],
      status: [this.complaint.status, [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  useTemplate(template: any): void {
    this.responseForm.patchValue({
      adminResponse: template.content
    });
  }

  onSubmit(): void {
    if (this.responseForm.valid) {
      this.loading = true;
      
      const formValue = this.responseForm.value;
      const updatedComplaint: Complaint = {
        ...this.complaint,
        adminResponse: formValue.adminResponse,
        status: formValue.status,
        updatedAt: new Date().toISOString()
      };

      this.complaintService.updateComplaint(this.complaint.id!, updatedComplaint).subscribe({
        next: (updated) => {
          this.snackBar.open('Response added successfully', 'Close', {
            duration: 3000
          });
          this.dialogRef.close(updated);
        },
        error: (error) => {
          console.error('Error updating complaint:', error);
          this.snackBar.open('Error adding response', 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getStatusInfo(status: string) {
    return this.statusOptions.find(option => option.value === status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getCharacterCount(): number {
    return this.responseForm.get('adminResponse')?.value?.length || 0;
  }

  isFormValid(): boolean {
    return this.responseForm.valid && !this.loading;
  }
}
