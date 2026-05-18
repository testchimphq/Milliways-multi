import { test as base } from '@mobilewright/test';
import { installTestChimp } from '@testchimp/playwright/runtime';
import { seedQaUser } from '../../shared/seed-user.js';

const testWithSeed = base.extend({
  seedUser: async ({}, use, testInfo) => {
    await use(await seedQaUser(testInfo));
  },
});

export const test = installTestChimp(testWithSeed, { uiFixture: 'screen' });
export { expect } from '@mobilewright/test';
