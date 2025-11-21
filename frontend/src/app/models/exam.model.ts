import { Subject } from './subject.model';
import { Student } from './student.model';

export interface Exam {
  id?: number;
  title: string;
  subject: Subject;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  location: string;
  students?: Student[];
}

export interface ExamResponse {
  id: number;
  title: string;
  subjectId: number;
  subjectName: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  location: string;
  studentIds: number[];
}

export interface ExamFormData {
  title: string;
  subjectId: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  studentIds: number[];
} 