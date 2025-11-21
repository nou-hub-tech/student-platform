import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassSession, ClassSessionFormData, DayOfWeek } from '../models/class-session.model';

@Injectable({
  providedIn: 'root'
})
export class ClassSessionService {
  private readonly API_URL = 'http://localhost:8080/api/class-sessions';

  constructor(private http: HttpClient) { }

  // Admin methods
  getAllClassSessions(): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(this.API_URL);
  }

  getClassSessionById(id: number): Observable<ClassSession> {
    return this.http.get<ClassSession>(`${this.API_URL}/${id}`);
  }

  createClassSession(classSessionData: ClassSessionFormData): Observable<ClassSession> {
    return this.http.post<ClassSession>(this.API_URL, classSessionData);
  }

  updateClassSession(id: number, classSessionData: ClassSessionFormData): Observable<ClassSession> {
    return this.http.put<ClassSession>(`${this.API_URL}/${id}`, classSessionData);
  }

  deleteClassSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  addStudentToClassSession(classSessionId: number, studentId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${classSessionId}/students/${studentId}`, {});
  }

  removeStudentFromClassSession(classSessionId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${classSessionId}/students/${studentId}`);
  }

  // Student methods
  getClassSessionsByStudentId(studentId: number): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(`${this.API_URL}/student/${studentId}`);
  }

  getClassSessionsByStudentAndDayOfWeek(studentId: number, dayOfWeek: DayOfWeek): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(`${this.API_URL}/student/${studentId}/day/${dayOfWeek}`);
  }

  // Additional filtering methods
  getClassSessionsByDayOfWeek(dayOfWeek: DayOfWeek): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(`${this.API_URL}/day/${dayOfWeek}`);
  }

  getClassSessionsBySubjectId(subjectId: number): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(`${this.API_URL}/subject/${subjectId}`);
  }
} 