import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Exam, ExamFormData, ExamResponse } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly API_URL = 'http://localhost:8080/api/exams';

  constructor(private http: HttpClient) { }

  // Admin methods
  getAllExams(): Observable<ExamResponse[]> {
    return this.http.get<ExamResponse[]>(this.API_URL);
  }

  getExamById(id: number): Observable<ExamResponse> {
    return this.http.get<ExamResponse>(`${this.API_URL}/${id}`);
  }

  createExam(examData: ExamFormData): Observable<ExamResponse> {
    console.log('Sending exam data:', examData);
    return this.http.post<ExamResponse>(this.API_URL, examData).pipe(
      catchError(error => {
        console.error('Error creating exam:', error);
        throw error;
      })
    );
  }

  updateExam(id: number, examData: ExamFormData): Observable<Exam> {
    return this.http.put<Exam>(`${this.API_URL}/${id}`, examData);
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  addStudentToExam(examId: number, studentId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${examId}/students/${studentId}`, {});
  }

  removeStudentFromExam(examId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${examId}/students/${studentId}`);
  }

  // Student methods
  getExamsByStudentId(studentId: number): Observable<ExamResponse[]> {
    return this.http.get<ExamResponse[]>(`${this.API_URL}/student/${studentId}`);
  }

  getExamsByStudentAndDateRange(studentId: number, startDate: string, endDate: string): Observable<ExamResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ExamResponse[]>(`${this.API_URL}/student/${studentId}/date-range`, { params });
  }

  // Additional filtering methods
  getExamsByDateRange(startDate: string, endDate: string): Observable<ExamResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ExamResponse[]>(`${this.API_URL}/date-range`, { params });
  }

  getExamsBySubjectId(subjectId: number): Observable<ExamResponse[]> {
    return this.http.get<ExamResponse[]>(`${this.API_URL}/subject/${subjectId}`);
  }
} 