/**
 * Master Playwright test entry for SmartTests (TestChimp runtime: TrueCoverage CI metadata,
 * markScreenState fixture, ExploreChimp when enabled).
 *
 * Requires @testchimp/playwright >= 0.1.8 (installTestChimp).
 * Add domain fixtures with mergeTests, then wrap the merged test (use the same runner package as below:
 * `@playwright/test` for web, `@mobilewright/test` for Android/iOS):
 *   import { mergeTests } from '@playwright/test'; // or '@mobilewright/test'
 *   import { test as auth } from './auth.fixture.js';
 *   export const test = installTestChimp(mergeTests(auth));
 */
import { test as base } from '@playwright/test';
import { installTestChimp } from '@testchimp/playwright/runtime';
import { seedQaUser } from '../../shared/seed-user.js';

const testWithSeed = base.extend({
  seedUser: async ({}, use, testInfo) => {
    await use(await seedQaUser(testInfo));
  },
});

export const test = installTestChimp(testWithSeed);
export { expect } from '@playwright/test';
