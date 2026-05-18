import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { BackendOrder } from './models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly orders = signal<BackendOrder[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadOrders(): Promise<void> {
    const token = this.auth.token;
    if (!token) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const orders = await firstValueFrom(this.api.fetchOrders(token));
      this.orders.set(orders);
    } catch (err) {
      this.error.set(this.messageFrom(err));
    } finally {
      this.loading.set(false);
    }
  }

  totalSpent(): number {
    return this.orders().reduce((sum, o) => sum + o.totalCents, 0) / 100;
  }

  private messageFrom(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { error?: string } }).error;
      if (body?.error) return body.error;
    }
    return 'Failed to load orders';
  }
}
