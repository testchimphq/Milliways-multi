import { expect } from '@mobilewright/test';

/** Open account from welcome (text entry is reliable; top-right icon is not in automation). */
export async function openAccountScreen(screen) {
  await screen.getByText('Open Account').tap();
}

/** Android Compose: buttons use semantics contentDescription → getByLabel, not getByRole. */
export async function signInToWelcome(screen, seedUser) {
  const { email, password } = seedUser;
  await screen.getByLabel('Email').fill(email);
  await screen.getByLabel('Password').fill(password);
  await screen.getByLabel('Sign In').tap();
  await expect(screen.getByLabel('New Order')).toBeVisible({ timeout: 60_000 });
}
