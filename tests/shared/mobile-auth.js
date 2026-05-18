import { expect } from '@mobilewright/test';
import { MAIN_DISHES } from './menu-catalog.js';

export { MAIN_DISHES };

/** Dismiss common iOS system sheets after sign-in (Save Password, Local Network, etc.). */
export async function dismissIosSystemSheets(screen) {
  for (const name of ['Not Now', 'Allow']) {
    try {
      const btn = screen.getByRole('button', { name });
      if (await btn.isVisible({ timeout: 1500 })) {
        await btn.tap();
      }
    } catch {
      // Sheet not shown — continue.
    }
  }
}

export async function signInToWelcome(screen, seedUser) {
  const { email, password } = seedUser;
  await screen.getByLabel('Email').fill(email);
  await screen.getByLabel('Password').fill(password);
  await screen.getByRole('button', { name: 'Sign In' }).tap();
  await dismissIosSystemSheets(screen);
  await expect(screen.getByText('Welcome to Milliways')).toBeVisible({ timeout: 60_000 });
}
