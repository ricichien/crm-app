import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  username = '';
  password = '';
  error = '';

  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.error = '';
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => (this.error = 'Usuário ou senha inválidos'),
    });
  }
}
