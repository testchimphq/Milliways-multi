import '@testchimp/playwright/runtime';
import { test, expect } from '../../fixtures/index.js';
import { signInToWelcome } from '../../../shared/mobile-auth.js';

test('account profile shows seeded user email', async ({ screen, seedUser, markScreenState }) => {
  // @Scenario: #TS-109 Account profile shows user email and loyalty tier

  await signInToWelcome(screen, seedUser);
  await markScreenState('Welcome', 'signed-in');

  await screen.getByLabel('Account').tap();
  await markScreenState('Account', 'profile');

  await expect(screen.getByText(seedUser.email)).toBeVisible();
});
