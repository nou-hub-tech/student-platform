import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grade, GradeForm, StudentWithAverage } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private readonly API_URL = 'http://localhost:8080/api/v1/notes';

  constructor(private http: HttpClient) { }

  getAllGrades(): Observable<Grade[]> {
    return this.http.get<Grade[]>(this.API_URL);
  }

  getGradeById(id: number): Observable<Grade> {
    return this.http.get<Grade>(`${this.API_URL}/${id}`);
  }

  getGradesByStudentId(studentId: number): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.API_URL}/etudiant/${studentId}`);
  }

  createGrade(grade: GradeForm): Observable<Grade> {
    // Transform the GradeForm to the format expected by the backend
    const noteData = {
      valeur: grade.valeur,
      etudiant: { id: grade.etudiantId },
      matiere: { id: grade.matiereId }
    };
    console.log('Sending grade data to backend:', noteData);
    return this.http.post<Grade>(this.API_URL, noteData);
  }

  updateGrade(id: number, grade: Grade): Observable<Grade> {
    // Transform the Grade to the format expected by the backend
    const noteData = {
      valeur: grade.valeur,
      etudiant: { id: grade.etudiantId },
      matiere: { id: grade.matiereId }
    };
    return this.http.put<Grade>(`${this.API_URL}/${id}`, noteData);
  }

  deleteGrade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getStudentsWithAverages(): Observable<StudentWithAverage[]> {
    return this.http.get<StudentWithAverage[]>(`${this.API_URL}/moyennes`);
  }
} 