# iRail beta

A new frontend for [iRail.be](https://irail.be/beta/), powered by
[@irail/planner](https://github.com/iRail/planner). Plan a Belgian train journey,
look up a train's stops, or check a station's departures and arrivals—all in
your browser, with real-time updates.

This directory contains the application's source. The deployable version is
built into `dist/beta/` at the repository root. The existing production frontend
still lives separately in the root of this repository.

## What you can try

- **Plan a journey:** choose stations and a departure time or arrival deadline.
  Station suggestions understand names in multiple languages and tolerate typos.
- **Explore a train:** click a train in a journey to see its full run on that
  service day, with your section highlighted. Train search accepts numbers such
  as `P8008` and shows headsigns for trains running on the selected day.
- **Explore a station:** click a journey's station to see an hour of arrivals or
  departures at the time you would be there. Selecting a station or train loads
  its overview immediately.
- **Keep your place:** browser Back/Forward restores searches, overview tabs,
  expanded journey cards and scroll position. URLs can be shared or bookmarked.

Dates use **DD/MM/YYYY** and times use the **24-hour clock in Europe/Brussels**,
even when your device is in another timezone. The interface is available in
English, Dutch, French and German.

## How it works

The app downloads the open timetable from the
[iRail CDN manifest](https://irail.github.io/iRail-cdn/manifest.jsonld). That
manifest describes Linked Connections 2.0-alpha timetable files in Apache Arrow
format and identifies the NMBS/SNCB GTFS Realtime feed.

`@irail/planner` reads these sources and calculates journeys in a Web Worker,
keeping the interface responsive. Station search, station boards and train runs
also come from the planner library. There are no calls to the iRail API, no API
keys to configure, and no application server to run.

The status bar below the red header shows the feed time and a summary of delays
and cancellations. While the tab is visible, the app checks for updates every
30 seconds. When the feed changes, it refreshes the results while preserving
expanded journey cards. If the feed cannot be reached, the last available data
stays in use and the status bar reports the problem.

Train autocomplete has its own worker. It uses the planner's public core to
scan connections for the selected service day, rather than suggesting every
train number found in the timetable. Its index is reused until the day or the
real-time feed version changes.

Language preferences and recent routes are stored locally in the browser.
Journey calculations and navigation state are handled on the device; timetable
and real-time data are downloaded from their publishers.

## Run it locally

Use **Node.js 22.12 or newer** and npm. Run all commands below from the
**repository root**, one directory above this README:

```sh
npm ci
npm run dev:beta
```

Open the local URL printed by Vite. The development server serves this
directory as its app root, so the planner appears at `/` on that server.
Development uses the live timetable and real-time sources; an internet
connection is needed to load them.

To preview a production build:

```sh
npm run build:beta
npm run preview:beta
```

Open the preview URL printed by Vite. Serve the build through HTTP or HTTPS;
opening `index.html` directly with `file://` is not the supported setup for its
JavaScript modules and workers.

## Find your way around the source

| File | Purpose |
| --- | --- |
| [`index.html`](index.html) | App header, journey form, station and train tabs, and mobile install metadata. |
| [`app.js`](app.js) | Planner client, autocomplete, result rendering and real-time updates. |
| [`train-search-worker.js`](train-search-worker.js) | Train suggestions filtered by service day, with headsigns. |
| [`navigation.js`](navigation.js) | Browser history, cached views and restoration of navigation state. |
| [`time.js`](time.js), [`date-time.js`](date-time.js), [`date-time-controls.js`](date-time-controls.js) | Belgian timezone handling, date validation and date/time pickers. |
| [`i18n.js`](i18n.js) | Interface translations. |
| [`base.css`](base.css), [`styles.css`](styles.css) | The existing iRail visual style and beta-specific styling. |
| [`public/`](public/) | Files copied into the build, including the app manifest and icons. |

The planner dependency is installed from npm and pinned in the root
[`package.json`](../package.json) and [`package-lock.json`](../package-lock.json).
The build needs no neighboring planner checkout.

## Check a change

```sh
npm test
npm run build
npx playwright install chromium
npm run test:beta
```

The browser suite runs against the complete `dist/` build. It uses an
[invented timetable and real-time snapshots](../tests/fixtures/beta/README.md)
to make checks reproducible, including delays, cancellations and trains that
run on different days. These fixtures are only for tests and are not included
in the deployed app.

Checks cover station and train selection, autocomplete, departure/arrival
searches, mobile layout, real-time refreshes, browser history, installability,
and moving the built app to another hosting path.

## Build and deployment

[`vite.beta.config.js`](../vite.beta.config.js) bundles the app and its workers
with relative asset URLs. `npm run build:beta` creates `dist/beta/`; generated
output is ignored by Git.

For the whole website, `npm run build` packages the existing root frontend and
its station/RDF pages alongside the beta. The
[Pages workflow](../.github/workflows/pages.yml) generates fresh station data,
runs the checks, builds the site and publishes `dist/` to GitHub Pages. See the
[repository setup instructions](../README.md#build-and-publication) for station
data generation and Pages configuration.

The **contents of `dist/beta/`** can later be deployed at the domain root. Asset
paths, workers, the manifest and app links are relative, so the compiled app is
self-contained. Existing station pages, RDF resources and custom-domain setup
can be retained separately when making that switch.

## Install on a phone

From the deployed HTTPS site, use your Android browser's **Install app / Add to
Home screen**, or Safari's **Share → Add to Home Screen** on iPhone. The app is
named **iRail beta** and opens in a standalone window.

[`site.webmanifest`](public/site.webmanifest) includes regular and maskable
icons, a relative app identity and scope, and shortcuts to the three views.
The iPhone home-screen icon is supplied separately in the HTML. To regenerate
icons from the existing vector logo after installing Playwright's Chromium:

```sh
node scripts/build-beta-icons.mjs
```

Installation does not provide an offline timetable. The app has no service
worker and needs a connection to download timetable data from its publisher. Train
composition and crowding information are not currently available through this
frontend.

## Build something of your own

The UI is one example of what you can build with
[@irail/planner](https://github.com/iRail/planner). Explore its documentation to
use the same planning, station and train capabilities in another application.
Ideas, bug reports and contributions are welcome in the
[iRail.be repository](https://github.com/iRail/irail.be).
