import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, output } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { OrdersService } from '../../core/orders.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  readonly closed = output<void>();

  private readonly auth = inject(AuthService);
  private readonly ordersService = inject(OrdersService);

  readonly user = this.auth.user;
  readonly orders = this.ordersService.orders;
  readonly loading = this.ordersService.loading;
  readonly error = this.ordersService.error;

  ngOnInit(): void {
    void this.ordersService.loadOrders();
  }

  totalSpent(): number {
    return this.ordersService.totalSpent();
  }

  signOut(): void {
    this.auth.signOut();
    this.closed.emit();
  }

  dismiss(): void {
    this.closed.emit();
  }
}
