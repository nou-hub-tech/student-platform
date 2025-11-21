import { Student } from './student.model';
import { Subject } from './subject.model';

export interface Grade {
  id?: number;
  valeur: number;
  etudiant?: Student;
  matiere?: Subject;
  etudiantId?: number;
  matiereId?: number;
  date?: Date; // Adding missing date property
}

export interface GradeForm {
  valeur: number;
  etudiantId: number;
  matiereId: number;
}
