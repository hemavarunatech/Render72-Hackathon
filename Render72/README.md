# Sidequest — Render72

A responsive campus event discovery site with a landing page, all-events page, search, category and type filters, sorting, pagination, and event details.

## Run locally

Use Node.js to start the static preview server:

```powershell
node serve.mjs
```

Then open http://localhost:4173.

## Render72 events API

The site uses the public API without an API key:

- GET https://render72.pages.dev/api/test/events returns an events array.
- GET https://render72.pages.dev/api/test/events/{id} returns one event.

Event cards use the documented schedule, image, category, tags, type, mode, status, price, team size, capacity, and registration fields. Search checks names, descriptions, categories, tags, and format. Results can be filtered by category or event/workshop type and sorted by date or name.

The list is cached in session storage for one minute and displays eight results per page. If the API is unavailable or times out, the site shows a clear notice and labeled preview events. Empty API responses show an empty state. Event details use the ID endpoint and can fall back to the matching list item.

## Publish

This static site is in the repository's `Render72/` folder. In Cloudflare Pages, use the None framework preset, set the root directory to `Render72`, build command to `exit 0`, and build output directory to `.`. Alternatively, leave the root directory blank and set the build output directory to `Render72`. Add the deployed URL and repository URL to the event portal after deployment. The site does not submit to the event portal.
