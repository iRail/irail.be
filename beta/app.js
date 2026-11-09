import { PlannerClient, createPlannerWorker } from "@irail/planner/browser";
import { messages } from "./i18n.js";
import { belgianInstant, dateAndTime, journeyKey, serviceDayInstant, stationKey } from "./time.js";
import { dateInputToIso, isoToDateInput } from "./date-time.js";
import { bindDateTimeControls } from "./date-time-controls.js";
import { createNavigation } from "./navigation.js";
import "./styles.css";

const DATA_URL = "https://irail.github.io/iRail-cdn/manifest.jsonld";
const $ = id => document.getElementById(id);
const autocompleteClosers = [];
const autocompleteLanguageUpdates = [];
const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const attr = value => escape(JSON.stringify(value));
const storage = {
  read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ } },
};
const preferred = storage.read("irail-beta-language", navigator.language.split("-")[0]);
const state = {
  language: messages[preferred] ? preferred : "en", planner: null, source: null,
  stations: new Map(), stopIndices: new Map(), selections: {}, view: "route",
  route: null, board: null, train: null, trainSearch: null,
  routeRevision: 0, boardRevision: 0, trainRevision: 0,
  feed: null, feedError: false, checkedAt: 0, watcher: null, refreshing: false, refreshPending: false,
  recent: storage.read("irail-beta-recent", []),
};
if (!Array.isArray(state.recent)) state.recent = [];
const t = key => messages[state.language][key] ?? messages.en[key] ?? key;
const clock = milliseconds => new Intl.DateTimeFormat("nl-BE", {
  timeZone: "Europe/Brussels", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).format(new Date(milliseconds));
const day = milliseconds => isoToDateInput(dateAndTime(milliseconds).date);
const routeInstant = run => (run.query.arrivalBefore ?? run.query.departureAfter) * 1000;
const routeMode = () => new FormData($("route-form")).get("route-timesel");
const setRouteMode = value => { $("route-form").elements.namedItem("route-timesel").value = value; };
const duration = seconds => {
  const minutes = Math.max(0, Math.round(seconds / 60));
  return `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} h ` : ""}${minutes % 60} min`;
};
const loading = key => `<div class="loading-inline" role="status">${escape(t(key))}</div>`;
const alertHtml = message => `<div class="alert alert-info">${escape(message)}</div>`;
const canceled = value => value ? `<span class="canceled-tag">${escape(t("canceled"))}</span>` : "";
const platform = value => `<span class="badge" title="${escape(t(value ? "platform" : "unknownPlatform"))}">${escape(value || "—")}</span>`;
function timeHtml(scheduled, delay = 0, reference) {
  if (scheduled == null) return "—";
  const ms = Number(scheduled);
  const minutes = Math.round(delay / 60);
  const expected = ms + delay * 1000;
  const date = reference !== undefined && day(expected) !== day(reference) ? `<small class="time-date">${day(expected)}</small>` : "";
  return `${delay ? `<s class="was">${clock(ms)}</s>` : ""}<span>${clock(expected)}</span>${minutes ? `<span class="delay">${minutes > 0 ? "+" : ""}${minutes}′</span>` : ""}${date}`;
}

function translate() {
  document.documentElement.lang = state.language;
  $("language-select").value = state.language;
  document.querySelectorAll("[data-i18n]").forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-placeholder]").forEach(node => { node.placeholder = t(node.dataset.placeholder); });
  $("language-select").setAttribute("aria-label", t("language"));
  $("route-timesel").setAttribute("aria-label", t("searchBy"));
  $("route-swap").title = t("reverseRoute");
  $("route-swap").setAttribute("aria-label", t("reverseRoute"));
  for (const view of ["route", "station", "train"]) $(`${view}-view`).setAttribute("aria-label", t(view === "route" ? "navRoute" : view));
  renderLive();
  renderRecent();
}

function setFormTime(prefix, milliseconds) {
  const value = dateAndTime(milliseconds);
  $(`${prefix}-date`).value = isoToDateInput(value.date);
  if ($(`${prefix}-time`)) $(`${prefix}-time`).value = value.time;
}
function formInstant(prefix) {
  const instant = belgianInstant(dateInputToIso($(`${prefix}-date`).value), $(`${prefix}-time`).value);
  if (!instant) throw new Error(t("invalidTime"));
  return instant;
}
function showError(host, error) {
  host.innerHTML = `<div class="alert alert-danger" role="alert">${escape(error.message || error)}</div>`;
}
function setView(view, save = true) {
  if (save) navigation.remember();
  if (!["route", "station", "train"].includes(view)) view = "route";
  state.view = view;
  for (const name of ["route", "station", "train"]) $(`${name}-view`).hidden = name !== view;
  document.querySelectorAll("[data-view]").forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
  });
  if (save) updateUrl();
}
function updateUrl(mode = "push") {
  if (mode === "none") return;
  const params = new URLSearchParams({ view: state.view, lang: state.language });
  if (state.view === "route" && state.route) {
    const { from, to, query } = state.route;
    params.set("from", from.id); params.set("to", to.id);
    const local = dateAndTime(routeInstant(state.route));
    params.set("date", local.date); params.set("time", local.time);
    params.set("timesel", query.arrivalBefore !== undefined ? "arrival" : "departure");
  } else if (state.view === "station" && state.board) {
    const { query } = state.board;
    params.set("station", query.station); params.set("type", query.type);
    const local = dateAndTime(query.time);
    params.set("date", local.date); params.set("time", local.time);
  } else if (state.view === "train" && state.train) {
    params.set("train", state.train.query.id); params.set("date", dateAndTime(state.train.query.date).date);
  }
  navigation.commit(`${location.pathname}?${params}`, { replace: mode === "replace" });
}

// Keep the open list visible while new suggestions are requested, as on the
// main site. Reuse unchanged options and discard superseded responses.
function autocomplete({ id, search, choose, emptyKey = "noMatches", loadingKey = "loadingStations" }) {
  const input = $(id), menu = $(`${id}-menu`);
  let revision = 0, timer, matches = [], active = -1, nextOptionId = 0;
  const close = () => {
    revision++; clearTimeout(timer); matches = []; menu.classList.remove("is-open");
    input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); active = -1;
  };
  const open = () => {
    if (!menu.classList.contains("is-open")) menu.classList.add("is-open");
    input.setAttribute("aria-expanded", "true");
  };
  const message = key => {
    const text = t(key);
    if (menu.children.length !== 1 || menu.firstElementChild.dataset.message !== key || menu.firstElementChild.textContent !== text) {
      const node = document.createElement("div");
      node.className = "autocomplete-message"; node.dataset.message = key;
      node.setAttribute("role", "status"); node.textContent = text;
      menu.replaceChildren(node);
    }
    open();
  };
  const updateActive = () => {
    const options = [...menu.querySelectorAll("[role=option]")];
    options.forEach((option, index) => {
      option.classList.toggle("is-active", index === active);
      option.setAttribute("aria-selected", String(index === active));
    });
    if (options[active]) input.setAttribute("aria-activedescendant", options[active].id);
    else input.removeAttribute("aria-activedescendant");
  };
  const draw = () => {
    if (!matches.length) { message(emptyKey); updateActive(); return; }
    const existing = new Map([...menu.querySelectorAll("[role=option]")].map(option => [option.dataset.key, option]));
    let cursor = menu.firstChild;
    matches.forEach((match, index) => {
      const key = JSON.stringify([match.id ?? match.name, match.headsign ?? ""]);
      let option = existing.get(key);
      if (!option) {
        option = document.createElement("button");
        option.type = "button"; option.className = "autocomplete-option";
        option.setAttribute("role", "option"); option.tabIndex = -1;
        option.id = `${id}-option-${nextOptionId++}`; option.dataset.key = key;
        option.append(document.createElement("span"));
        if (match.headsign) {
          const headsign = document.createElement("small"); headsign.textContent = match.headsign; option.append(headsign);
        }
      }
      if (option.firstElementChild.textContent !== match.name) option.firstElementChild.textContent = match.name;
      option.dataset.index = index;
      if (option === cursor) cursor = cursor.nextSibling;
      else menu.insertBefore(option, cursor);
    });
    while (cursor) { const next = cursor.nextSibling; cursor.remove(); cursor = next; }
    updateActive(); open();
  };
  const select = match => { input.value = match.name; close(); choose(match); };
  const refresh = () => {
    const query = input.value.trim();
    if (!query || !state.source) { close(); return; }
    const mine = ++revision;
    clearTimeout(timer); active = -1; updateActive();
    timer = setTimeout(async () => {
      if (!menu.classList.contains("is-open")) message(loadingKey);
      try {
        const found = await search(query);
        if (mine !== revision) return;
        matches = found; active = -1; draw();
      } catch {
        if (mine === revision) { matches = []; active = -1; updateActive(); message("autocompleteFailed"); }
      }
    }, 140);
  };
  input.addEventListener("input", () => { state.selections[id] = null; refresh(); });
  input.addEventListener("focus", refresh);
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") { close(); return; }
    if (!menu.classList.contains("is-open")) return;
    if (["ArrowDown", "ArrowUp"].includes(event.key) && matches.length) {
      event.preventDefault(); active = (active + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length; updateActive();
      menu.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && active >= 0) { event.preventDefault(); select(matches[active]); }
  });
  menu.addEventListener("mousedown", event => event.preventDefault());
  menu.addEventListener("click", event => {
    const button = event.target.closest("[data-index]");
    if (button) select(matches[Number(button.dataset.index)]);
  });
  input.addEventListener("blur", close);
  autocompleteClosers.push(close);
  autocompleteLanguageUpdates.push(() => { if (document.activeElement === input) refresh(); else close(); });
  return { close, refresh };
}
function stationPicker(id) {
  return autocomplete({ id,
    search: query => state.planner.stations({ query, language: state.language, limit: 8 }),
    choose: station => {
      state.selections[id] = station;
      if (id === "station-input") searchBoard();
    },
  });
}
function trainPicker() {
  const picker = autocomplete({ id: "train-id", emptyKey: "noTrains", loadingKey: "findingTrains",
    search: query => {
      const date = dateInputToIso($("train-date").value);
      if (!date) throw new Error(t("invalidTime"));
      state.trainSearch ??= new PlannerClient(new Worker(new URL("./train-search-worker.js", import.meta.url), { type: "module" }));
      return state.trainSearch.request("trains", { dataUrl: DATA_URL, date, query, language: state.language, realtimeVersion: state.feed?.timestamp ?? 0 });
    },
    choose: train => { state.selections["train-id"] = train; searchTrain(); },
  });
  $("train-date").addEventListener("input", () => {
    picker.close();
    if (state.selections["train-id"] && $("train-form").checkValidity() && dateInputToIso($("train-date").value)) searchTrain();
  });
}
async function selectedStation(id) {
  if (state.selections[id]) return state.selections[id];
  const query = $(id).value.trim();
  const stations = await state.planner.stations({ query, language: state.language, limit: 8 });
  const exact = stations.find(station => station.name.toLocaleLowerCase() === query.toLocaleLowerCase() || station.id === query);
  if (!exact) throw new Error(t("pickStation"));
  state.selections[id] = exact;
  return exact;
}

function stationAt(stopIdx) {
  const id = state.source.stops.id[stopIdx];
  return state.stations.get(stationKey(id)) ?? { id, name: state.source.stops.name[stopIdx] || id };
}
function stationButton(station, time, type) {
  const label = state.stations.get(stationKey(station.id))?.name ?? station.name;
  return `<button class="station-link" type="button" data-station='${attr({ station: station.id, name: label, time: Number(time), type })}'>${escape(label)}</button>`;
}
function trainButton(vehicle, date, highlight) {
  return `<button class="train-link-button" type="button" data-train='${attr({ id: vehicle.id, name: vehicle.name, date: Number(date), highlight })}'>${escape(vehicle.name)}</button>`;
}
function stopRow(leg, end) {
  const board = end === "board", time = board ? leg.boardTime : leg.alightTime;
  const delay = (board ? leg.boardDelay : leg.alightDelay) || 0;
  const station = stationAt(board ? leg.boardStop : leg.alightStop);
  return `<div class="planner-row">
    <span class="planner-time">${timeHtml((time - delay) * 1000, delay)}</span>
    <span class="planner-station">${stationButton(station, time * 1000, board ? "departure" : "arrival")}</span>
    <span class="planner-platform">${platform(board ? leg.boardPlatform : leg.alightPlatform)}</span>
  </div>`;
}
function timeline(journey) {
  return journey.legs.map((leg, index) => {
    const next = journey.legs[index + 1];
    if (leg.kind === "walk") return `<div class="planner-switch">${escape(t("walk"))} · ${Math.round(leg.distanceMeters)} m · ${duration(leg.alightTime - leg.boardTime)}</div>`;
    const date = serviceDayInstant(leg.serviceDate) ?? new Date(leg.boardTime * 1000);
    const highlight = { from: stationAt(leg.boardStop).id, to: stationAt(leg.alightStop).id };
    const headsign = leg.headsigns?.[state.language] || leg.headsigns?.fr || leg.headsign;
    return `${stopRow(leg, "board")}
      <div class="planner-train">${trainButton(leg.vehicle, date, highlight)} ${headsign ? ` → ${escape(headsign)}` : ""} ${canceled(leg.canceled)}</div>
      ${stopRow(leg, "alight")}
      ${next?.kind === "ride" ? `<div class="planner-switch">${duration(next.boardTime - leg.alightTime)} · ${escape(t("transfer"))}</div>` : ""}`;
  }).join("");
}
function renderRoutes(run, openKeys) {
  if (state.route !== run || !run.result) return;
  const host = $("route-results");
  const previous = openKeys ?? new Set([...host.querySelectorAll(".result-card.is-open")].map(card => card.dataset.key));
  const drawn = openKeys ? true : run.drawn;
  run.drawn = true;
  const options = run.result.options;
  if (!options.length) { host.innerHTML = alertHtml(t("noRoutes")); return; }
  const from = state.stations.get(stationKey(run.from.id))?.name ?? run.from.name;
  const to = state.stations.get(stationKey(run.to.id))?.name ?? run.to.name;
  host.innerHTML = `<div class="result-heading"><h2>${escape(from)} → ${escape(to)}</h2><p>${escape(day(routeInstant(run)))} · ${options.length} ${escape(t("results"))}</p></div>
    <div class="route-results-layout"><div class="connections-list">${options.map((journey, index) => {
      const key = journeyKey(journey), open = drawn ? previous.has(key) : index === 0;
      const first = journey.legs.find(leg => leg.kind === "ride"), last = journey.legs.findLast(leg => leg.kind === "ride");
      const boardDelay = first?.boardDelay || 0, alightDelay = last?.alightDelay || 0;
      const departureDate = day(journey.departure * 1000), arrivalDate = day(journey.arrival * 1000);
      const dateNote = departureDate !== arrivalDate ? `${departureDate} → ${arrivalDate}` : departureDate !== day(routeInstant(run)) ? departureDate : "";
      return `<article class="result-card${open ? " is-open" : ""}${journey.canceled ? " is-canceled" : ""}" data-key="${escape(key)}">
        <button class="connection-summary" type="button" data-toggle-panel aria-expanded="${open}">
          <span><span class="connection-times">${timeHtml((journey.departure - boardDelay) * 1000, boardDelay)}<span aria-hidden="true">→</span>${timeHtml((journey.arrival - alightDelay) * 1000, alightDelay)}</span>
            <span class="connection-meta"><span>${duration(journey.arrival - journey.departure)}</span><span>${journey.transfers ? `${journey.transfers} ${escape(t(journey.transfers === 1 ? "transfer" : "transfers"))}` : escape(t("direct"))}</span>${dateNote ? `<span>${dateNote}</span>` : ""}${canceled(journey.canceled)}</span></span>
          <span class="summary-right">${platform(first?.boardPlatform)}<span class="summary-chevron" aria-hidden="true">⌄</span></span>
        </button><div class="connection-body"><div class="timeline">${timeline(journey)}</div></div>
      </article>`;
    }).join("")}</div><aside class="result-actions"><button type="button" class="secondary-button" data-route-shift="earlier">${escape(t("earlier"))}</button><button type="button" class="secondary-button" data-route-shift="later">${escape(t("later"))}</button></aside></div>`;
}

async function searchRoute({ historyMode = "push" } = {}) {
  const form = $("route-form");
  if (!state.source || !form.reportValidity()) return;
  if (historyMode !== "none") navigation.remember();
  const revision = ++state.routeRevision;
  $("route-alert").innerHTML = "";
  $("route-search").disabled = true;
  try {
    const time = formInstant("route");
    const [from, to] = await Promise.all([selectedStation("route-from"), selectedStation("route-to")]);
    if (revision !== state.routeRevision) return;
    if (from.id === to.id) throw new Error(t("sameStations"));
    const origin = state.stopIndices.get(stationKey(from.id)), destination = state.stopIndices.get(stationKey(to.id));
    if (origin === undefined || destination === undefined) throw new Error(t("pickStation"));
    const run = { from, to, query: {
      origin: { sourceId: state.source.id, stopIdx: origin }, destination: { sourceId: state.source.id, stopIdx: destination },
      ...(routeMode() === "arrival" ? { arrivalBefore: Number(time) / 1000 } : { departureAfter: Number(time) / 1000 }),
      maxWalkMeters: 0, minOptions: 6, windowMode: "full", sourceIds: [state.source.id],
    } };
    state.route = run;
    $("route-results").innerHTML = loading("searching");
    updateUrl(historyMode);
    const result = await state.planner.request("plan", { ...run.query, language: state.language });
    if (state.route !== run) return;
    run.result = result; renderRoutes(run); rememberRoute(from, to);
  } catch (error) {
    if (revision !== state.routeRevision) return;
    showError($("route-alert"), error);
    if ($("route-results").querySelector(".loading-inline")) $("route-results").innerHTML = "";
  } finally { if (revision === state.routeRevision) $("route-search").disabled = false; }
}

function boardMarkup(result, query) {
  const end = query.time + 3600000;
  return `<section class="liveboard-panel">
    <div class="detail-toolbar"><p>${escape(day(query.time))} · ${clock(query.time)}–${day(end) !== day(query.time) ? `${day(end)} ` : ""}${clock(end)}</p>
      <button type="button" class="secondary-button${query.type === "departure" ? " is-active" : ""}" data-board-type="departure" aria-pressed="${query.type === "departure"}">${escape(t("departures"))}</button>
      <button type="button" class="secondary-button${query.type === "arrival" ? " is-active" : ""}" data-board-type="arrival" aria-pressed="${query.type === "arrival"}">${escape(t("arrivals"))}</button>
    </div>
    ${result.entries.length ? `<div class="table-scroll"><table class="board-table"><thead><tr><th scope="col">${escape(t("time"))}</th><th scope="col">${escape(t(query.type === "departure" ? "direction" : "origin"))} / ${escape(t("train"))}</th><th scope="col">${escape(t("platform"))}</th></tr></thead><tbody>${result.entries.map(entry => {
      const other = entry.destination ?? entry.origin;
      return `<tr><td>${timeHtml(entry.time, entry.delay, query.time)} ${canceled(entry.canceled)}</td><td><strong>${escape(other.name)}</strong>${trainButton(entry.vehicle, entry.time)}</td><td>${platform(entry.platform)}</td></tr>`;
    }).join("")}</tbody></table></div>` : alertHtml(t("noEntries"))}
  </section>`;
}
function trainMarkup(result, query) {
  const { stops } = result;
  const from = query.highlight ? stops.findIndex(stop => stationKey(stop.station.id) === stationKey(query.highlight.from)) : -1;
  const to = query.highlight ? stops.findIndex((stop, index) => index >= from && stationKey(stop.station.id) === stationKey(query.highlight.to)) : -1;
  return `<section class="train-panel"><p class="panel-note">${escape(t("allStops"))} ${escape(day(query.date))}${from >= 0 && to >= from ? ` · <span class="journey-tag">${escape(t("journey"))}</span>` : ""}</p>
    ${stops.length ? `<div class="table-scroll"><table class="stops-table"><thead><tr><th scope="col">${escape(t("station"))}</th><th scope="col">${escape(t("arrival"))}</th><th scope="col">${escape(t("departure"))}</th><th scope="col">${escape(t("platform"))}</th></tr></thead><tbody>${stops.map((stop, index) => {
      const time = stop.departure ? Number(stop.departure) + stop.departureDelay * 1000 : Number(stop.arrival) + stop.arrivalDelay * 1000;
      return `<tr${from >= 0 && index >= from && index <= to ? ' class="on-journey"' : ""}><td>${stationButton(stop.station, time, stop.departure ? "departure" : "arrival")} ${canceled(stop.canceled)}</td><td>${timeHtml(stop.arrival, stop.arrivalDelay, query.date)}</td><td>${timeHtml(stop.departure, stop.departureDelay, query.date)}</td><td>${platform(stop.platform)}</td></tr>`;
    }).join("")}</tbody></table></div>` : alertHtml(t("noStops"))}
  </section>`;
}

async function searchBoard({ historyMode = "push" } = {}) {
  if (!state.source || !$("station-form").reportValidity()) return;
  if (historyMode !== "none") navigation.remember();
  const revision = ++state.boardRevision;
  $("station-alert").innerHTML = "";
  try {
    const time = Number(formInstant("station"));
    const station = await selectedStation("station-input");
    if (revision !== state.boardRevision) return;
    const board = { query: { station: station.id, name: station.name, time, type: $("station-type").value } };
    state.board = board; updateUrl(historyMode);
    $("station-results").innerHTML = loading("loadingBoard");
    const result = await state.planner.liveboard({ ...board.query, language: state.language });
    if (state.board !== board) return;
    board.result = result; renderBoard();
  } catch (error) {
    if (revision !== state.boardRevision) return;
    showError($("station-alert"), error); if (!state.board?.result) $("station-results").innerHTML = "";
  }
}
function renderBoard() {
  if (state.board?.result) $("station-results").innerHTML = `<div class="result-heading"><h2>${escape(state.board.result.station.name)}</h2></div>${boardMarkup(state.board.result, state.board.query)}`;
}
async function searchTrain(highlight, { historyMode = "push" } = {}) {
  if (!state.source || !$("train-form").reportValidity()) return;
  if (historyMode !== "none") navigation.remember();
  const revision = ++state.trainRevision;
  $("train-alert").innerHTML = "";
  try {
    const date = belgianInstant(dateInputToIso($("train-date").value), "12:00");
    if (!date) throw new Error(t("invalidTime"));
    const id = $("train-id").value.trim().replace(/^https?:\/\/irail.be\/vehicle\//, "").replace(/^BE\.NMBS\./, "").replace(/\s+/g, "").toUpperCase();
    state.selections["train-id"] ??= { id, name: $("train-id").value };
    const train = { query: { id, date: Number(date), highlight } };
    state.train = train; updateUrl(historyMode); $("train-results").innerHTML = loading("loadingTrain");
    const result = await state.planner.vehicle({ ...train.query, language: state.language });
    if (state.train !== train) return;
    train.result = result; renderTrain();
  } catch (error) {
    if (revision !== state.trainRevision) return;
    showError($("train-alert"), error); if (!state.train?.result) $("train-results").innerHTML = "";
  }
}
function renderTrain() {
  if (!state.train?.result) return;
  const result = state.train.result;
  $("train-results").innerHTML = `<div class="result-heading"><h2>${escape(result.vehicle.name)} · ${escape(result.stops[0]?.station.name)} → ${escape(result.stops.at(-1)?.station.name)}</h2></div>${trainMarkup(result, state.train.query)}`;
}

function openTrain(query) {
  navigation.remember();
  state.selections["train-id"] = { id: query.id, name: query.name || query.id };
  $("train-id").value = query.name || query.id;
  setFormTime("train", query.date);
  setView("train", false);
  searchTrain(query.highlight);
  document.querySelector('[data-view="train"]').focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}
function openStation(query) {
  navigation.remember();
  const station = state.stations.get(stationKey(query.station)) ?? { id: query.station, name: query.name };
  state.selections["station-input"] = station;
  $("station-input").value = station.name;
  setFormTime("station", query.time);
  $("station-type").value = query.type;
  setView("station", false);
  searchBoard();
  document.querySelector('[data-view="station"]').focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

function rememberRoute(from, to) {
  state.recent = [{ from: from.id, to: to.id }, ...state.recent.filter(route => route.from !== from.id || route.to !== to.id)].slice(0, 5);
  storage.write("irail-beta-recent", state.recent); renderRecent();
}
function renderRecent() {
  const routes = state.recent.flatMap(route => {
    const from = state.stations.get(stationKey(route.from)), to = state.stations.get(stationKey(route.to));
    return from && to ? [{ from, to }] : [];
  });
  $("recent-routes").innerHTML = routes.length ? `<div class="recent-card"><span class="recent-title">${escape(t("recent"))}</span><div class="recent-list">${routes.map(route => `<button type="button" class="ghost-button recent-route" data-recent='${attr({ from: route.from.id, to: route.to.id })}'>${escape(route.from.name)} → ${escape(route.to.name)}</button>`).join("")}</div></div>` : "";
}

function renderLive() {
  const feed = state.feed, live = $("live-status"), parts = [];
  let kind = "live";
  if (!state.source) { kind = "loading"; parts.push(t("loadingLive")); }
  else if (state.feedError) { kind = "stale"; parts.push(t("stale")); }
  else if (feed?.supported === false) { kind = "scheduled"; parts.push(t("scheduled")); }
  else if (!feed?.timestamp) { kind = "stale"; parts.push(t("stale")); }
  else {
    parts.push(`${t("live")} · ${t("feedAt")} ${clock(feed.timestamp * 1000)}`, `${feed.delayed ?? 0} ${t("delayed")}`, `${feed.canceled ?? 0} ${t("canceledTrips")}`);
    if (Date.now() - feed.timestamp * 1000 > 300000) { kind = "stale"; parts.push(t("outdated")); }
  }
  if (state.checkedAt) parts.push(`${t("checked")} ${clock(state.checkedAt)}`);
  if (state.source && feed?.supported !== false) {
    if (!$("live-toggle").checked) { if (kind === "live") kind = "paused"; parts.push(t("paused")); }
    else if (document.hidden) { if (kind === "live") kind = "paused"; parts.push(t("hidden")); }
    else parts.push(t("polling"));
  }
  live.dataset.status = kind; $("live-text").textContent = parts.join(" · ");
}
function startWatching() {
  state.watcher?.stop(); state.watcher = null;
  if (!state.source || !$("live-toggle").checked || document.hidden || state.feed?.supported === false) return;
  const watcher = state.planner.watchRealtime({ intervalMs: 30000, immediate: false });
  watcher.addEventListener("poll", event => {
    [state.feed] = event.detail; state.feedError = false; state.checkedAt = Date.now(); renderLive();
  });
  watcher.addEventListener("update", () => refreshViews());
  watcher.addEventListener("error", () => { state.feedError = true; renderLive(); });
  state.watcher = watcher;
}
async function checkNow() {
  if (!state.source) return;
  $("live-now").disabled = true;
  try {
    [state.feed] = await state.planner.refreshRealtime();
    state.checkedAt = Date.now(); state.feedError = false;
    await refreshViews();
  } catch { state.feedError = true; }
  finally { $("live-now").disabled = false; renderLive(); }
}
async function refreshViews() {
  if (state.refreshing) { state.refreshPending = true; return; }
  state.refreshing = true;
  try {
    const route = state.route, board = state.board, train = state.train;
    const jobs = [];
    if (route?.result) jobs.push((async () => {
      const result = await state.planner.request("plan", { ...route.query, language: state.language });
      if (state.route === route) { route.result = result; $("route-alert").innerHTML = ""; renderRoutes(route); }
    })().catch(() => { if (state.route === route) $("route-alert").innerHTML = alertHtml(t("refreshFailed")); }));
    if (board?.result) jobs.push((async () => {
      const result = await state.planner.liveboard({ ...board.query, language: state.language });
      if (state.board === board) { board.result = result; $("station-alert").innerHTML = ""; renderBoard(); }
    })().catch(() => { if (state.board === board) $("station-alert").innerHTML = alertHtml(t("refreshFailed")); }));
    if (train?.result) jobs.push((async () => {
      const result = await state.planner.vehicle({ ...train.query, language: state.language });
      if (state.train === train) { train.result = result; $("train-alert").innerHTML = ""; renderTrain(); }
    })().catch(() => { if (state.train === train) $("train-alert").innerHTML = alertHtml(t("refreshFailed")); }));
    await Promise.allSettled(jobs);
  } finally {
    state.refreshing = false;
    if (state.refreshPending) { state.refreshPending = false; refreshViews(); }
  }
}

document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button || !state.source) return;
  if (button.dataset.view) setView(button.dataset.view);
  if (button.hasAttribute("data-toggle-panel")) {
    const card = button.closest(".result-card"); card.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(card.classList.contains("is-open")));
  }
  if (button.dataset.station) openStation(JSON.parse(button.dataset.station));
  if (button.dataset.train) openTrain(JSON.parse(button.dataset.train));
  if (button.dataset.boardType) {
    $("station-type").value = button.dataset.boardType; searchBoard();
  }
  if (button.dataset.recent) {
    const route = JSON.parse(button.dataset.recent);
    for (const side of ["from", "to"]) {
      const station = state.stations.get(stationKey(route[side]));
      state.selections[`route-${side}`] = station; $(`route-${side}`).value = station.name;
    }
    setFormTime("route", Date.now()); searchRoute();
  }
  if (button.dataset.routeShift && state.route?.result) {
    const options = state.route.result.options;
    const instant = button.dataset.routeShift === "earlier" ? options[0].departure * 1000 - 3600000 : options.at(-1).departure * 1000 + 60000;
    setRouteMode("departure");
    setFormTime("route", instant); searchRoute();
  }
});
$("route-form").addEventListener("submit", event => { event.preventDefault(); searchRoute(); });
$("station-form").addEventListener("submit", event => { event.preventDefault(); searchBoard(); });
$("train-form").addEventListener("submit", event => { event.preventDefault(); searchTrain(); });
// Once a station is selected, changes to its board/time/date load that view too.
for (const id of ["station-type", "station-time", "station-date"]) {
  $(id).addEventListener("input", () => {
    if (state.selections["station-input"] && $("station-form").checkValidity() && dateInputToIso($("station-date").value)) searchBoard();
  });
}
for (const [id, search] of [["station-form", searchBoard], ["train-form", searchTrain]]) {
  $(id).addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.defaultPrevented && !event.isComposing && event.target.matches('input[type="text"]')) {
      event.preventDefault(); search();
    }
  });
}
$("route-swap").addEventListener("click", () => {
  const from = $("route-from").value;
  $("route-from").value = $("route-to").value; $("route-to").value = from;
  [state.selections["route-from"], state.selections["route-to"]] = [state.selections["route-to"], state.selections["route-from"]];
});
$("live-toggle").addEventListener("change", () => { startWatching(); renderLive(); if ($("live-toggle").checked) checkNow(); });
$("live-now").addEventListener("click", checkNow);
document.addEventListener("visibilitychange", () => {
  startWatching(); renderLive();
  if (!document.hidden && $("live-toggle").checked) checkNow();
});
window.addEventListener("pagehide", () => state.watcher?.stop());
window.addEventListener("pageshow", event => { if (event.persisted) { startWatching(); if ($("live-toggle").checked) checkNow(); } });

async function loadStations() {
  const language = state.language;
  const stations = await state.planner.stations({ language });
  if (state.language !== language) return;
  state.stations = new Map(stations.map(station => [stationKey(station.id), station]));
  for (const [id, station] of Object.entries(state.selections)) {
    const translated = station && state.stations.get(stationKey(station.id));
    if (translated) { state.selections[id] = translated; $(id).value = translated.name; }
  }
  renderRecent();
}
$("language-select").addEventListener("change", async event => {
  state.language = event.target.value; storage.write("irail-beta-language", state.language); translate();
  autocompleteLanguageUpdates.forEach(update => update());
  if (!state.source) return;
  try { await loadStations(); if (state.route?.result) renderRoutes(state.route); await refreshViews(); updateUrl("replace"); }
  catch (error) { showError($("planner-status"), error); $("planner-status").hidden = false; }
});

async function restoreUrl(url = new URL(location.href), { cached = false } = {}) {
  const params = url.searchParams, view = params.get("view") || "route";
  const language = params.get("lang");
  if (messages[language] && state.language !== language) {
    state.language = language; translate(); await loadStations();
    if (location.href !== url.href) return;
  }
  setView(view, false);
  const date = params.get("date"), time = params.get("time");
  if (view === "route") setRouteMode(params.get("timesel") === "arrival" ? "arrival" : "departure");
  if (belgianInstant(date, time)) setFormTime(view === "station" ? "station" : "route", Number(belgianInstant(date, time)));
  const from = state.stations.get(stationKey(params.get("from"))), to = state.stations.get(stationKey(params.get("to")));
  for (const [id, station] of [["route-from", from], ["route-to", to], ["station-input", state.stations.get(stationKey(params.get("station")))]]) {
    if (station) { state.selections[id] = station; $(id).value = station.name; }
  }
  if (view === "train" && params.get("train")) {
    $("train-id").value = cached && state.train?.result ? state.train.result.vehicle.name : params.get("train");
    state.selections["train-id"] = { id: params.get("train"), name: params.get("train") };
    if (belgianInstant(date, "12:00")) $("train-date").value = isoToDateInput(date);
    if (cached && state.train?.result) renderTrain();
    else await searchTrain(history.state?.irailBeta?.trainHighlight, { historyMode: "none" });
  } else if (view === "station" && state.selections["station-input"]) {
    $("station-type").value = params.get("type") === "arrival" ? "arrival" : "departure";
    if (cached && state.board?.result) renderBoard();
    else await searchBoard({ historyMode: "none" });
  } else if (view === "route" && from && to) {
    if (cached && state.route?.result) renderRoutes(state.route);
    else await searchRoute({ historyMode: "none" });
  }
}

function navigationSnapshot(url) {
  const values = Object.fromEntries([...document.querySelectorAll("form input[id], form select[id]")].map(input => [input.id, input.value]));
  const selections = { ...state.selections };
  const setTime = (prefix, time) => {
    const local = dateAndTime(time);
    values[`${prefix}-date`] = isoToDateInput(local.date);
    if ($(`${prefix}-time`)) values[`${prefix}-time`] = local.time;
  };
  // A changed form may already contain the next selection. Capture the query
  // that produced this entry's results so Back restores its matching inputs.
  if (state.route) {
    for (const side of ["from", "to"]) {
      const station = state.stations.get(stationKey(state.route[side].id)) ?? state.route[side];
      selections[`route-${side}`] = station; values[`route-${side}`] = station.name;
    }
    setTime("route", routeInstant(state.route));
  }
  if (state.board) {
    const query = state.board.query;
    const station = state.stations.get(stationKey(query.station)) ?? { id: query.station, name: query.name };
    selections["station-input"] = station; values["station-input"] = station.name;
    values["station-type"] = query.type; setTime("station", query.time);
  }
  if (state.train) {
    const query = state.train.query, vehicle = state.train.result?.vehicle ?? { id: query.id, name: query.id };
    selections["train-id"] = vehicle; values["train-id"] = vehicle.name; setTime("train", query.date);
  }
  return {
    view: ["route", "station", "train"].includes(url.searchParams.get("view")) ? url.searchParams.get("view") : "route",
    activeView: state.view, language: state.language, stations: state.stations,
    route: state.route, board: state.board, train: state.train, values, selections,
    timesel: state.route ? (state.route.query.arrivalBefore !== undefined ? "arrival" : "departure") : routeMode(),
    trainHighlight: state.train?.query.highlight,
    expanded: [...$("route-results").querySelectorAll(".result-card.is-open")].map(card => card.dataset.key),
    scroll: [window.scrollX, window.scrollY],
  };
}
function restorePosition(snapshot) {
  if (snapshot.expanded) {
    const expanded = new Set(snapshot.expanded);
    $("route-results").querySelectorAll(".result-card").forEach(card => {
      const open = expanded.has(card.dataset.key); card.classList.toggle("is-open", open);
      card.querySelector("[data-toggle-panel]").setAttribute("aria-expanded", String(open));
    });
  }
  window.scrollTo(...(snapshot.scroll ?? [0, 0]));
}
const navigation = createNavigation({
  capture: navigationSnapshot, restorePosition,
  async restore(snapshot, url) {
    // In-flight requests for the departing view must not replace restored data.
    state.routeRevision++; state.boardRevision++; state.trainRevision++;
    $("route-search").disabled = false;
    autocompleteClosers.forEach(close => close());
    state.route = snapshot?.route ?? null; state.board = snapshot?.board ?? null; state.train = snapshot?.train ?? null;
    for (const prefix of ["route", "station", "train"]) {
      $(`${prefix}-alert`).innerHTML = ""; $(`${prefix}-results`).innerHTML = "";
    }
    if (snapshot) {
      state.language = snapshot.language; state.stations = snapshot.stations;
      state.selections = { ...snapshot.selections };
      for (const [id, value] of Object.entries(snapshot.values)) $(id).value = value;
      setRouteMode(snapshot.timesel); translate();
      if (state.route?.result) renderRoutes(state.route, new Set(snapshot.expanded));
      renderBoard(); renderTrain();
    } else {
      state.selections = {};
      for (const id of ["route-from", "route-to", "station-input", "train-id"]) $(id).value = "";
      for (const prefix of ["route", "station", "train"]) setFormTime(prefix, Date.now());
    }
    await restoreUrl(url, { cached: Boolean(snapshot) });
  },
  onError: error => showError($(`${state.view}-alert`), error),
});

async function init() {
  const lang = new URLSearchParams(location.search).get("lang");
  if (messages[lang]) state.language = lang;
  translate();
  bindDateTimeControls();
  for (const prefix of ["route", "station", "train"]) setFormTime(prefix, Date.now());
  for (const id of ["route-from", "route-to", "station-input"]) stationPicker(id);
  trainPicker();
  try {
    state.planner = new PlannerClient(createPlannerWorker());
    const [source] = await state.planner.request("init", { dataUrl: DATA_URL });
    if (!source) throw new Error(t("loadFailed"));
    state.source = source;
    for (const idx of source.stopFamily.searchable) {
      const key = stationKey(source.stops.id[idx]);
      if (!state.stopIndices.has(key)) state.stopIndices.set(key, idx);
    }
    await loadStations();
    document.querySelectorAll("input[disabled], button[type=submit][disabled]").forEach(node => { node.disabled = false; });
    $("planner-status").hidden = true; $("live-now").disabled = false;
    try { [state.feed] = await state.planner.refreshRealtime(); state.checkedAt = Date.now(); }
    catch { state.feedError = true; }
    renderLive(); startWatching(); await restoreUrl(); navigation.start();
  } catch (error) {
    console.error(error); state.planner?.close();
    const host = $("planner-status"); host.className = "alert alert-danger";
    host.innerHTML = `${escape(t("loadFailed"))} <button type="button" class="ghost-button" id="planner-retry">${escape(t("retry"))}</button>`;
    $("planner-retry").addEventListener("click", () => location.reload());
    state.feedError = true;
    $("live-text").textContent = t("loadFailed"); $("live-status").dataset.status = "stale";
  }
}
init();
