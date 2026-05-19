import { defineConfig, type MobilewrightConfig } from 'mobilewright';
import dotenv from 'dotenv';

/**
 * Multi-platform scaffold (native): same project matrix as template_mobile_mobilewright.config.ts
 * with testIgnore including web/. Requires mobilewright >= 0.0.37 (per-project installApps).
 */
dotenv.config({
  path: `.env-${process.env.TESTCHIMP_ENV || 'QA'}`,
});

const useMobileUse = Boolean(process.env['MOBILE_USE_API_KEY']);

const config: MobilewrightConfig = {
  testDir: '.',
  retries: 0,
  timeout: 120_000,
  bundleId: 'com.mobilenext.milliways',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'mobilewright-report' }],
    ['@testchimp/playwright/reporter', { verbose: false }],
  ],
  projects: [
    {
      name: 'api',
      testDir: 'api',
      testMatch: '**/*.spec.{js,ts}',
      testIgnore: ['**/fixtures/**', 'web/**'],
    },
    // @testchimp-scaffold:ios-project
    {
      name: 'ios',
      testDir: 'mobile',
      testMatch: ['e2e/common/**/*.spec.{js,ts}', 'e2e/ios/**/*.spec.{js,ts}'],
      testIgnore: ['**/fixtures/**', '**/pages/**', '**/shared/**', 'web/**'],
      use: {
        platform: 'ios',
        bundleId: 'com.mobilenext.Milliways',
        installApps: process.env.IOS_APP_PATH ?? '[PATH_TO_IOS_APP]',
        actionTimeout: 15 * 1000,
      },
    },
    // @testchimp-scaffold:/ios-project
    // @testchimp-scaffold:android-project
    {
      name: 'android',
      testDir: 'mobile',
      testMatch: ['e2e/android/**/*.spec.{js,ts}'],
      testIgnore: ['**/fixtures/**', '**/pages/**', '**/shared/**', 'web/**'],
      use: {
        platform: 'android',
        bundleId: 'com.mobilenext.milliways',
        installApps: process.env.ANDROID_APK_PATH ?? '[PATH_TO_APK]',
        actionTimeout: 15 * 1000,
      },
    },
    // @testchimp-scaffold:/android-project
  ],
};

if (useMobileUse) {
  config.driver = {
    type: 'mobile-use',
    apiKey: process.env['MOBILE_USE_API_KEY'],
  };
}

export default defineConfig(config);
