import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AccountComponent } from '../account/account.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [AccountComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent implements OnInit {
  private readonly router = inject(Router);
  readonly showAccount = signal(false);
  readonly floatOffset = signal(0);

  ngOnInit(): void {
    this.animateFloat();
  }

  openAccount(): void {
    this.showAccount.set(true);
  }

  closeAccount(): void {
    this.showAccount.set(false);
  }

  newOrder(): void {
    this.router.navigate(['/menu']);
  }

  private animateFloat(): void {
    let up = true;
    setInterval(() => {
      this.floatOffset.set(up ? 20 : 0);
      up = !up;
    }, 2000);
  }
}
