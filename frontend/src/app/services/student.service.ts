import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Student, StudentWithAverage } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly API_URL = 'http://localhost:8080/api/v1/etudiants';

  constructor(private http: HttpClient) { }

  getAllStudents(): Observable<Student[]> {
    console.log('Fetching students from:', this.API_URL);
    return this.http.get<Student[]>(this.API_URL).pipe(
      tap(students => console.log('Students received:', students)),
      catchError(error => {
        console.error('Error fetching students:', error);
        console.error('Error details:', error.error);
        console.error('Status:', error.status);
        console.error('URL:', error.url);
        throw error;
      })
    );
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/${id}`);
  }

  getCurrentStudent(): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/me`);
  }

  getStudentByUserId(userId: number | undefined): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/user/${userId}`);
  }

  createStudent(student: Student): Observable<Student> {
    return this.http.post<Student>(this.API_URL, student);
  }

  updateStudent(id: number, student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.API_URL}/${id}`, student);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getStudentsWithAverages(): Observable<StudentWithAverage[]> {
    return this.http.get<StudentWithAverage[]>(`${this.API_URL}/moyennes`);
  }

  // Test method to check backend connectivity
  testConnection(): Observable<any> {
    console.log('Testing backend connection...');
    return this.http.get(`http://localhost:8080/api/v1/auth/test`).pipe(
      tap(response => console.log('Backend test response:', response)),
      catchError(error => {
        console.error('Backend connection test failed:', error);
        throw error;
      })
    );
  }
} 