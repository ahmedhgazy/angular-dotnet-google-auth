import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="login-container">
  <div class="login-card">
    <h1>Welcome</h1>
    <p>Sign in to your account</p>

      <div class="login-buttons">
        <div id="google-signin-button"></div>
      </div>
  </div>
</div>


  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        this.router.navigate(['/profile']);
      }
    });

    this.loadGoogleSignIn();
  }

  private loadGoogleSignIn(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      this.initializeGoogleSignIn();
    };
    document.head.appendChild(script);
  }

  private initializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: 'your-client-id',
      callback: (response: any) => {
        this.ngZone.run(() => {
          this.handleGoogleSignIn(response);
        });
      }
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        text: 'sign_in_with',
        shape: 'rectangular',
        width: '400'
      }
    );
  }

  private handleGoogleSignIn(response: any): void {
    this.authService.googleLogin(response.credential).subscribe({
      next: (result: any) => {
        this.authService.handleAuthentication(result.token);
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}
