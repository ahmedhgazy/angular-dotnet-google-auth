import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.css'
})
export class CallbackComponent implements OnInit {
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        console.error('Authentication error:', error);
        this.error = true;
        this.loading = false;
        return;
      }

      if (token) {
        console.log('Token received, processing authentication');
        this.authService.handleAuthentication(token);
        this.loading = false;
        this.router.navigate(['/profile']);
      } else {
        console.warn('No token found in callback URL');
        this.error = true;
        this.loading = false;
      }
    });
  }
}
