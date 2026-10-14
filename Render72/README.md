# Sidequest — Render72 first draft

A lightweight, responsive event discovery site with a landing page and an all-events page. The event list includes search, category filters, sorting, pagination, and event detail views (`/events.html?id=...`).

## Run locally

Node.js is the only local requirement. Start the included static preview server:

```powershell
node serve.mjs
```

Then open `http://localhost:4173`.

## Connect the Render72 events API

The public event brief describes `getAllEvents` and `getEventByID`, but the exact URLs and response schema were not visible on the public portal pages. Set the two documented URLs in `config.js` when those docs are available:

```js
window.SIDEQUEST_CONFIG = {
  allEventsUrl: "PASTE_THE_GET_ALL_EVENTS_URL_HERE",
  eventByIdUrl: "PASTE_THE_GET_EVENT_BY_ID_URL_HERE_WITH_{id}",
  requestTimeoutMs: 8000,
  cacheTtlMs: 60000
};
```

The detail URL should include `{id}` where the event ID belongs. The adapter accepts event arrays directly or wrapped in common `events`, `data`, `results`, or `items` properties. It normalizes common event field names for title, date, venue, category, description, poster, price, organizer, and registration link. If the portal uses different field names, update `normalizeEvent()` in `app.js` to match its docs.

Until configured, the events page displays local sample data with a clear preview notice. When the live API errors or times out, it also shows a clear notice and labeled preview events. Empty live responses display an empty state. Successful responses are cached in session storage for one minute and the list is rendered eight items at a time.

## Publish

This is a static site: deploy the folder to a static hosting provider such as Cloudflare Pages. Before submitting, replace the API URL placeholders, verify the live event response against the docs, and add the actual deployment and repository URLs to the event portal. This draft does not submit anything to the event portal.
