import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

async function enableMockingIfNeeded() {
  if (!isDevMode()) {
    return;
  }

  const { worker } = await import('./mocks/browser');

  return worker.start({ onUnhandledRequest: 'bypass' });
}

enableMockingIfNeeded().then(() => {
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
});
