//
//  MilliwaysAppDelegate.swift
//  Milliways
//
//  Forwards Mobilewright `device.openUrl` TrueCoverage URLs into TestChimpRum. SwiftUI `.onOpenURL`
//  alone can miss URLs delivered via UIApplication when the app is already foreground.
//

import TestChimpRum
import UIKit

enum MilliwaysTrueCoverageOpenURL {
    @discardableResult
    static func handle(_ url: URL) -> Bool {
        TestChimpRum.handleAutomationURL(url)
    }
}

final class MilliwaysAppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        MilliwaysTrueCoverageOpenURL.handle(url)
    }
}
