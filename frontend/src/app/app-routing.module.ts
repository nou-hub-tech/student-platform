import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentListComponent } from './components/students/student-list/student-list.component';
import { StudentDetailComponent } from './components/students/student-detail/student-detail.component';
import { StudentGradesComponent } from './components/students/student-grades/student-grades.component';
import { StudentSubjectsComponent } from './components/students/student-subjects/student-subjects.component';
import { StudentComplaintsComponent } from './components/students/student-complaints/student-complaints.component';
import { AdminComplaintsDashboardComponent } from './components/admin/admin-complaints-dashboard/admin-complaints-dashboard.component';
import { AdminComplaintsListComponent } from './components/admin/admin-complaints-list/admin-complaints-list.component';
import { AdminExamManagementComponent } from './components/admin/admin-exam-management/admin-exam-management.component';
import { StudentCalendarComponent } from './components/students/student-calendar/student-calendar.component';
import { SubjectListComponent } from './components/subjects/subject-list/subject-list.component';
import { GradeListComponent } from './components/grades/grade-list/grade-list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';


import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'students',
    component: StudentListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'students/:id',
    component: StudentDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-grades',
    component: StudentGradesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_STUDENT'] }
  },
  {
    path: 'my-subjects',
    component: StudentSubjectsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_STUDENT'] }
  },
  {
    path: 'my-complaints',
    component: StudentComplaintsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_STUDENT'] }
  },
  {
    path: 'my-calendar',
    component: StudentCalendarComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_STUDENT'] }
  },
    {
    path: 'chatbot',
    component: ChatbotComponent,
    canActivate: [AuthGuard],
      data: { roles: ['ROLE_STUDENT'] }
  },

  {
    path: 'subjects',
    component: SubjectListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'grades',
    component: GradeListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'admin/complaints',
    component: AdminComplaintsDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'admin/complaints/list',
    component: AdminComplaintsListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'admin/exams',
    component: AdminExamManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }