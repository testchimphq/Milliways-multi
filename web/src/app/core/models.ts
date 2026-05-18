export interface DemoUser {
  id: number;
  email: string;
}

export interface AuthSession {
  user: DemoUser;
  token: string;
}

export interface MenuItemDto {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  color?: string;
  imageName?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  color?: string;
  imageName?: string;
}

export function menuItemFromDto(dto: MenuItemDto): MenuItem {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    price: dto.priceCents / 100,
    color: dto.color,
    imageName: dto.imageName,
  };
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface CartLine {
  id: string;
  menuItem: MenuItem;
  quantity: number;
}

export interface CreateOrderItem {
  menuItemId: number;
  quantity: number;
}

export interface BackendOrder {
  id: number;
  status: string;
  totalCents: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BackendOrderStatus {
  id: number;
  status: string;
  updatedAt: string;
}
