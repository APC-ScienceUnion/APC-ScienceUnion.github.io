# Anonymous visitor statistics

The site now uses the Shanghai API independently of the disabled community UI.
`Caddyfile.images-only` allows only `/api/health` and `/api/visits`; it must remain
the deployed configuration until accounts/comments are separately approved.

- `POST /api/visits`: JSON `topic`, UUIDv4 `visitorId`, UUIDv4 `viewId`; requires an
  allowed Origin and `X-Community-Request: 1`. Limited to 60 writes/minute/IP.
- `GET /api/visits?topic=/`: reads aggregates without incrementing them.
- Responses include `siteVisitors`, `siteViews`, `pageViews`, and `startedAt`.
  `startedAt` is null until the first valid POST and remains stable thereafter.
- Visitors are anonymous browser installations, not registered users or people.
  A random ID in localStorage is HMAC-hashed by the API. Clearing storage, changing
  browsers, or disabling storage can increase the count. Counts are approximate;
  an automated client can still create IDs. They are not suitable for billing.
- No raw IP, referrer, email, or visitor/page history is stored by the statistics
  tables. Per-page aggregates use the existing article allowlist; non-article
  pages contribute to the `/` bucket. Chinese/English translations share a topic.
  Retry receipts contain hashes only and expire after 24 hours. The existing
  short-lived request limiter also uses HMAC hashes.
- All totals start fresh; no unknown Busuanzi totals are imported. The public UI
  shows the start date in Beijing time, and explains the browser-based definition.
- The tables live in the existing SQLite database and are covered by its backup.
  Schema creation is additive. Never reset the database to restart the service.
- Localhost, preview hosts and copied sites do not submit visits. A normal refresh
  adds a page view; loading the script twice in the same document does not. If the
  API fails, the UI says unavailable rather than displaying zero or blocking pages.

Validate with `npm test --prefix services/community` and
`node --test tests/test_visitor_count.js`. Before releasing the frontend, deploy
the backend and the restricted Caddy configuration, verify health and read-only
statistics over HTTPS, and ensure `/api/session` still returns 503.
