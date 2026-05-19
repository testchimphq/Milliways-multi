import '@testchimp/playwright/runtime';
import { test, expect } from '../../fixtures/index.js';
import { MAIN_DISHES } from '../../../shared/menu-catalog.js';
import { signInToWelcome } from '../../../shared/mobile-auth-android.js';

test('main dishes are listed on the menu', async ({ screen, seedUser, markScreenState }) => {
  // @Scenario: #TS-105 Main dishes are listed on the menu

  await signInToWelcome(screen, seedUser);
  await markScreenState('Welcome', 'signed-in');

  await screen.getByLabel('New Order').tap();
  await markScreenState('Menu', 'main-dishes');

  for (const dish of MAIN_DISHES) {
    await expect(screen.getByText(dish)).toBeVisible();
  }
});
