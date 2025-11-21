import { Grade } from './grade.model';

export interface Student {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  userId?: number;
  notes?: Grade[];
}

export interface StudentWithAverage {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  moyenne: number;
} 