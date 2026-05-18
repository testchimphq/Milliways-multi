import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignUpComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  readonly loading = this.auth.authLoading;
  readonly error = this.auth.authError;

  async submit(): Promise<void> {
    const ok = await this.auth.signUp(this.email.trim(), this.password);
    if (ok) {
      await this.router.navigate(['/welcome']);
    }
  }
}
