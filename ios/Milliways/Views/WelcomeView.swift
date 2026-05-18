//
//  WelcomeView.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI

struct WelcomeView: View {
    @ObservedObject var orderManager: OrderManager
    @ObservedObject var sessionManager: SessionManager
    @State private var floatOffset: CGFloat = 0
    @State private var isMenuActive = false
    @State private var showAccount = false

    var body: some View {
        NavigationView {
            ZStack {
                // Background image
                Image("HeroBackground")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .ignoresSafeArea()

                VStack {
                    Text("Welcome to Milliways")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.top, 20)

                    // Floating foreground image
                    Image("HeroForeground")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .padding(.horizontal, 40)
                        .offset(y: floatOffset - 40)
                        .onAppear {
                            withAnimation(
                                .easeInOut(duration: 2.0)
                                .repeatForever(autoreverses: true)
                            ) {
                                floatOffset = 20
                            }
                        }

                    Spacer()

                    NavigationLink(
                        destination: MenuView(
                            orderManager: orderManager,
                            sessionManager: sessionManager,
                            popToRoot: $isMenuActive
                        )
                            .navigationBarBackButtonHidden(true)
                            .toolbar {
                                ToolbarItem(placement: .navigationBarLeading) {
                                    EmptyView()
                                }
                            },
                        isActive: $isMenuActive
                    ) {
                        Text("New Order")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.orange)
                            .clipShape(Capsule())
                            .accessibilityLabel("New Order")
                    }
                    .padding(.horizontal, 60)
                    .padding(.bottom)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showAccount = true
                    }) {
                        Image(systemName: "person.circle")
                            .font(.system(size: 22))
                            .foregroundColor(.white)
                    }
                    .accessibilityLabel("Account")
                }
            }
        }
        .navigationViewStyle(.stack)
        .sheet(isPresented: $showAccount) {
            AccountView(sessionManager: sessionManager)
        }
    }
}
