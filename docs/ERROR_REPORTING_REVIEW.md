# Local source review only

Baseline c7643198526a31d7a29c4d7935c5fbc7f035ebf1. Nothing published or deployed.

Pinned Sentry browser10.78.0 installs global error/rejection handlers before React startup in production builds. Development builds are inert; a production bundle is active on preview/localhost too. At the final transport, no incoming envelope headers/event/hint are serialized. Fresh ID/time plus fixed generic message, fixed release/environment/platform/level are the only event values. All other envelope item types drop. No raw exception/stack, URLs, lab measurements, network-test results, console/DOM, cookies, device data, request/user, breadcrumbs, attachments, recording, logs, profiles or tracing.

The fixed request uses credentials omit and no-referrer. 500ms outer deadline/abort,1 concurrent send,60s spacing,10/hour per page runtime and at least1h backoff on429/Sentry rate-limit header (longer supplied retry respected). No persistent storage/queue. Caps are runtime-local, not aggregate. Handled React/fetch failures and lab test failures are not reported; the lab's intentional failed resources are not application errors. Ad blockers may intentionally block Sentry, so lost events are expected and must not become lab-score evidence.

Qualification: TypeScript+Vite build PASS;52 total Node tests PASS including6 new real SDK/direct hostile wire/deadline/backoff tests. Actual production bundle in headless Chrome: separate uncaught/rejection pages emit fixed generic bodies only, no raw URL/query/fragment/DOM/console/exception markers, no Referer. No live Sentry send. npm audit2 moderate (Vite and postcss-selector-parser), not fixed as part of telemetry work.

Privacy wording proposal: This proposed build sends generic reliability signals to Sentry US, without session recording or lab results. The vendor necessarily processes source IP to receive requests. Service-side IP/derived geo storage is a separate setting under review, not prevented by event-body minimization. Developer plan shares5000 errors/month and retains events30 days; backups/logs/copies have separate policies. No no-personal-data/all-copy-deletion guarantee.

Publication requires deploy-coupling/no-preview review and policy approval. No source-map upload or auth token, no production setting changes in this patch.

Outer deadline is an early return, not a guarantee the underlying network stops. Busy clears only after actual fetch+response body cancellation settles; flush is false while busy and is not delivery proof. Tests cover ignored abort, deferred body cancellation, concurrency and long rate-limit backoff. Redirect error prevents forwarding to redirected hosts.
