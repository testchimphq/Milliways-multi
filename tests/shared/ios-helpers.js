/** Avoid circular import with order-helpers.js */
async function visible(screen, expect, locator, timeoutMs) {
  try {
    await expect(locator).toBeVisible({ timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

/**
 * iOS system / auth sheets that block Welcome after sign-in (password save, local network, etc.).
 * Matches legacy ios/tc-tests behavior.
 */
export async function dismissIosPostSignInSheets(screen, expect) {
  const labels = ['Not Now', "Don't Allow", 'OK', 'Allow', 'Close'];
  for (let round = 0; round < 3; round++) {
    let dismissed = false;
    for (const label of labels) {
      const btn = screen.getByText(label, { exact: true });
      if (await visible(screen, expect, btn, 600)) {
        await btn.tap();
        dismissed = true;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    if (!dismissed) break;
  }
}
