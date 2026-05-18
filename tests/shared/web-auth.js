import { expect } from '@playwright/test';

export async function signInToWelcome(page, seedUser) {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(seedUser.email);
  await page.getByLabel('Password').fill(seedUser.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome to Milliways' })).toBeVisible({
    timeout: 30_000,
  });
}

export async function openMenuFromWelcome(page) {
  await page.getByRole('button', { name: 'New Order' }).click();
  await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible();
}
