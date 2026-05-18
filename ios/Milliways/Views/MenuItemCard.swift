//
//  MenuItemCard.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI

struct MenuItemCard: View {
    let item: MenuItem

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(item.name)
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text(item.description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)

                    Text("₭\(item.price, specifier: "%.2f")")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }

                Spacer()

                if let imageName = item.imageName {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                } else {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(item.color)
                        .frame(width: 60, height: 60)
                }
            }
            .padding(.vertical, 12)

            Divider()
                .background(Color.gray.opacity(0.3))
        }
    }
}
