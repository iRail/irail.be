import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "..");
const sourceRoot = await resolveStationsSource();
const stationsPath = resolve(sourceRoot, "stations.jsonld");
const facilitiesPath = resolve(sourceRoot, "facilities.csv");
const outputPath = resolve(appRoot, "stations.json");
const stationPagesPath = resolve(appRoot, "stations", "NMBS");
const STATION_ID_PREFIX = "http://irail.be/stations/NMBS/";

const stationsDocument = JSON.parse(await readFile(stationsPath, "utf8"));
const facilities = await readFacilities(facilitiesPath);

stationsDocument["@graph"] = stationsDocument["@graph"]
  .map(station => {
    const stationFacilities = facilities.get(station["@id"]);
    return stationFacilities ? { ...station, facilities: stationFacilities } : station;
  })
  .sort((a, b) => Number(b.avgStopTimes || 0) - Number(a.avgStopTimes || 0));

await writeFile(outputPath, `${JSON.stringify(stationsDocument)}\n`);
await writeStationPages(stationsDocument["@graph"]);

console.log(`Read station data from ${sourceRoot}`);
console.log(`Wrote ${stationsDocument["@graph"].length} stations to ${outputPath}`);
console.log(`Wrote ${stationsDocument["@graph"].length} station pages to ${stationPagesPath}`);

async function resolveStationsSource() {
  const explicitSource = optionValue("--source") || process.env.STATIONS_SOURCE_DIR;
  const candidates = explicitSource
    ? [explicitSource]
    : [
        ".cache/irail-stations",
        "irail-stations",
      ];

  for (const candidate of candidates) {
    const source = resolve(appRoot, candidate);
    const resolved = await findStationSourceDirectory(source);
    if (resolved) {
      return resolved;
    }
  }

  const expected = candidates.map(candidate => resolve(appRoot, candidate)).join(", ");
  throw new Error(`Could not find irail/stations checkout. Expected stations.jsonld and facilities.csv in: ${expected}`);
}

function optionValue(name) {
  const index = process.argv.indexOf(name);
  if (index !== -1) {
    return process.argv[index + 1];
  }

  const prefix = `${name}=`;
  const option = process.argv.find(argument => argument.startsWith(prefix));
  return option ? option.slice(prefix.length) : null;
}

async function findStationSourceDirectory(source, depth = 0) {
  if (await hasStationSourceFiles(source)) {
    return source;
  }

  if (depth >= 4) {
    return null;
  }

  try {
    const entries = await readdir(source, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      const nested = await findStationSourceDirectory(resolve(source, entry.name), depth + 1);
      if (nested) {
        return nested;
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function hasStationSourceFiles(source) {
  try {
    await access(resolve(source, "stations.jsonld"));
    await access(resolve(source, "facilities.csv"));
    return true;
  } catch {
    return false;
  }
}

async function writeStationPages(stations) {
  await rm(stationPagesPath, { recursive: true, force: true });
  await mkdir(stationPagesPath, { recursive: true });

  await Promise.all(stations.map(async station => {
    const code = stationCode(station);
    if (!code) {
      return;
    }
    await writeFile(resolve(stationPagesPath, `${code}.html`), stationPageHtml(station));
  }));
}

async function readFacilities(path) {
  const csv = await readFile(path, "utf8");
  const rows = parseCsv(csv.trim());
  const headers = rows.shift();
  const byUri = new Map();

  for (const row of rows) {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));
    const uri = record.URI;
    delete record.URI;
    if (uri) {
      byUri.set(uri, normalizeRecord(record));
    }
  }

  return byUri;
}

function normalizeRecord(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== "")
  );
}

function stationPageHtml(station) {
  const name = station.name || stationCode(station);
  const code = stationCode(station);
  const jsonLd = stationJsonLd(station);
  const jsonLdText = JSON.stringify(jsonLd, null, 2);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#C72929">
  <title>${escapeHtml(name)} | iRail station</title>
  <link rel="shortcut icon" href="../../favicon.ico">
  <link rel="stylesheet" href="../../styles.css">
  <script id="station-jsonld" type="application/ld+json">${escapeScriptJson(jsonLdText)}</script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="../../" aria-label="iRail home">
      <span class="brand-mark"><img class="brand-logo" src="../../assets/logo.svg" alt=""></span>
      <span>iRail</span>
    </a>

    <nav class="view-nav" aria-label="App sections">
      <a class="nav-link-button" href="../../?view=route">Plan route</a>
      <a class="nav-link-button is-active" href="../../?view=liveboard&amp;station=${encodeURIComponent(station["@id"])}">Station</a>
      <a class="nav-link-button" href="../../?view=train">Train</a>
    </nav>
  </header>

  <main class="app-shell station-subject">
    <section class="view-heading station-subject-heading">
      <p class="eyebrow">NMBS station ${escapeHtml(code)}</p>
      <h1>${escapeHtml(name)}</h1>
      <p>${escapeHtml(stationDescription(station))}</p>
    </section>

    <section class="liveboard-panel subject-card">
      <h2 class="section-heading">Departures</h2>
      <p class="small">Live departures from api.irail.be. Updated for <span id="station-liveboard-time">now</span>.</p>
      <div id="station-departures" class="liveboard-list">
        <div class="loading"><div class="loader">Loading</div><p class="small">Loading departures</p></div>
      </div>
    </section>

    <section class="jsonld-panel subject-card">
      <h2 class="section-heading">JSON-LD description</h2>
      <pre class="jsonld-snippet">${escapeHtml(jsonLdText)}</pre>
    </section>
  </main>

  <footer class="site-footer">
    <p>
      <a href="https://hello.irail.be/" target="_blank" rel="noopener">'iRail'</a>
      - Open Knowledge Belgium. Part of
      <a href="https://www.openknowledge.be/" target="_blank" rel="noopener">Open Knowledge Belgium</a>.
    </p>
    <p>&copy; 2026 Open Knowledge Belgium</p>
  </footer>

  <script type="module">
    const API_BASE = "https://api.irail.be";
    const stationCode = ${JSON.stringify(code)};
    const stationName = ${JSON.stringify(name)};
    const departures = document.querySelector("#station-departures");
    const liveboardTime = document.querySelector("#station-liveboard-time");

    function dateParts(date) {
      const parts = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Brussels",
      }).formatToParts(date);
      return Object.fromEntries(parts.map(part => [part.type, part.value]));
    }

    function apiDate(date) {
      const parts = dateParts(date);
      return \`\${parts.day}\${parts.month}\${parts.year.slice(-2)}\`;
    }

    function apiTime(date) {
      const parts = dateParts(date);
      return \`\${parts.hour}\${parts.minute}\`;
    }

    function displayTime(seconds) {
      const parts = dateParts(new Date(Number(seconds) * 1000));
      return \`\${parts.hour}:\${parts.minute}\`;
    }

    function delayLabel(delay, canceled) {
      if (Number(canceled || 0) > 0) {
        return '<span class="delay">canceled</span>';
      }
      const minutes = Math.round(Number(delay || 0) / 60);
      return minutes > 0 ? \`<span class="delay">+\${minutes}'</span>\` : "";
    }

    function platformName(platform) {
      return platform || "?";
    }

    function asArray(value) {
      if (!value) {
        return [];
      }
      return Array.isArray(value) ? value : [value];
    }

    function vehicleShortName(value) {
      return String(value || "").replace("BE.NMBS.", "").replace("http://irail.be/vehicle/", "");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[char]));
    }

    function renderDepartures(items) {
      if (!items.length) {
        departures.innerHTML = '<div class="alert alert-info">No departures found for this station.</div>';
        return;
      }

      departures.innerHTML = items.map(departure => {
        const vehicle = vehicleShortName(departure.vehicle);
        return \`
          <a class="liveboard-item" href="../../?view=train&amp;train=\${encodeURIComponent(vehicle)}">
            <span class="liveboard-time">
              <span class="text-tabular">\${escapeHtml(displayTime(departure.time))}</span>
              \${delayLabel(departure.delay, departure.canceled)}
            </span>
            <span><strong>\${escapeHtml(departure.station || "")}</strong> <span class="small">\${escapeHtml(vehicle)}</span></span>
            <span class="badge">\${escapeHtml(platformName(departure.platform))}</span>
          </a>
        \`;
      }).join("");
    }

    async function loadDepartures() {
      const now = new Date();
      const params = new URLSearchParams({
        id: \`BE.NMBS.\${stationCode}\`,
        date: apiDate(now),
        time: apiTime(now),
        arrdep: "departure",
        lang: "en",
        format: "json",
        alerts: "false",
      });
      liveboardTime.textContent = \`\${dateParts(now).hour}:\${dateParts(now).minute}\`;

      try {
        const response = await fetch(\`\${API_BASE}/liveboard/?\${params}\`);
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}\`);
        }
        const data = await response.json();
        renderDepartures(asArray(data.departures && data.departures.departure));
      } catch (error) {
        departures.innerHTML = \`<div class="alert alert-danger">Could not load departures for \${escapeHtml(stationName)}.</div>\`;
      }
    }

    loadDepartures();
  </script>
</body>
</html>
`;
}

function stationJsonLd(station) {
  const code = stationCode(station);
  const json = {
    "@context": {
      schema: "https://schema.org/",
      geo: "http://www.w3.org/2003/01/geo/wgs84_pos#",
      dcterms: "http://purl.org/dc/terms/",
      irail: "https://irail.be/ns/terms#",
      name: "schema:name",
      alternateName: "schema:alternateName",
      latitude: "geo:lat",
      longitude: "geo:long",
    },
    "@id": station["@id"],
    "@type": ["schema:TrainStation", "irail:Station"],
    name: station.name,
    "irail:nmbsStationCode": code,
    "irail:apiIdentifier": `BE.NMBS.${code}`,
    "irail:avgStopTimes": numericValue(station.avgStopTimes),
    latitude: numericValue(station.latitude),
    longitude: numericValue(station.longitude),
    "schema:url": `https://irail.be/stations/NMBS/${code}.html`,
    "irail:departuresEndpoint": `https://api.irail.be/liveboard/?id=BE.NMBS.${code}`,
  };

  const alternatives = stationAlternatives(station);
  if (alternatives.length) {
    json.alternateName = alternatives.map(item => item["@value"]);
  }

  return json;
}

function stationDescription(station) {
  return `${station.name || "This station"} is an NMBS railway station. This page describes the station and loads live departures from api.irail.be.`;
}

function stationCode(station) {
  return String(station["@id"] || "").replace(STATION_ID_PREFIX, "");
}

function stationAlternatives(station) {
  return Array.isArray(station.alternative)
    ? station.alternative
    : station.alternative ? [station.alternative] : [];
}

function numericValue(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function escapeScriptJson(value) {
  return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        field += char;
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" && !quoted) {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  rows.push(row);
  return rows;
}
