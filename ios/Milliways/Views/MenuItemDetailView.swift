//
//  MenuItemDetailView.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI

struct MenuItemDetailView: View {
    let item: MenuItem
    @ObservedObject var orderManager: OrderManager
    @Environment(\.dismiss) var dismiss
    @State private var quantity = 1

    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                ZStack(alignment: .topTrailing) {
                    if let imageName = item.imageName {
                        Image(imageName)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(height: geometry.size.height * 0.5)
                    } else {
                        RoundedRectangle(cornerRadius: 0)
                            .fill(item.color)
                            .frame(height: geometry.size.height * 0.5)
                    }

                    Button(action: {
                        dismiss()
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.white)
                            .shadow(radius: 2)
                            .padding()
                    }
                }

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        Text(item.name)
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("₭\(item.price, specifier: "%.2f")")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.orange)

                        Text(item.description)
                            .font(.body)
                            .foregroundColor(.secondary)

                        Spacer(minLength: 100)
                    }
                    .padding()
                }

                VStack {
                    HStack(spacing: 12) {
                        // Quantity counter
                        HStack(spacing: 0) {
                            Button(action: {
                                if quantity > 1 { quantity -= 1 }
                            }) {
                                Text("−")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .frame(width: 44, height: 44)
                                    .foregroundColor(quantity > 1 ? .primary : .gray)
                            }

                            Text("\(quantity)")
                                .font(.headline)
                                .frame(width: 36)

                            Button(action: {
                                quantity += 1
                            }) {
                                Text("+")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .frame(width: 44, height: 44)
                            }
                        }
                        .background(Color(.systemGray6))
                        .cornerRadius(10)

                        // Add to Order button
                        Button(action: {
                            orderManager.addItem(item, quantity: quantity)
                            dismiss()
                        }) {
                            Text("Add to Order")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.orange)
                                .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom)
                }
                .background(Color(.systemBackground))
            }
            .ignoresSafeArea(edges: .top)
        }
    }
}
