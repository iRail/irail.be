# iRail.be static frontend

This repository contains the GitHub Pages frontend for iRail.be.

## Build and publication

GitHub Actions builds and publishes the site with `.github/workflows/pages.yml`.
Pushes to `main`, manual runs and the daily schedule build fresh station data,
run unit/browser checks, and deploy the `dist/` artifact to GitHub Pages. Pull
requests run the same build and checks without publishing. The workflow does
not commit generated files.

In **Settings → Pages → Build and deployment → Source**, select **GitHub
Actions**. Keep the existing custom-domain setting for `irail.be`. The workflow
uses GitHub's [Pages artifact deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

```sh
npm ci
npm run build:stations -- --source path/to/irail-stations
npm run build
npm test
npx playwright install chromium
npm run test:beta
```

The station source must contain `stations.jsonld` and `facilities.csv`; generate
`stations.jsonld` using the station repository's build command first. The Pages
workflow checks out `irail/stations` and performs these steps automatically.

`dist/` contains the existing root website, station pages, station data and the
planner at `dist/beta/`. It excludes application source, tests, dependencies and
local files. The `dist/` build output is ignored by Git.

## Planner beta

`/beta/` is a self-contained replacement frontend using **@irail/planner 0.1.2
from npm** in Web Workers. Journey planning, station search, departures/arrivals
and daily train runs use the library and the iRail CDN's Linked Connections
timetable and NMBS/SNCB GTFS Realtime feed. The beta makes no iRail API requests.

See the [beta README](beta/README.md) for an introduction, local setup and a guide
to the source code.

Edit `beta/` and use `npm run dev:beta` for development, or
`npm run build:beta` followed by `npm run preview:beta` to preview the production
beta. Dates always display as **DD/MM/YYYY**, times as **24-hour Belgian local
time**, including for users whose browser is configured in another timezone.
Both departure-time and arrival-deadline journey searches are supported.

The bar below the red header summarizes feed time, delayed/canceled trips and
update status. It checks every 30 seconds while the tab is visible. Updated
journeys retain expanded cards; train and station overview tabs update too.
Train and station links use neutral text and a pale hover background, with red
reserved for delays/cancellations in the results.

Clicking a train fills and opens the Train tab on its service day and highlights
the ridden section. Clicking a station fills and opens the Station tab at the
stop's expected journey time, selecting arrivals or departures as appropriate.
The route remains available in its tab. Train autocomplete matches compact
numbers such as `P8008`, displays each train's headsign, and scans actual
service-day connections through the planner's public core. It excludes trains
from other service days and trains canceled by the available real-time feed.
Station autocomplete uses the package's multilingual fuzzy search.
Selecting a station or train loads its overview immediately. Changes to the
selected station's time/date/board or the selected train's date reload the view.
The route planner uses the same departure/arrival toggle as the existing site.
Browser Back/Forward restores each route search, station board and train view,
including the form values, expanded journey cards, highlighted train section
and scroll position. History entries can also be reconstructed from their URLs
after reloading the page. Automatic real-time updates do not add history entries.

### Install on a phone

Open `https://irail.be/beta/` after deployment. On Android, use the browser's
**Install app / Add to Home screen** option. On iPhone, use Safari's **Share →
Add to Home Screen**. The app is named **iRail beta**, launches in a standalone
window, and stays within the beta's scope. Installation requires HTTPS (or
localhost for development); see [browser installation requirements](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

The manifest includes a stable relative app ID, start URL and scope, 192/512 px
PNG icons, an Android maskable icon, and route/station/train shortcuts. iPhone
home-screen metadata includes a 180 px Apple touch icon. These relative URLs
also work when the build is relocated. Icons are derived from the existing iRail
vector logo; to regenerate them after editing the logo, install Playwright's
Chromium and run `node scripts/build-beta-icons.mjs`. PNG assets are included
in the source; deployment does not require generating them again.

Browser checks use the invented timetable and real-time snapshots in
`tests/fixtures/beta/`. They cover tab navigation, contextual times, arrival
deadlines, daily train suggestions, delays, automatic updates, mobile layout,
browser history, install metadata/icons, and relocating the built folder.

To promote the beta later, deploy the **contents** of `dist/beta/` at the domain
root. Assets, workers, the web manifest, home links and URL state are relative;
there is no runtime dependency on the old frontend, station JSON, the source
checkout or a neighboring project. Preserve station/RDF pages and the custom
domain as needed. No service worker is installed. Train compositions and crowding data
remain unavailable from the planner.

## Existing root frontend

It replaces the old `hyperRail` server-rendered application with a client-side HTML, CSS, and JavaScript app. The app talks directly to `https://api.irail.be` for route planning, station departures, train details, and train composition data.

## Station autocomplete data

The station autocomplete uses a generated `stations.json` file. The source data comes from the `irail/stations` repository.

To rebuild it locally:

```sh
npm run build:stations -- --source path/to/irail-stations
```

The Pages workflow regenerates station data and pages daily and includes them in the deployment artifact, without committing the generated output.
