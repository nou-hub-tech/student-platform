import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complaint, ComplaintForm } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private readonly API_URL = 'http://localhost:8080/api/v1/complaints';

  constructor(private http: HttpClient) { }

  getAllComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(this.API_URL);
  }

  getComplaintById(id: number): Observable<Complaint> {
    return this.http.get<Complaint>(`${this.API_URL}/${id}`);
  }

  getComplaintsByStudentId(studentId: number): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.API_URL}/student/${studentId}`);
  }

  getComplaintsByStatus(status: string): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.API_URL}/status/${status}`);
  }

  createComplaint(complaint: ComplaintForm): Observable<Complaint> {
    const complaintData = {
      title: complaint.title,
      description: complaint.description,
      etudiant: { id: complaint.etudiantId },
      note: complaint.noteId ? { id: complaint.noteId } : null,
      matiere: complaint.matiereId ? { id: complaint.matiereId } : null
    };
    return this.http.post<Complaint>(this.API_URL, complaintData);
  }

  updateComplaint(id: number, complaint: Complaint): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.API_URL}/${id}`, complaint);
  }

  deleteComplaint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
