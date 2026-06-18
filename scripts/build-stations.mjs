import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "..");
const sourceRoot = await resolveStationsSource();
const stationsPath = resolve(sourceRoot, "stations.jsonld");
const facilitiesPath = resolve(sourceRoot, "facilities.csv");
const outputPath = resolve(appRoot, "stations.json");

const stationsDocument = JSON.parse(await readFile(stationsPath, "utf8"));
const facilities = await readFacilities(facilitiesPath);

stationsDocument["@graph"] = stationsDocument["@graph"]
  .map(station => {
    const stationFacilities = facilities.get(station["@id"]);
    return stationFacilities ? { ...station, facilities: stationFacilities } : station;
  })
  .sort((a, b) => Number(b.avgStopTimes || 0) - Number(a.avgStopTimes || 0));

await writeFile(outputPath, `${JSON.stringify(stationsDocument)}\n`);
console.log(`Read station data from ${sourceRoot}`);
console.log(`Wrote ${stationsDocument["@graph"].length} stations to ${outputPath}`);

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
    if (await hasStationSourceFiles(source)) {
      return source;
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

async function hasStationSourceFiles(source) {
  try {
    await access(resolve(source, "stations.jsonld"));
    await access(resolve(source, "facilities.csv"));
    return true;
  } catch {
    return false;
  }
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
