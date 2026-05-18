//
//  MenuView.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI

struct MenuView: View {
    @ObservedObject var orderManager: OrderManager
    @ObservedObject var sessionManager: SessionManager
    @Binding var popToRoot: Bool
    @State private var selectedItem: MenuItem?
    @State private var menuSections: [MenuSection] = []
    @State private var isLoadingMenu = false
    @State private var menuError: String?

    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            VStack(spacing: 0) {
                if isLoadingMenu {
                    ProgressView("Loading menu...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let menuError {
                    VStack(spacing: 12) {
                        Text(menuError)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                        Button("Try Again") {
                            Task {
                                await loadMenu()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12, pinnedViews: [.sectionHeaders]) {
                            ForEach(menuSections, id: \.title) { section in
                                Section {
                                    ForEach(section.items) { item in
                                        MenuItemCard(item: item)
                                            .onTapGesture {
                                                selectedItem = item
                                            }
                                            .padding(.horizontal)
                                    }
                                } header: {
                                    HStack {
                                        Text(section.title)
                                            .font(.headline)
                                            .foregroundColor(.secondary)
                                            .padding(.horizontal)
                                            .padding(.vertical, 8)
                                        Spacer()
                                    }
                                    .background(Color(.systemBackground))
                                }
                            }

                            Text("* Shipping beyond 5 light-years distance might cost extra")
                                .font(.footnote)
                                .foregroundColor(.secondary)
                                .italic()
                                .padding(.horizontal)
                                .padding(.top, 20)
                                .padding(.bottom, 40)
                        }
                        .padding(.vertical)
                    }
                }

                if orderManager.items.count > 0 {
                    NavigationLink(destination: OrderView(
                        orderManager: orderManager,
                        sessionManager: sessionManager,
                        popToRoot: $popToRoot
                    )) {
                        HStack {
                            Text("View Order")
                                .font(.headline)
                            Spacer()
                            Text("\(orderManager.totalQuantity) items")
                                .font(.subheadline)
                            Text("₭\(orderManager.totalPrice, specifier: "%.2f")")
                                .font(.headline)
                        }
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.orange)
                        .cornerRadius(12)
                        .padding()
                    }
                }
            }

        }
        .navigationTitle("Milliways")
        .navigationBarBackButtonHidden(true)
        .toolbarBackground(.hidden, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.accentColor)
                }
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                NavigationLink(destination: OrderView(
                    orderManager: orderManager,
                    sessionManager: sessionManager,
                    popToRoot: $popToRoot
                )) {
                    VStack(spacing: 0) {
                        if orderManager.totalQuantity > 0 {
                            Text("\(orderManager.totalQuantity)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 16, height: 16)
                                .background(Color.red)
                                .clipShape(Circle())
                        }
                        Image(systemName: "cart")
                            .foregroundColor(.accentColor)
                            .accessibilityLabel("Shopping Cart")
                    }
                }
            }
        }
        .sheet(item: $selectedItem) { item in
            MenuItemDetailView(item: item, orderManager: orderManager)
        }
        .task {
            if menuSections.isEmpty {
                await loadMenu()
            }
        }
    }

    @MainActor
    private func loadMenu() async {
        isLoadingMenu = true
        menuError = nil

        do {
            menuSections = try await APIClient.shared.fetchMenu()
            MilliwaysRum.emit(
                "menu_loaded",
                metadata: [
                    "menu.section_count_bucket": MilliwaysRum.menuSectionCountBucket(menuSections.count),
                    "cart.line_item_count_bucket": MilliwaysRum.lineItemCountBucket(orderManager.items.count),
                ]
            )
        } catch {
            menuError = error.localizedDescription
        }

        isLoadingMenu = false
    }
}
