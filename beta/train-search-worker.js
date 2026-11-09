import { createPlanner } from "@irail/planner/core";
import { tableFromIPC, RecordBatchReader } from "apache-arrow";
import { belgianInstant } from "./time.js";

// The public core can scan the actual connections for a service day. Looking
// only at trips.arrow would also suggest trains that do not run on that day.
const planner = createPlanner({ tableFromIPC, RecordBatchReader });
let sources, dayIndex, queue = Promise.resolve();
const normalize = value => String(value).normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, "").toUpperCase();

async function search({ dataUrl, date, query, language = "en", realtimeVersion, limit = 8 }) {
  const midnight = belgianInstant(date, "00:00");
  if (!midnight) throw new Error("Choose a valid date first.");
  if (!sources) {
    const descriptors = await planner.discoverSources(dataUrl);
    sources = await Promise.all(descriptors.map(planner.loadSource));
  }
  const key = `${date}|${realtimeVersion}`;
  if (dayIndex?.key !== key) {
    await planner.refreshRealtime(sources).catch(() => {});
    const vehicles = new Map(), serviceDate = Number(date.replaceAll("-", ""));
    for (const source of sources) {
      const headsigns = await planner.headsignDirectory(source);
      const tripsToday = new Set();
      // Include after-midnight continuations of this service day; filter by
      // serviceDate as well so the following day's trains cannot leak in.
      await planner.scanConnections(source, Number(midnight) / 1000 - 3 * 3600, Number(midnight) / 1000 + 36 * 3600, (batch, row) => {
        if (batch.serviceDate?.[row] === serviceDate && !((batch.flags?.[row] ?? 0) & 1)) tripsToday.add(batch.trip[row]);
      });
      for (const index of tripsToday) {
        const trip = source.tables.trips.get(index), route = source.tables.routes.get(trip.routeIdx);
        if (!trip.shortName) continue;
        const type = route.shortName || route.longName || "";
        const id = `BE.NMBS.${type}${trip.shortName}`;
        const vehicle = { id, name: `${type} ${trip.shortName}`.trim(), headsign: trip.headsign || "", headsigns: headsigns.all(trip.headsign || "") };
        vehicles.set(`${id}|${vehicle.headsign}`, vehicle);
      }
    }
    dayIndex = { key, vehicles: [...vehicles.values()] };
  }
  const wanted = normalize(query);
  const rank = vehicle => normalize(vehicle.name) === wanted ? 0 : normalize(vehicle.name).startsWith(wanted) ? 1 : 2;
  // Keep one service-day index across language switches, translating only its
  // suggestions. Searches can still match a destination in any language.
  return dayIndex.vehicles.filter(vehicle => normalize(vehicle.name).includes(wanted) || Object.values(vehicle.headsigns).some(headsign => normalize(headsign).includes(wanted)))
    .map(vehicle => ({ ...vehicle, headsign: vehicle.headsigns[language] || vehicle.headsign }))
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, undefined, { numeric: true }) || a.headsign.localeCompare(b.headsign)).slice(0, limit);
}

self.addEventListener("message", ({ data: { id, payload } }) => {
  queue = queue.then(async () => {
    try { self.postMessage({ id, type: "result", result: await search(payload) }); }
    catch (error) { self.postMessage({ id, type: "error", error: error.message }); }
  });
});
