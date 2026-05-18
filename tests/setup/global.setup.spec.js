import { test } from '@playwright/test';

/**
 * Global setup (runs before test projects via project dependencies in your config:
 * `playwright.config.js` for web, `mobilewright.config.ts` for Android/iOS).
 *
 * Use this file to:
 * - Seed test data in your database or APIs
 * - Prepare shared authentication (e.g. save storageState for reuse)
 * - Any one-time harness work needed by your e2e tests
 *
 * Teardown: use a separate teardown project in the same config if you need cleanup after all tests.
 */
test('global setup', async () => {
  // Intentionally empty — replace with your setup steps.
});
