import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.loading = false;

      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    if (!this.authService.currentUser$) {
      this.authService.getUserProfile().subscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
