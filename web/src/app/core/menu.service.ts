import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { MenuSection } from './models';
import { CartService } from './cart.service';
import { MilliwaysRumService } from '../rum/milliways-rum.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly rum = inject(MilliwaysRumService);

  readonly sections = signal<MenuSection[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadMenu(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const sections = await firstValueFrom(this.api.fetchMenu());
      this.sections.set(sections);
      this.rum.emit('menu_loaded', {
        'menu.section_count_bucket': this.rum.menuSectionCountBucket(sections.length),
        'cart.line_item_count_bucket': this.rum.lineItemCountBucket(this.cart.lines().length),
      });
    } catch (err) {
      this.error.set(this.messageFrom(err));
    } finally {
      this.loading.set(false);
    }
  }

  private messageFrom(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { error?: string } }).error;
      if (body?.error) return body.error;
    }
    return 'Failed to load menu';
  }
}
