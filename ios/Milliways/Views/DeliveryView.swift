//
//  DeliveryView.swift
//  Milliways
//

import SwiftUI
import Combine

struct DeliveryView: View {
    @State private var minutesRemaining: Double
    @State private var statusText = "Checking status..."
    @Environment(\.dismiss) var dismiss
    @ObservedObject var orderManager: OrderManager
    @ObservedObject var sessionManager: SessionManager
    var onClose: () -> Void

    let timer = Timer.publish(every: 1.0 / 30.0, on: .main, in: .common).autoconnect()

    init(orderManager: OrderManager, sessionManager: SessionManager, onClose: @escaping () -> Void) {
        _minutesRemaining = State(initialValue: Double.random(in: 2_000_000...3_000_000))
        self.orderManager = orderManager
        self.sessionManager = sessionManager
        self.onClose = onClose
    }

    var body: some View {
        ZStack {
            Image("NebulaMap")
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
                .ignoresSafeArea()

            VStack {
                Text("Your \(orderManager.items.first?.menuItem.name ?? "order") is on its way!")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .shadow(radius: 4)
                    .padding(.horizontal)
                    .padding(.top, 120)

                Text("Status: \(statusText.capitalized)")
                    .font(.subheadline)
                    .foregroundColor(.white)
                    .padding(8)
                    .background(Color.black.opacity(0.45))
                    .cornerRadius(8)

                Spacer()

                Text(String(format: "%.8f minutes for delivery", minutesRemaining))
                    .font(.system(size: 20, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.black.opacity(0.5))
                    .cornerRadius(12)
                    .padding(.bottom, 60)
            }
        }
        .onReceive(timer) { _ in
            if minutesRemaining > 0 {
                minutesRemaining -= Double.random(in: 0.01...0.05)
            }
        }
        .task {
            await refreshStatus()
        }
        .overlay(alignment: .topTrailing) {
            Button(action: {
                dismiss()
                onClose()
            }) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 28))
                    .foregroundColor(.white)
                    .shadow(radius: 2)
            }
            .accessibilityLabel("Close")
            .padding(.trailing, 20)
            .padding(.top, 50)
        }
    }

    @MainActor
    private func refreshStatus() async {
        guard let token = sessionManager.token else { return }

        do {
            try await orderManager.refreshSubmittedOrderStatus(token: token)
            statusText = orderManager.latestOrderStatus?.status ?? "received"
        } catch {
            statusText = "unavailable"
        }
    }
}
