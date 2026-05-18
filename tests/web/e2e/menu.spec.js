import '@testchimp/playwright/runtime';
import { test, expect } from '../fixtures/index.js';
import { MAIN_DISHES, SHIPPING_DISCLAIMER } from '../../shared/menu-catalog.js';
import { openMenuFromWelcome, signInToWelcome } from '../../shared/web-auth.js';

test('main dishes are listed on the menu', async ({ page, seedUser, markScreenState }) => {
  // @Scenario: #TS-105 Main dishes are listed on the menu

  await signInToWelcome(page, seedUser);
  await markScreenState('Welcome', 'signed-in');
  await openMenuFromWelcome(page);
  await markScreenState('Menu', 'main-dishes');

  for (const dish of MAIN_DISHES) {
    await expect(page.getByText(dish, { exact: true })).toBeVisible();
  }
});

test('shipping disclaimer visible at bottom of menu', async ({ page, seedUser, markScreenState }) => {
  // @Scenario: #TS-106 Shipping disclaimer visible at bottom of menu

  await signInToWelcome(page, seedUser);
  await openMenuFromWelcome(page);
  await markScreenState('Menu', 'disclaimer');

  await expect(page.getByText(SHIPPING_DISCLAIMER)).toBeVisible();
});
