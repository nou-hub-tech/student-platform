import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Student } from '../models';
import { v4 as uuidv4 } from 'uuid';

export interface NLPRequest {
  question: string;
}

export interface NLPResponse {
  intent: string;
  confidence?: number;
  questionType?: 'personal' | 'general' | 'unknown';
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'personal' | 'general' | 'system';
}

export interface AnswerResponse {
  answer: string;
  questionType?: string;
  confidence?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NlpService {
  private apiUrl = 'http://localhost:8080/api/nlp/analyze';
  private answerUrl = 'http://localhost:8080/api/nlp/answer';
  private healthUrl = 'http://localhost:8080/api/nlp/health';
  private readonly API_URL = 'http://localhost:8080/api/v1/nlp';

  constructor(private http: HttpClient) {}

  /**
   * Analyze a question to determine its intent (optional, for debugging)
   */
  analyzeQuestion(question: string): Observable<NLPResponse> {
    const request: NLPRequest = { question };
    return this.http.post<NLPResponse>(this.apiUrl, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get answer for a question - handles both personal and general questions
   * The backend will automatically classify and route the question
   */
  getAnswer(question: string, studentId: number | undefined): Observable<string> {
    // If no student ID, use a default value (backend will handle it)
    const id = studentId || 0;
    const request: NLPRequest = { question };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'text/plain'
    });

    return this.http.post(`${this.answerUrl}/${id}`, request, {
      headers: headers,
      responseType: 'text'
    })
    .pipe(
      map(response => {
        // Add some client-side processing if needed
        return this.formatResponse(response, question);
      }),
      catchError(error => {
        console.error('Error getting answer:', error);
        return this.handleErrorWithFallback(error, question);
      })
    );
  }

  /**
   * Check if the NLP service is healthy
   */
  checkHealth(): Observable<boolean> {
    return this.http.get(this.healthUrl, { responseType: 'text' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /**
   * Format the response for better display
   */
  private formatResponse(response: string, question: string): string {
    // Clean up any potential formatting issues
    if (!response || response.trim() === '') {
      return 'I couldn\'t generate a response. Please try rephrasing your question.';
    }

    // Ensure proper formatting for lists
    if (response.includes('•')) {
      // Response contains bullet points, ensure proper line breaks
      return response.replace(/•/g, '\n•').trim();
    }

    return response;
  }

  /**
   * Determine question type on client side (for UI hints)
   */
  getQuestionType(question: string): 'personal' | 'general' | 'unknown' {
    const lowerQuestion = question.toLowerCase();

    // Personal indicators
    const personalKeywords = ['my', 'mine', 'i ', 'me ', 'grade', 'average', 'exam', 'score'];
    const hasPersonal = personalKeywords.some(keyword => lowerQuestion.includes(keyword));

    // General indicators
    const generalKeywords = ['what is', 'explain', 'how does', 'university', 'policy', 'admission'];
    const hasGeneral = generalKeywords.some(keyword => lowerQuestion.includes(keyword));

    if (hasPersonal && !hasGeneral) return 'personal';
    if (hasGeneral && !hasPersonal) return 'general';
    return 'unknown';
  }

  /**
   * Get suggested questions based on context
   */
  getSuggestedQuestions(isStudent: boolean): string[] {
    if (isStudent) {
      return [
        'What is my current average?',
        'Show me my grades',
        'When is my next exam?',
        'What are the admission requirements?',
        'Explain the university grading system',
        'What scholarships are available?'
      ];
    } else {
      return [
        'What is the university policy on attendance?',
        'Explain the admission process',
        'What programs does the university offer?',
        'How does the grading system work?'
      ];
    }
  }

  /**
   * Handle errors with fallback responses
   */
  private handleErrorWithFallback(error: any, question: string): Observable<string> {
    console.error('Service error:', error);

    // Determine if it might be a connection issue
    if (error.status === 0 || error.status === 503) {
      return of('The chatbot service is temporarily unavailable. Please try again later.');
    }

    // Check if it's a timeout
    if (error.name === 'TimeoutError') {
      return of('The request timed out. Please try asking a simpler question.');
    }

    // Generic fallback based on question type
    const questionType = this.getQuestionType(question);
    if (questionType === 'personal') {
      return of('I couldn\'t retrieve your personal information. Please ensure you\'re logged in and try again.');
    } else if (questionType === 'general') {
      return of('I couldn\'t access the knowledge base. Please try again or contact support.');
    }

    return of('Something went wrong. Please try rephrasing your question or try again later.');
  }

  /**
   * Standard error handler
   */
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    const errorMessage = error.error?.message || 'Something went wrong. Please try again.';
    return throwError(() => new Error(errorMessage));
  }


}