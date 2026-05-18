/** Shared Mobilewright UI helpers (iOS + Android). */
import { dismissIosPostSignInSheets } from './ios-helpers.js';

const SIGN_IN_TAGLINE = /Sign in to order from the restaurant at the end of the universe/;

export async function isVisible(screen, expect, locator, timeoutMs) {
  try {
    await expect(locator).toBeVisible({ timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

export async function ensureOnSignInScreen(screen, expect) {
  for (let step = 0; step < 16; step++) {
    if (await isVisible(screen, expect, screen.getByText(SIGN_IN_TAGLINE), 900)) return;

    if (await isVisible(screen, expect, screen.getByLabel('Close').first(), 450)) {
      await screen.getByLabel('Close').first().tap();
      continue;
    }
    if (await isVisible(screen, expect, screen.getByLabel('Back').first(), 450)) {
      await screen.getByLabel('Back').first().tap();
      continue;
    }
    const newOrder = screen.getByText('New Order');
    if (await isVisible(screen, expect, newOrder, 600)) {
      await openAccount(screen, expect);
      const signOut = screen.getByText('Sign Out');
      if (await isVisible(screen, expect, signOut, 5_000)) await signOut.tap();
      continue;
    }
    if (await isVisible(screen, expect, screen.getByText('Create Account'), 450)) {
      await screen.getByLabel('Back').first().tap();
      continue;
    }
  }
  await expect(screen.getByText(SIGN_IN_TAGLINE)).toBeVisible({ timeout: 30_000 });
}

export async function waitForSignedInHome(screen, expect, timeoutMs = 35_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isVisible(screen, expect, screen.getByLabel('New Order'), 800)) return;
    if (await isVisible(screen, expect, screen.getByText('New Order'), 800)) return;
  }
  for (const pattern of [/Invalid email/i, /offline/i, /could not connect/i, /Request failed/i]) {
    if (await isVisible(screen, expect, screen.getByText(pattern), 400)) {
      throw new Error(`Sign-in failed (UI error matching ${pattern})`);
    }
  }
  throw new Error('Timed out waiting for signed-in home (New Order)');
}

export async function tapNewOrder(screen, expect) {
  const byLabel = screen.getByLabel('New Order');
  if (await isVisible(screen, expect, byLabel, 2_000)) {
    await byLabel.tap();
    return;
  }
  await screen.getByText('New Order').tap();
}

export async function navigateToMenu(screen, expect) {
  await tapNewOrder(screen, expect);
  await expect(screen.getByText('MAIN DISHES')).toBeVisible({ timeout: 30_000 });
}

export async function signInForDemo(screen, expect, user, testInfo) {
  await ensureOnSignInScreen(screen, expect);
  await expect(screen.getByText(SIGN_IN_TAGLINE)).toBeVisible({ timeout: 30_000 });
  const email = screen.getByLabel('Email');
  const password = screen.getByLabel('Password');
  await email.tap();
  await email.fill(user.email);
  await new Promise((r) => setTimeout(r, 400));
  await password.tap();
  await password.fill(user.password);
  await new Promise((r) => setTimeout(r, 400));
  await screen.getByText('Sign In').tap();
  if (testInfo?.project?.name === 'ios') {
    await dismissIosPostSignInSheets(screen, expect);
  }
  await waitForSignedInHome(screen, expect);
}

export async function addItemToCart(screen, expect, itemName, extraPlusTaps = 0) {
  await screen.getByText(itemName).scrollIntoViewIfNeeded();
  await screen.getByText(itemName).tap();
  for (let i = 0; i < extraPlusTaps; i++) {
    await screen.getByLabel('+').tap();
  }
  await screen.getByLabel('Add to Order').tap();
  await expect(screen.getByLabel('Close')).not.toBeVisible({ timeout: 20_000 });
}

export async function openCart(screen) {
  await screen.getByLabel('Shopping Cart').tap();
}

export async function openAccount(screen, expect) {
  const account = screen.getByLabel('Account');
  if (await isVisible(screen, expect, account, 1_500)) {
    await account.tap();
    return;
  }
  await screen.getByLabel('person.circle').tap();
}
