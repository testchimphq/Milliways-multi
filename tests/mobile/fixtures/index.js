import { installTestChimp } from '@testchimp/playwright/runtime';
import { test as auth } from './auth.fixture.js';

export const test = installTestChimp(auth, { uiFixture: 'screen' });
export { expect } from '@mobilewright/test';
