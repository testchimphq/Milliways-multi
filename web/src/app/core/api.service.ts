import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthSession,
  BackendOrder,
  BackendOrderStatus,
  CreateOrderItem,
  menuItemFromDto,
  MenuSection,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl.replace(/\/$/, '');

  signUp(email: string, password: string): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.base}/auth/signup`, { email, password });
  }

  signIn(email: string, password: string): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.base}/auth/signin`, { email, password });
  }

  fetchMenu(): Observable<MenuSection[]> {
    return this.http
      .get<{ sections: { title: string; items: Parameters<typeof menuItemFromDto>[0][] }[] }>(
        `${this.base}/menu`,
      )
      .pipe(
        map((r) =>
          r.sections.map((s) => ({
            title: s.title,
            items: s.items.map(menuItemFromDto),
          })),
        ),
      );
  }

  createOrder(items: CreateOrderItem[], token: string): Observable<BackendOrder> {
    return this.http
      .post<{ order: BackendOrder }>(`${this.base}/orders`, { items }, this.authHeaders(token))
      .pipe(map((r) => r.order));
  }

  fetchOrders(token: string): Observable<BackendOrder[]> {
    return this.http
      .get<{ orders: BackendOrder[] }>(`${this.base}/orders`, this.authHeaders(token))
      .pipe(map((r) => r.orders));
  }

  fetchOrderStatus(orderId: number, token: string): Observable<BackendOrderStatus> {
    return this.http
      .get<{ order: BackendOrderStatus }>(`${this.base}/orders/${orderId}/status`, this.authHeaders(token))
      .pipe(map((r) => r.order));
  }

  private authHeaders(token: string) {
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
  }
}
