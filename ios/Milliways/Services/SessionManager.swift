import Combine
import SwiftUI

@MainActor
final class SessionManager: ObservableObject {
    @Published private(set) var session: AuthSession?
    @Published var isLoading = false
    @Published var errorMessage: String?

    var user: DemoUser? {
        session?.user
    }

    var token: String? {
        session?.token
    }

    func signUp(email: String, password: String) async {
        await authenticate(kind: .signUp) {
            try await APIClient.shared.signUp(email: email, password: password)
        }
    }

    func signIn(email: String, password: String) async {
        await authenticate(kind: .signIn) {
            try await APIClient.shared.signIn(email: email, password: password)
        }
    }

    func signOut() {
        session = nil
        errorMessage = nil
    }

    private enum AuthKind: String {
        case signIn = "sign_in"
        case signUp = "sign_up"
    }

    private func authenticate(kind: AuthKind, _ request: () async throws -> AuthSession) async {
        isLoading = true
        errorMessage = nil

        do {
            session = try await request()
            if session != nil {
                MilliwaysRum.emit(
                    "auth_session_started",
                    metadata: ["entry.auth_kind": kind.rawValue]
                )
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
