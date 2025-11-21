// src/app/components/chatbot/chatbot.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NlpService, NLPResponse, ChatMessage } from 'src/app/services/nlp.service';
import { AuthService } from "../../services/auth.service";
import { Grade, Student, User } from "../../models";
import { StudentService } from "../../services/student.service";
import { SubjectService } from "../../services/subject.service";
import { GradeService } from "../../services/grade.service";

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  question = '';
  response: NLPResponse | null = null;
  answer = '';
  loading = false;
  currentUser: User | null = null;
  student: Student | null = null;
  grades: Grade[] = [];
  average = 0;

  // Chat history
  messages: ChatMessage[] = [];

  // Suggested questions
  suggestedQuestions: string[] = [];
  showSuggestions = true;

  // Service health status
  serviceHealthy = true;

  constructor(
    private nlpService: NlpService,
    private authService: AuthService,
    private studentService: StudentService,
    private subjectService: SubjectService,
    private snackBar: MatSnackBar,
    private gradeService: GradeService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.loadStudentData(user.id);
      }
      // Load suggested questions based on user type
      this.loadSuggestedQuestions();
    });

    // Check service health
    this.checkServiceHealth();

    // Add welcome message
    this.addWelcomeMessage();
  }

  /**
   * Load student data for personal questions
   */
  private loadStudentData(userId: number): void {
    this.loading = true;

    this.studentService.getStudentByUserId(userId).subscribe({
      next: (student) => {
        this.student = student;
        this.loading = false;
        // Add personalized welcome if student found
        if (student) {
          this.addSystemMessage(`Welcome back! I can help you with both personal academic questions and general university information.`);
        }
      },
      error: (error) => {
        console.error('Error loading student data:', error);
        this.snackBar.open('Note: Personal data unavailable. You can still ask general questions.', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  /**
   * Load suggested questions based on user context
   */
  private loadSuggestedQuestions(): void {
    this.suggestedQuestions = this.nlpService.getSuggestedQuestions(!!this.student);
  }

  /**
   * Check if the NLP service is healthy
   */
  private checkServiceHealth(): void {
    this.nlpService.checkHealth().subscribe(healthy => {
      this.serviceHealthy = healthy;
      if (!healthy) {
        this.snackBar.open('Chatbot service is currently limited. Some features may be unavailable.', 'Close', {
          duration: 5000
        });
      }
    });
  }

  /**
   * Add welcome message to chat
   */
  private addWelcomeMessage(): void {
    this.addSystemMessage('Hello! I\'m your AI assistant. I can help you with:\n• Personal questions (grades, schedule, exams)\n• General information (policies, admissions, programs)\n\nHow can I help you today?');
  }

  /**
   * Main method to ask a question
   */
  askQuestion(questionText?: string): void {
    const finalQuestion = questionText || this.question;

    if (!finalQuestion || finalQuestion.trim() === '') {
      this.snackBar.open('Please enter a question', 'Close', {
        duration: 3000
      });
      return;
    }

    // Add user message to chat
    this.addUserMessage(finalQuestion);

    // Clear input if using the input field
    if (!questionText) {
      this.question = '';
    }

    // Hide suggestions after first question
    this.showSuggestions = false;

    // Set loading state
    this.loading = true;

    // Determine question type for UI feedback
    const questionType = this.nlpService.getQuestionType(finalQuestion);

    // Call the service
    this.nlpService.getAnswer(finalQuestion, this.student?.id).subscribe({
      next: (response) => {
        this.answer = response;
const messageType = questionType === 'unknown' ? 'system' : questionType;
this.addBotMessage(response, messageType);
        this.loading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error:', err);
        const errorMessage = 'Sorry, I encountered an error. Please try again or rephrase your question.';
        this.answer = errorMessage;
        this.addBotMessage(errorMessage, 'system');
        this.loading = false;
        this.scrollToBottom();
      }
    });
  }

  /**
   * Use a suggested question
   */
  useSuggestedQuestion(question: string): void {
    this.askQuestion(question);
  }

  /**
   * Add user message to chat history
   */
  private addUserMessage(text: string): void {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      text: text,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(message);
  }

  /**
   * Add bot message to chat history
   */
  private addBotMessage(text: string, type: 'personal' | 'general' | 'system' = 'general'): void {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      text: text,
      isUser: false,
      timestamp: new Date(),
      type: type
    };
    this.messages.push(message);
  }

  /**
   * Add system message to chat history
   */
  private addSystemMessage(text: string): void {
    this.addBotMessage(text, 'system');
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Scroll to bottom of chat
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        try {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch(err) {
          console.error('Scroll error:', err);
        }
      }
    }, 100);
  }

  /**
   * Clear chat history
   */
  clearChat(): void {
    this.messages = [];
    this.addWelcomeMessage();
    this.showSuggestions = true;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get icon for message type
   */
  getMessageIcon(message: ChatMessage): string {
    if (message.isUser) return 'person';
    switch(message.type) {
      case 'personal': return 'school';
      case 'general': return 'info';
      case 'system': return 'smart_toy';
      default: return 'smart_toy';
    }
  }

  /**
   * Check if Enter key was pressed (for sending message)
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askQuestion();
    }
  }
}