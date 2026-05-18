//
//  OrderManager.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI
import Combine

struct OrderItem: Identifiable {
    let id = UUID()
    let menuItem: MenuItem
    var quantity: Int

    var totalPrice: Double {
        Double(quantity) * menuItem.price
    }
}

class OrderManager: ObservableObject {
    @Published var items: [OrderItem] = []
    @Published var couponDiscount: Double = 0
    @Published var appliedCouponCode: String? = nil
    @Published var submittedOrder: BackendOrder?
    @Published var latestOrderStatus: BackendOrderStatus?

    var totalPrice: Double {
        items.reduce(0) { $0 + $1.totalPrice }
    }

    // Coupon discount is frozen when applied — does not update if cart changes
    var finalTotal: Double {
        totalPrice - couponDiscount
    }

    var totalQuantity: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    func addItem(_ item: MenuItem, quantity: Int) {
        items.append(OrderItem(menuItem: item, quantity: quantity))
    }

    func removeItem(at index: Int) {
        items.remove(at: index)
    }

    @discardableResult
    func applyCoupon(_ code: String) -> Bool {
        guard code.uppercased() == "MARVIN" else { return false }
        couponDiscount = 20.0
        appliedCouponCode = "MARVIN"
        return true
    }

    func clearOrder() {
        items.removeAll()
        couponDiscount = 0
        appliedCouponCode = nil
        submittedOrder = nil
        latestOrderStatus = nil
    }

    @MainActor
    func submitOrder(token: String) async throws -> BackendOrder {
        let requestItems = items.map {
            CreateOrderItem(menuItemId: $0.menuItem.id, quantity: $0.quantity)
        }
        let order = try await APIClient.shared.createOrder(items: requestItems, token: token)
        submittedOrder = order
        latestOrderStatus = BackendOrderStatus(id: order.id, status: order.status, updatedAt: order.createdAt)
        return order
    }

    @MainActor
    func refreshSubmittedOrderStatus(token: String) async throws {
        guard let orderId = submittedOrder?.id else { return }
        latestOrderStatus = try await APIClient.shared.fetchOrderStatus(orderId: orderId, token: token)
    }
}
