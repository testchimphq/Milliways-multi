import { test as base } from '@mobilewright/test';
import { seedUser } from '../../shared/seed-user.js';

export const test = base.extend({
  seededUser: async ({}, use, testInfo) => {
    const user = await seedUser(testInfo);
    await use(user);
  },
});
