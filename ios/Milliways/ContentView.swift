//
//  ContentView.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var orderManager = OrderManager()
    @StateObject private var sessionManager = SessionManager()

    var body: some View {
        if sessionManager.user == nil {
            SignInView(sessionManager: sessionManager)
        } else {
            WelcomeView(orderManager: orderManager, sessionManager: sessionManager)
        }
    }
}

#Preview {
    ContentView()
}
