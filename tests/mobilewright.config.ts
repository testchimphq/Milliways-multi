import { defineConfig, type MobilewrightConfig } from 'mobilewright';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const testsRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testsRoot, '..');
// mobilewright >= 0.0.37: iOS simulator installApps expects a .zip of the .app bundle.
const defaultIosApp =
  process.env.IOS_APP_PATH ??
  join(repoRoot, 'ios/build/Build/Products/Debug-iphonesimulator/Milliways.zip');
const defaultApk =
  process.env.ANDROID_APK_PATH ??
  join(repoRoot, 'android/app/build/outputs/apk/debug/app-debug.apk');

/**
 * Mobile scaffold: setup + api + ios + android projects (mobilewright >= 0.0.37).
 * Per-project `use.installApps` / `use.platform` — required for multi-platform matrix (see mobile-next/playground).
 * Platform for @testchimp/playwright: projects[].use.platform (ios | android).
 * UI specs: mobile/fixtures/index.js → installTestChimp(..., { uiFixture: 'screen' }).
 * API specs: api/fixtures/index.js (@playwright/test).
 */
dotenv.config({
  path: `.env-${process.env.TESTCHIMP_ENV || 'QA'}`,
});

const useMobileUse = Boolean(process.env['MOBILE_USE_API_KEY']);

const config: MobilewrightConfig = {
  testDir: '.',
  retries: 0,
  timeout: 120_000,
  bundleId: 'com.mobilenext.Milliways',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'mobilewright-report' }],
    [
      '@testchimp/playwright/reporter',
      {
        // Ingest auth + URL: TESTCHIMP_API_KEY and TESTCHIMP_BACKEND_URL on the runner env only.
        // testsFolder: relative to this config dir (SmartTests root); platform resolves via API key.
        testsFolder: process.env.TESTCHIMP_TESTS_FOLDER || '.',
        verbose: process.env.TESTCHIMP_REPORTER_VERBOSE === 'true',
        reportOnlyFinalAttempt: true,
        captureScreenshots: true,
      },
    ],
  ],
  projects: [
    {
      name: 'api',
      testDir: 'api',
      testMatch: '**/*.spec.{js,ts}',
      testIgnore: ['**/fixtures/**'],
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
        installApps: defaultIosApp,
        actionTimeout: 30 * 1000,
      },
    },
    // @testchimp-scaffold:/ios-project
    // @testchimp-scaffold:android-project
    {
      name: 'android',
      testDir: 'mobile',
      testMatch: ['e2e/common/**/*.spec.{js,ts}', 'e2e/android/**/*.spec.{js,ts}'],
      testIgnore: ['**/fixtures/**', '**/pages/**', '**/shared/**', 'web/**'],
      use: {
        platform: 'android',
        bundleId: 'com.mobilenext.milliways',
        installApps: defaultApk,
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
