import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NlpService, ChatMessage } from '../../services/nlp.service';
import { AuthService } from '../../services/auth.service';
import { Student, User } from '../../models';
import { Subscription } from 'rxjs';
import { StudentService } from "../../services/student.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-floating-chatbot',
  templateUrl: './floating-chatbot.component.html',
  styleUrls: ['./floating-chatbot.component.scss']
})
export class FloatingChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  isOpen = false;
  isLoading = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  currentUser: User | null = null;
  student: Student | null = null;

  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  translateX = 0;
  translateY = 0;

  @ViewChild('chatMessages') chatMessagesContainer!: ElementRef; // Added ! for strict null checking

  private authSubscription: Subscription;
  private shouldScrollToBottom = false;

  // Position tracking
  chatPosition = '';

  constructor(
    private nlpService: NlpService,
    private authService: AuthService,
    private studentService: StudentService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    // Add welcome message
    this.addMessage('Hello! I\'m your student assistant. How can I help you today?', false);
    this.loadStudentData(this.currentUser?.id);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }

  sendMessage(): void {
    const message = this.currentMessage.trim();
    if (!message || this.isLoading) return;

    // Add user message
    this.addMessage(message, true);
    this.currentMessage = '';
    this.isLoading = true;

    const studentId = this.student?.id;

    // Get bot response
    this.nlpService.getAnswer(message, studentId).subscribe({
      next: (response) => {
        this.addMessage(response, false);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error processing message:', error);
        this.addMessage('Sorry, I encountered an error. Please try again later.', false);
        this.isLoading = false;
      }
    });
  }

  onKeyPress(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.sendMessage();
    }
  }

  private addMessage(text: string, isUser: boolean): void {
    this.messages.push({
      id: uuidv4(),
      text,
      isUser,
      timestamp: new Date()
    });
    this.shouldScrollToBottom = true;
  }

  private scrollToBottom(): void {
    if (this.chatMessagesContainer) {
      const element = this.chatMessagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatMessage(text: string): string {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const textWithLinks = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Replace newlines with <br> tags
    return textWithLinks.replace(/\n/g, '<br>');
  }

  loadStudentData(userId: number | undefined): void {
    if (!userId) return;

    this.studentService.getStudentByUserId(userId).subscribe({
      next: (student) => {
        this.student = student;
      },
      error: (error) => {
        console.error('Error loading student data:', error);
      }
    });
  }

  // Drag handling
  onDragStarted(event: CdkDragStart): void {
    // Optional: Add a class or change styling when dragging starts
  }

  onDragEnded(event: CdkDragEnd): void {
    // Optional: Handle logic after drag ends
  }

onMouseDown(event: MouseEvent): void {
  this.isDragging = true;
  this.dragStartX = event.clientX - this.translateX;
  this.dragStartY = event.clientY - this.translateY;
}

onMouseMove(event: MouseEvent): void {
  if (!this.isDragging) return;
  this.translateX = event.clientX - this.dragStartX;
  this.translateY = event.clientY - this.dragStartY;
  this.chatPosition = `translate(${this.translateX}px, ${this.translateY}px)`;
}
onMouseUp(): void {
  this.isDragging = false;
}
}
