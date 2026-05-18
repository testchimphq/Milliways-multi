//
//  MilliwaysApp.swift
//  Milliways
//
//  Created by gilm on 05/11/2025.
//

import SwiftUI
import TestChimpRum
import UIKit

@main
struct MilliwaysApp: App {
    @UIApplicationDelegateAdaptor(MilliwaysAppDelegate.self) private var appDelegate

    init() {
        MilliwaysRum.configureIfNeeded()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    _ = MilliwaysTrueCoverageOpenURL.handle(url)
                }
                // RUM batches events; flush before suspend/relaunch so SmartTest runs still upload telemetry.
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.willResignActiveNotification)) { _ in
                    TestChimpRum.flush()
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)) { _ in
                    TestChimpRum.flush()
                }
        }
    }
}
