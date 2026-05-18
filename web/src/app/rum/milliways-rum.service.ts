import { Injectable } from '@angular/core';
import testchimp from '@testchimp/rum-js';
import { environment } from '../../environments/environment';

/**
 * TestChimp TrueCoverage / RUM for the Angular web client.
 * Mirrors iOS `MilliwaysRum` / Android `MilliwaysRum.kt`.
 * Every emit merges metadata **platform** = **web**.
 */
@Injectable({ providedIn: 'root' })
export class MilliwaysRumService {
  private initialized = false;
  private lifecycleRegistered = false;

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
      release: environment.appVersion,
      config: {
        maxEventsPerSession: 100,
        maxRepeatsPerEvent: 12,
        testchimpEndpoint: environment.testchimpEndpoint,
        enableDefaultSessionMetadata: true,
      },
    });
    this.initialized = true;
    this.registerLifecycleFlush();
  }

  emit(title: string, metadata: Record<string, string> = {}): void {
    if (!this.initialized) {
      return;
    }
    testchimp.emit({ title, metadata: { ...metadata, platform: 'web' } });
  }

  flush(): void {
    if (!this.initialized) {
      return;
    }
    testchimp.flush();
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

  private registerLifecycleFlush(): void {
    if (this.lifecycleRegistered || typeof document === 'undefined') {
      return;
    }
    this.lifecycleRegistered = true;

    const flushOnHide = () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    };
    document.addEventListener('visibilitychange', flushOnHide);
    window.addEventListener('pagehide', () => this.flush());
  }
}
