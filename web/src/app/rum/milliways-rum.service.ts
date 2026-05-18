import { Injectable } from '@angular/core';
import testchimp from '@testchimp/rum-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MilliwaysRumService {
  private initialized = false;

  configureIfNeeded(): void {
    if (this.initialized) {
      return;
    }
    const { testchimpProjectId, testchimpApiKey } = environment;
    if (!testchimpProjectId || !testchimpApiKey) {
      console.debug('TestChimp RUM skipped: missing project id or api key');
      return;
    }

    testchimp.init({
      projectId: testchimpProjectId,
      apiKey: testchimpApiKey,
      environment: environment.testchimpEnvironment,
      config: {
        maxEventsPerSession: 100,
        maxRepeatsPerEvent: 12,
        testchimpEndpoint: environment.testchimpEndpoint,
      },
    });
    this.initialized = true;
  }

  emit(title: string, metadata: Record<string, string> = {}): void {
    if (!this.initialized) {
      return;
    }
    testchimp.emit({ title, metadata: { ...metadata, platform: 'web' } });
  }

  lineItemCountBucket(count: number): string {
    if (count === 0) return '0';
    if (count === 1) return '1';
    if (count >= 2 && count <= 5) return '2_5';
    return '6_plus';
  }

  menuSectionCountBucket(count: number): string {
    if (count === 0) return '0';
    if (count === 1) return '1';
    if (count >= 2 && count <= 5) return '2_5';
    return '6_plus';
  }
}
