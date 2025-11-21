import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentService } from '../../../services/student.service';
import { Student } from '../../../models';

@Component({
  selector: 'app-student-edit-dialog',
  templateUrl: './student-edit-dialog.component.html',
  styleUrls: ['./student-edit-dialog.component.scss']
})
export class StudentEditDialogComponent implements OnInit {
  studentForm: FormGroup;
  isLoading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<StudentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student?: Student }
  ) {
    this.isEditMode = !!data?.student;
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.student) {
      this.studentForm.patchValue({
        nom: this.data.student.nom,
        prenom: this.data.student.prenom,
        email: this.data.student.email
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.isLoading = true;
      const studentData: Student = {
        id: this.isEditMode ? this.data.student!.id : 0,
        ...this.studentForm.value
      };

      const operation = this.isEditMode
        ? this.studentService.updateStudent(studentData.id, studentData)
        : this.studentService.createStudent(studentData);

      operation.subscribe({
        next: (result) => {
          this.isLoading = false;
          const message = this.isEditMode 
            ? 'Student updated successfully' 
            : 'Student created successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving student:', error);
          const message = this.isEditMode 
            ? 'Error updating student' 
            : 'Error creating student';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.studentForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}
