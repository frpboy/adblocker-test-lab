import { init, globalHandlersIntegration } from '@sentry/browser';
import { createMinimalTransport } from './transport.js';
// Production builds run on preview/localhost too. Raw dev builds are inert.
if (import.meta.env.PROD) {
  try {
    init({
      dsn: 'https://98d400030fed6f4093eae00b839abf3b@o4510460282601472.ingest.us.sentry.io/4512436422901760',
      defaultIntegrations: false, integrations: [globalHandlersIntegration()],
      sendDefaultPii: false, attachStacktrace: false, maxBreadcrumbs: 0,
      tracesSampleRate: 0, enableLogs: false, sendClientReports: false,
      transport: () => createMinimalTransport(),
    });
  } catch { /* Diagnostics never prevent startup. */ }
}
