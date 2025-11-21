import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Student Management System';
  currentUser: User | null = null;
  sidenavOpen = true; // Default state for desktop view

  constructor(
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Set initial sidenav state based on screen size
    this.sidenavOpen = window.innerWidth >= 768;

    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.sidenavOpen = window.innerWidth >= 768;
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
  }

  // Handle sidenav toggle events from navigation component
  onSidenavToggle(isOpen: boolean): void {
    this.sidenavOpen = isOpen;
  }
}
