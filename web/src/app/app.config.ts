import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MilliwaysRumService } from './rum/milliways-rum.service';

function initRum(rum: MilliwaysRumService): () => void {
  return () => rum.configureIfNeeded();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initRum,
      deps: [MilliwaysRumService],
      multi: true,
    },
  ],
};
