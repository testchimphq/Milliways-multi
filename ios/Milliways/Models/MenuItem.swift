//
//  MenuItem.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI

struct MenuSection: Decodable {
    let title: String
    let items: [MenuItem]
}

struct MenuItem: Identifiable, Decodable {
    let id: Int
    let name: String
    let description: String
    let price: Double
    let color: Color
    var imageName: String? = nil

    init(
        id: Int = 0,
        name: String,
        description: String,
        price: Double,
        color: Color,
        imageName: String? = nil
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.color = color
        self.imageName = imageName
    }

    private enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case priceCents
        case color
        case imageName
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        description = try container.decode(String.self, forKey: .description)
        price = Double(try container.decode(Int.self, forKey: .priceCents)) / 100
        color = Self.color(named: try container.decode(String.self, forKey: .color))
        imageName = try container.decodeIfPresent(String.self, forKey: .imageName)
    }

    private static func color(named name: String) -> Color {
        switch name.lowercased() {
        case "black": return .black
        case "blue": return .blue
        case "brown": return .brown
        case "cyan": return .cyan
        case "green": return .green
        case "orange": return .orange
        case "pink": return .pink
        case "purple": return .purple
        case "yellow": return .yellow
        default: return .gray
        }
    }

}
