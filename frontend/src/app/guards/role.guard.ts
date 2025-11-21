import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.authService.getCurrentUserValue();
    if (user && requiredRoles.includes(user.role)) {
      return true;
    } else {
      // Redirect based on user role
      if (user?.role === 'ROLE_STUDENT') {
        this.router.navigate(['/my-grades']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return false;
    }
  }
} 