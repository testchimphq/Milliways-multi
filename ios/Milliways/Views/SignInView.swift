import SwiftUI

struct SignInView: View {
    @ObservedObject var sessionManager: SessionManager
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                Spacer()

                VStack(spacing: 8) {
                    Text("Welcome to Milliways")
                        .font(.system(size: 30, weight: .bold))
                    Text("Sign in to order from the restaurant at the end of the universe.")
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
                        .accessibilityLabel("Email")

                    SecureField("Password", text: $password)
                        .textFieldStyle(.roundedBorder)
                        .accessibilityLabel("Password")
                }

                if let error = sessionManager.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }

                Button {
                    Task {
                        await sessionManager.signIn(email: email, password: password)
                    }
                } label: {
                    if sessionManager.isLoading {
                        ProgressView()
                            .tint(.white)
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Sign In")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(sessionManager.isLoading || email.isEmpty || password.isEmpty)

                NavigationLink("Create an account") {
                    SignUpView(sessionManager: sessionManager)
                }

                Spacer()
            }
            .padding()
            .navigationBarHidden(true)
        }
        .navigationViewStyle(.stack)
    }
}
