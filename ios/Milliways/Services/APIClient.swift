import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case missingSession
    case server(String)
    case emptyResponse

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid API URL"
        case .missingSession:
            return "Please sign in first"
        case .server(let message):
            return message
        case .emptyResponse:
            return "The server returned an empty response"
        }
    }
}

struct DemoUser: Codable, Identifiable {
    let id: Int
    let email: String
}

struct AuthSession: Codable {
    let user: DemoUser
    let token: String
}

struct MenuResponse: Decodable {
    let sections: [MenuSection]
}

struct CreateOrderRequest: Codable {
    let items: [CreateOrderItem]
}

struct CreateOrderItem: Codable {
    let menuItemId: Int
    let quantity: Int
}

struct OrderResponse: Codable {
    let order: BackendOrder
}

struct OrdersResponse: Codable {
    let orders: [BackendOrder]
}

struct OrderStatusResponse: Codable {
    let order: BackendOrderStatus
}

struct BackendOrder: Codable, Identifiable {
    let id: Int
    let status: String
    let totalCents: Int
    let createdAt: String
    let updatedAt: String?
}

struct BackendOrderStatus: Codable, Identifiable {
    let id: Int
    let status: String
    let updatedAt: String
}

struct APIClient {
    static let shared = APIClient()

    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(
        baseURL: URL = URL(string: "http://localhost:3001")!,
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()
    }

    func signUp(email: String, password: String) async throws -> AuthSession {
        try await send(
            "/auth/signup",
            method: "POST",
            body: ["email": email, "password": password],
            responseType: AuthSession.self
        )
    }

    func signIn(email: String, password: String) async throws -> AuthSession {
        try await send(
            "/auth/signin",
            method: "POST",
            body: ["email": email, "password": password],
            responseType: AuthSession.self
        )
    }

    func fetchMenu() async throws -> [MenuSection] {
        let response = try await send("/menu", responseType: MenuResponse.self)
        return response.sections
    }

    func createOrder(items: [CreateOrderItem], token: String) async throws -> BackendOrder {
        let response = try await send(
            "/orders",
            method: "POST",
            token: token,
            body: CreateOrderRequest(items: items),
            responseType: OrderResponse.self
        )

        return response.order
    }

    func fetchOrders(token: String) async throws -> [BackendOrder] {
        let response = try await send("/orders", token: token, responseType: OrdersResponse.self)
        return response.orders
    }

    func fetchOrderStatus(orderId: Int, token: String) async throws -> BackendOrderStatus {
        let response = try await send(
            "/orders/\(orderId)/status",
            token: token,
            responseType: OrderStatusResponse.self
        )

        return response.order
    }

    private func send<Response: Decodable, Body: Encodable>(
        _ path: String,
        method: String = "GET",
        token: String? = nil,
        body: Body? = nil,
        responseType: Response.Type
    ) async throws -> Response {
        guard let url = URL(string: path, relativeTo: baseURL) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try encoder.encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.emptyResponse
        }

        if !(200..<300).contains(httpResponse.statusCode) {
            let error = try? decoder.decode(ServerError.self, from: data)
            throw APIError.server(error?.error ?? "Request failed with status \(httpResponse.statusCode)")
        }

        if data.isEmpty {
            throw APIError.emptyResponse
        }

        return try decoder.decode(Response.self, from: data)
    }

    private func send<Response: Decodable>(
        _ path: String,
        method: String = "GET",
        token: String? = nil,
        responseType: Response.Type
    ) async throws -> Response {
        let emptyBody: EmptyBody? = nil
        return try await send(path, method: method, token: token, body: emptyBody, responseType: responseType)
    }
}

private struct ServerError: Codable {
    let error: String
}

private struct EmptyBody: Encodable {}
