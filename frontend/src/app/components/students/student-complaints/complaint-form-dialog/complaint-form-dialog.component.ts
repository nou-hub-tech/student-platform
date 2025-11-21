import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComplaintService } from '../../../../services/complaint.service';
import { Grade, Subject, ComplaintForm } from '../../../../models';

export interface ComplaintDialogData {
  studentId: number;
  grades: Grade[];
  subjects: Subject[];
}

@Component({
  selector: 'app-complaint-form-dialog',
  templateUrl: './complaint-form-dialog.component.html',
  styleUrls: ['./complaint-form-dialog.component.scss']
})
export class ComplaintFormDialogComponent implements OnInit {
  complaintForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ComplaintFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComplaintDialogData
  ) {
    this.complaintForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      noteId: [''],
      matiereId: ['']
    });
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }

  onSubmit(): void {
    if (this.complaintForm.valid) {
      this.loading = true;
      
      const formValue = this.complaintForm.value;
      const complaintData: ComplaintForm = {
        title: formValue.title,
        description: formValue.description,
        etudiantId: this.data.studentId,
        noteId: formValue.noteId || undefined,
        matiereId: formValue.matiereId || undefined
      };

      this.complaintService.createComplaint(complaintData).subscribe({
        next: (complaint) => {
          this.snackBar.open('Complaint submitted successfully', 'Close', {
            duration: 3000
          });
          this.dialogRef.close(complaint);
        },
        error: (error) => {
          console.error('Error submitting complaint:', error);
          this.snackBar.open('Error submitting complaint', 'Close', {
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

  getSubjectName(subjectId: number): string {
    const subject = this.data.subjects.find(s => s.id === subjectId);
    return subject ? subject.nom : 'Unknown Subject';
  }

  getGradeDisplay(grade: Grade): string {
    const subjectName = this.getSubjectName(grade.matiere?.id || 0);
    return `${subjectName}: ${grade.valeur}/20`;
  }
}
