import '@testchimp/playwright/runtime';
import { test, expect } from '../../fixtures/index.js';
import { openAccountScreen, signInToWelcome } from '../../../shared/mobile-auth-android.js';

test('account profile shows seeded user email', async ({ screen, seedUser, markScreenState }) => {
  // @Scenario: #TS-109 Account profile shows user email and loyalty tier

  await signInToWelcome(screen, seedUser);
  await markScreenState('Welcome', 'signed-in');

  await openAccountScreen(screen);
  await markScreenState('Account', 'profile');

  await expect(screen.getByText('Pro Cosmic Foodie')).toBeVisible({ timeout: 15_000 });
  await expect(screen.getByText(seedUser.email)).toBeVisible();
});
