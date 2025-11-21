import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Design Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop'; // Added for chatbot drag functionality
import { LayoutModule } from '@angular/cdk/layout'; // Added for responsive layout
import { TextFieldModule } from '@angular/cdk/text-field'; // Added for textarea autosize

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentListComponent } from './components/students/student-list/student-list.component';
import { StudentDetailComponent } from './components/students/student-detail/student-detail.component';
import { StudentGradesComponent } from './components/students/student-grades/student-grades.component';
import { StudentSubjectsComponent } from './components/students/student-subjects/student-subjects.component';
import { StudentComplaintsComponent } from './components/students/student-complaints/student-complaints.component';
import { ComplaintFormDialogComponent } from './components/students/student-complaints/complaint-form-dialog/complaint-form-dialog.component';
import { AdminComplaintsDashboardComponent } from './components/admin/admin-complaints-dashboard/admin-complaints-dashboard.component';
import { AdminComplaintsListComponent } from './components/admin/admin-complaints-list/admin-complaints-list.component';
import { ComplaintDetailDialogComponent } from './components/admin/admin-complaints-list/complaint-detail-dialog/complaint-detail-dialog.component';
import { ComplaintResponseDialogComponent } from './components/admin/admin-complaints-list/complaint-response-dialog/complaint-response-dialog.component';
import { SubjectListComponent } from './components/subjects/subject-list/subject-list.component';
import { GradeListComponent } from './components/grades/grade-list/grade-list.component';
import { GradeFormComponent } from './components/grades/grade-form/grade-form.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { StudentEditDialogComponent } from './components/students/student-edit-dialog/student-edit-dialog.component';
import { SubjectEditDialogComponent } from './components/subjects/subject-edit-dialog/subject-edit-dialog.component';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';
import { AdminExamManagementComponent } from './components/admin/admin-exam-management/admin-exam-management.component';
import { ExamFormDialogComponent } from './components/admin/admin-exam-management/exam-form-dialog/exam-form-dialog.component';
import { StudentCalendarComponent } from './components/students/student-calendar/student-calendar.component';
import { FloatingChatbotComponent } from './components/floating-chatbot/floating-chatbot.component';

// Pipes
import { ArrayMaxPipe } from './pipes/array-max.pipe';
import { ArrayMinPipe } from './pipes/array-min.pipe';
import { NewlineToBrPipe } from './pipes/newline-to-br.pipe';


// Services
import { AuthService } from './services/auth.service';
import { StudentService } from './services/student.service';
import { SubjectService } from './services/subject.service';
import { GradeService } from './services/grade.service';
import { ComplaintService } from './services/complaint.service';
import { ExamService } from './services/exam.service';
import { ClassSessionService } from './services/class-session.service';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Routes
import { AppRoutingModule } from './app-routing.module';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    StudentListComponent,
    StudentDetailComponent,
    StudentGradesComponent,
    StudentSubjectsComponent,
    StudentComplaintsComponent,
    ComplaintFormDialogComponent,
    AdminComplaintsDashboardComponent,
    AdminComplaintsListComponent,
    ComplaintDetailDialogComponent,
    ComplaintResponseDialogComponent,
    SubjectListComponent,
    GradeListComponent,
    GradeFormComponent,
    NavigationComponent,
    ProfileComponent,
    NotFoundComponent,
    StudentEditDialogComponent,
    SubjectEditDialogComponent,
    ConfirmDialogComponent,
    AdminExamManagementComponent,
    ExamFormDialogComponent,
    StudentCalendarComponent,
    ArrayMaxPipe,
    ArrayMinPipe,
    NewlineToBrPipe,
    ChatbotComponent,
    FloatingChatbotComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    
    // Material Design Modules
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatTooltipModule,
    MatCheckboxModule,
    DragDropModule,
    LayoutModule,
    TextFieldModule
  ],
  providers: [
    AuthService,
    StudentService,
    SubjectService,
    GradeService,
    ComplaintService,
    ExamService,
    ClassSessionService,
    AuthGuard,
    RoleGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }