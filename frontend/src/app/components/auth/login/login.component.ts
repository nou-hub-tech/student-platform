import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true; // Added for password visibility toggle

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  testBackend(): void {
    this.authService.testBackend().subscribe({
      next: (response) => {
        console.log('Backend test response:', response);
        this.snackBar.open('Backend is accessible!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Backend test failed:', error);
        this.snackBar.open('Backend test failed: ' + error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  testPost(): void {
    this.authService.testPost().subscribe({
      next: (response) => {
        console.log('POST test response:', response);
        this.snackBar.open('POST request successful!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('POST test failed:', error);
        this.snackBar.open('POST test failed: ' + error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  testDatabase(): void {
    this.authService.testDatabase().subscribe({
      next: (response) => {
        console.log('Database test response:', response);
        this.snackBar.open('Database is accessible!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Database test failed:', error);
        this.snackBar.open('Database test failed: ' + error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.value;

    // Fix: Pass a single LoginRequest object instead of separate parameters
    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.snackBar.open(
          error.error?.message || 'Login failed. Please check your credentials.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
        this.loading = false;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      if (user.role === 'ROLE_ADMIN') {
        this.router.navigate(['/dashboard']);
      } else if (user.role === 'ROLE_STUDENT') {
        this.router.navigate(['/my-grades']);
      } else {
        this.router.navigate(['/my-grades']); // Default for students
      }
    }
  }
}
