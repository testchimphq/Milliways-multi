import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss',
})
export class DeliveryComponent implements OnInit, OnDestroy {
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly minutesRemaining = signal(this.randomMinutes());
  readonly statusText = signal('Checking status...');

  private pollTimer?: ReturnType<typeof setInterval>;
  private countdownTimer?: ReturnType<typeof setInterval>;

  headlineItem = 'order';

  ngOnInit(): void {
    const first = this.cart.lines()[0]?.menuItem.name;
    if (first) {
      this.headlineItem = first;
    }
    void this.cart.refreshSubmittedOrderStatus();
    this.pollTimer = setInterval(() => void this.cart.refreshSubmittedOrderStatus(), 3000);
    this.countdownTimer = setInterval(() => {
      const status = this.cart.latestOrderStatus();
      if (status) {
        this.statusText.set(status.status);
      }
      this.minutesRemaining.update((m) => Math.max(0, m - Math.random() * 0.001));
    }, 1000 / 30);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollTimer);
    clearInterval(this.countdownTimer);
  }

  close(): void {
    this.cart.clearOrder();
    void this.router.navigate(['/welcome']);
  }

  private randomMinutes(): number {
    return 2_000_000 + Math.random() * 1_000_000;
  }
}
