import { Grade } from './grade.model';

export interface Subject {
  id?: number;
  nom: string;
  coefficient: number;
  notes?: Grade[];
} 