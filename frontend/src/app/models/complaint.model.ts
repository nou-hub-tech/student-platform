import { Student } from './student.model';
import { Grade } from './grade.model';
import { Subject } from './subject.model';

export interface Complaint {
  id?: number;
  title: string;
  description: string;
  status: string; // PENDING, REVIEWED, RESOLVED, REJECTED
  createdAt?: string;
  updatedAt?: string;
  adminResponse?: string;
  etudiant?: Student;
  note?: Grade;
  matiere?: Subject;
  etudiantId?: number;
  noteId?: number;
  matiereId?: number;
}

export interface ComplaintForm {
  title: string;
  description: string;
  etudiantId: number;
  noteId?: number;
  matiereId?: number;
}
