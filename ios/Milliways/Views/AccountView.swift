//
//  AccountView.swift
//  Milliways
//

import SwiftUI

struct AccountView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var sessionManager: SessionManager
    @State private var orders: [BackendOrder] = []
    @State private var isLoadingOrders = false
    @State private var ordersError: String?

    var totalSpent: Double {
        Double(orders.reduce(0) { $0 + $1.totalCents }) / 100
    }

    var body: some View {
        NavigationView {
            List {
                // Profile header
                Section {
                    HStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(sessionManager.user?.email ?? "Signed in")
                                .font(.system(size: 26, weight: .bold))
                            Text("Pro Cosmic Foodie")
                                .font(.subheadline)
                                .foregroundColor(.orange)
                        }

                        Spacer()

                        Image("Avatar")
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 70, height: 70)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.orange, lineWidth: 2))
                    }
                    .padding(.vertical, 8)
                }

                // Stats
                Section {
                    HStack {
                        VStack {
                            Text("\(orders.count)")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Orders")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)

                        Divider()

                        VStack {
                            Text("₭\(totalSpent, specifier: "%.2f")")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Total Spent")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)

                        Divider()

                        VStack {
                            Text("19")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Light-years")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding(.vertical, 8)
                }

                Section(header: Text("Past Orders")) {
                    if isLoadingOrders {
                        ProgressView("Loading orders...")
                    } else if let ordersError {
                        Text(ordersError)
                            .foregroundColor(.red)
                    } else if orders.isEmpty {
                        Text("No orders yet")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(orders) { order in
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Order #\(order.id)")
                                        .font(.headline)
                                    Text(order.status.capitalized)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }

                                Spacer()

                                Text("₭\(Double(order.totalCents) / 100, specifier: "%.2f")")
                                    .font(.headline)
                                    .foregroundColor(.orange)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }

                Section {
                    Button("Sign Out", role: .destructive) {
                        sessionManager.signOut()
                        dismiss()
                    }
                }
            }
            .navigationTitle("My Account")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .task {
                await loadOrders()
            }
        }
    }

    @MainActor
    private func loadOrders() async {
        guard let token = sessionManager.token else { return }
        isLoadingOrders = true
        ordersError = nil

        do {
            orders = try await APIClient.shared.fetchOrders(token: token)
        } catch {
            ordersError = error.localizedDescription
        }

        isLoadingOrders = false
    }
}
