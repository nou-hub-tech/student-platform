import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GradeService } from '../../../services/grade.service';
import { Grade, GradeForm, Student, Subject } from '../../../models';

export interface GradeFormData {
  grade?: Grade;
  students: Student[];
  subjects: Subject[];
}

@Component({
  selector: 'app-grade-form',
  templateUrl: './grade-form.component.html',
  styleUrls: ['./grade-form.component.scss']
})
export class GradeFormComponent implements OnInit {
  gradeForm: FormGroup;
  isLoading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private gradeService: GradeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<GradeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GradeFormData
  ) {
    this.gradeForm = this.createForm();
    this.isEditMode = !!this.data.grade;
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.grade) {
      this.gradeForm.patchValue({
        valeur: this.data.grade.valeur,
        etudiantId: this.data.grade.etudiantId || this.data.grade.etudiant?.id,
        matiereId: this.data.grade.matiereId || this.data.grade.matiere?.id
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      valeur: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      etudiantId: ['', [Validators.required]],
      matiereId: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.gradeForm.valid) {
      this.isLoading = true;
      const gradeData: GradeForm = this.gradeForm.value;
      console.log('Submitting grade data:', gradeData);

      const operation = this.isEditMode && this.data.grade?.id
        ? this.gradeService.updateGrade(this.data.grade.id, {
            id: this.data.grade.id,
            valeur: gradeData.valeur,
            etudiantId: gradeData.etudiantId,
            matiereId: gradeData.matiereId
          })
        : this.gradeService.createGrade(gradeData);

      operation.subscribe({
        next: (result) => {
          this.snackBar.open(
            this.isEditMode ? 'Grade updated successfully' : 'Grade created successfully',
            'Close',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving grade:', error);
          console.error('Grade data sent:', gradeData);
          console.error('Error details:', error.error);

          let errorMessage = 'Error saving grade';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.gradeForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (field?.hasError('min')) {
      return 'Grade must be at least 0';
    }
    if (field?.hasError('max')) {
      return 'Grade must be at most 20';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      valeur: 'Grade',
      etudiantId: 'Student',
      matiereId: 'Subject'
    };
    return displayNames[fieldName] || fieldName;
  }

  getGradeClass(grade: number): string {
    if (grade >= 16) return 'excellent';
    if (grade >= 14) return 'good';
    if (grade >= 10) return 'average';
    return 'poor';
  }
}