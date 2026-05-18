import '@testchimp/playwright/runtime';
import { test, expect } from '../fixtures/index.js';
import { signInToWelcome } from '../../shared/web-auth.js';

test('account profile shows user email and loyalty tier', async ({ page, seedUser, markScreenState }) => {
  // @Scenario: #TS-109 Account profile shows user email and loyalty tier

  await signInToWelcome(page, seedUser);
  await markScreenState('Welcome', 'signed-in');

  await page.getByRole('button', { name: 'Account' }).click();
  await markScreenState('Account', 'profile');

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(seedUser.email)).toBeVisible();
  await expect(page.getByText('Pro Cosmic Foodie')).toBeVisible();
});
