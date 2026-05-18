import SwiftUI

struct SignUpView: View {
    @ObservedObject var sessionManager: SessionManager
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text("Create Account")
                    .font(.system(size: 30, weight: .bold))
                Text("Use any email and password. This demo creates the account immediately.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: 12) {
                TextField("Email", text: $email)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)
                    .accessibilityLabel("Signup Email")

                SecureField("Password", text: $password)
                    .textFieldStyle(.roundedBorder)
                    .accessibilityLabel("Signup Password")
            }

            if let error = sessionManager.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }

            Button {
                Task {
                    await sessionManager.signUp(email: email, password: password)
                    if sessionManager.user != nil {
                        dismiss()
                    }
                }
            } label: {
                if sessionManager.isLoading {
                    ProgressView()
                        .tint(.white)
                        .frame(maxWidth: .infinity)
                } else {
                    Text("Sign Up")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(sessionManager.isLoading || email.isEmpty || password.isEmpty)

            Spacer()
        }
        .padding()
        .navigationTitle("Sign Up")
        .navigationBarTitleDisplayMode(.inline)
    }
}
