import '@testchimp/playwright/runtime';
import { test, expect } from '../../fixtures/index.js';

test.describe.configure({ mode: 'serial' });
import { navigateToMenu, signInForDemo } from '../../../shared/order-helpers.js';

test.beforeEach(async ({ screen, seededUser }, testInfo) => {
  await signInForDemo(screen, expect, seededUser, testInfo);
});

test.describe('US-101 browse restaurant menu', () => {
  test('main dishes are listed', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-105 Main dishes are listed on the menu
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');

    const mainDishes = [
      'Ameglian Major Cow',
      'Green Salad',
      'Soup of the Day',
      'Quantum Shrimp Cascade',
      'Krikkit Fried Logic',
    ];
    for (const name of mainDishes) {
      await expect(screen.getByText(name)).toBeVisible();
    }
  });

  test('shipping disclaimer visible at bottom of menu', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-106 Shipping disclaimer visible at bottom of menu
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');

    await screen.getByText(/Shipping beyond/).scrollIntoViewIfNeeded();
    await expect(
      screen.getByText('* Shipping beyond 5 light-years distance might cost extra'),
    ).toBeVisible();
  });
});
