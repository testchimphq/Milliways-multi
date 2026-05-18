import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenuService } from '../../core/menu.service';
import { CartService } from '../../core/cart.service';
import { MenuItem } from '../../core/models';
import { MenuItemDialogComponent } from './menu-item-dialog.component';

const COLOR_MAP: Record<string, string> = {
  brown: '#8B4513',
  green: '#2E7D32',
  orange: '#FF8C00',
  pink: '#E91E63',
  cyan: '#00BCD4',
  yellow: '#FBC02D',
  blue: '#1976D2',
  purple: '#7B1FA2',
};

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MenuItemDialogComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly sections = this.menuService.sections;
  readonly loading = this.menuService.loading;
  readonly error = this.menuService.error;
  readonly cartLines = this.cart.lines;
  readonly totalPrice = this.cart.totalPrice;
  readonly totalQuantity = this.cart.totalQuantity;

  readonly selectedItem = signal<MenuItem | null>(null);

  ngOnInit(): void {
    void this.menuService.loadMenu();
  }

  openItem(item: MenuItem): void {
    this.selectedItem.set(item);
  }

  closeDialog(): void {
    this.selectedItem.set(null);
  }

  itemColor(item: MenuItem): string {
    return COLOR_MAP[item.color ?? ''] ?? '#607D8B';
  }

  viewOrder(): void {
    this.router.navigate(['/order']);
  }

  reload(): void {
    void this.menuService.loadMenu();
  }
}
