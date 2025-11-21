import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Exam, ExamFormData } from '../../../../models/exam.model';
import { Subject } from '../../../../models/subject.model';
import { Student } from '../../../../models/student.model';

@Component({
  selector: 'app-exam-form-dialog',
  templateUrl: './exam-form-dialog.component.html',
  styleUrls: ['./exam-form-dialog.component.scss']
})
export class ExamFormDialogComponent implements OnInit {
  examForm!: FormGroup;
  subjects: Subject[] = [];
  students: Student[] = [];
  selectedStudents: number[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExamFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      exam?: Exam;
      subjects: Subject[];
      students: Student[];
    }
  ) {
    this.subjects = data.subjects;
    this.students = data.students;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.examForm = this.fb.group({
      title: ['', [Validators.required]],
      subjectId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      location: ['', [Validators.required]]
    });

    if (this.data.exam) {
      this.examForm.patchValue({
        title: this.data.exam.title,
        subjectId: this.data.exam.subject.id,
        date: this.data.exam.date,
        startTime: this.data.exam.startTime,
        endTime: this.data.exam.endTime,
        location: this.data.exam.location
      });
      this.selectedStudents = this.data.exam.students?.map(s => s.id) || [];
    }
  }

  onSubmit(): void {
    if (this.examForm.valid) {
      const formValue = this.examForm.value;
      
      // Convert date to ISO string format
      let dateString = formValue.date;
      if (formValue.date instanceof Date) {
        dateString = formValue.date.toISOString().split('T')[0];
      }
      
      const formData: ExamFormData = {
        title: formValue.title,
        subjectId: formValue.subjectId,
        date: dateString,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        location: formValue.location,
        studentIds: this.selectedStudents
      };
      
      console.log('Form data being sent:', formData);
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  toggleStudent(studentId: number): void {
    const index = this.selectedStudents.indexOf(studentId);
    if (index > -1) {
      this.selectedStudents.splice(index, 1);
    } else {
      this.selectedStudents.push(studentId);
    }
  }

  isStudentSelected(studentId: number): boolean {
    return this.selectedStudents.includes(studentId);
  }
} 