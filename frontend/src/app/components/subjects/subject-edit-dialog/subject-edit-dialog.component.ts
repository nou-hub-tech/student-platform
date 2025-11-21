import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../models';

export interface SubjectEditDialogData {
  subject?: Subject;
}

@Component({
  selector: 'app-subject-edit-dialog',
  templateUrl: './subject-edit-dialog.component.html',
  styleUrls: ['./subject-edit-dialog.component.scss']
})
export class SubjectEditDialogComponent implements OnInit {
  subjectForm: FormGroup;
  isLoading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SubjectEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubjectEditDialogData
  ) {
    this.subjectForm = this.createForm();
    this.isEditMode = !!this.data.subject;
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.subject) {
      this.subjectForm.patchValue({
        nom: this.data.subject.nom,
        coefficient: this.data.subject.coefficient
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      coefficient: ['', [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  onSubmit(): void {
    if (this.subjectForm.valid) {
      this.isLoading = true;
      const subjectData: Subject = {
        id: this.isEditMode ? this.data.subject!.id : undefined,
        ...this.subjectForm.value
      };

      const operation = this.isEditMode && this.data.subject?.id
        ? this.subjectService.updateSubject(this.data.subject.id, subjectData)
        : this.subjectService.createSubject(subjectData);

      operation.subscribe({
        next: (result) => {
          this.snackBar.open(
            this.isEditMode ? 'Subject updated successfully' : 'Subject created successfully',
            'Close',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving subject:', error);
          this.snackBar.open('Error saving subject', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.subjectForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} must be at least 2 characters`;
    }
    if (field?.hasError('min')) {
      return 'Coefficient must be at least 1';
    }
    if (field?.hasError('max')) {
      return 'Coefficient must be at most 10';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      nom: 'Subject name',
      coefficient: 'Coefficient'
    };
    return displayNames[fieldName] || fieldName;
  }

  getCoefficientClass(coefficient: number): string {
    if (coefficient >= 3) return 'high-coefficient';
    if (coefficient >= 2) return 'medium-coefficient';
    return 'low-coefficient';
  }
}
