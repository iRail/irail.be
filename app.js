const API_BASE = "https://api.irail.be";
const STATION_ID_PREFIX = "http://irail.be/stations/NMBS/";
const VEHICLE_PREFIX = "BE.NMBS.";
const BELGIUM_TIME_ZONE = "Europe/Brussels";
const LANGUAGE_STORAGE_KEY = "irail-new-language";
const RECENT_ROUTES_STORAGE_KEY = "irail-new-recent-routes";
const SUPPORTED_LANGUAGES = ["en", "nl", "fr", "de"];

const translations = {
  en: {
    navRoute: "Plan route",
    navLiveboard: "Station",
    navTrain: "Train",
    language: "Language",
    routeTitle: "Find a train",
    routeLead: "Plan Belgian train journeys directly with api.irail.be.",
    from: "From",
    to: "To",
    fromPlaceholder: "Type departure station",
    toPlaceholder: "Type destination station",
    reverseRoute: "Reverse route",
    departureAt: "Departure",
    arrivalAt: "Arrival",
    time: "Time",
    date: "Date",
    search: "Search",
    liveboardTitle: "Station",
    liveboardLead: "Check departures and station amenities.",
    station: "Station",
    stationPlaceholder: "Type station name",
    showDepartures: "Show departures",
    trainTitle: "Train overview",
    trainLead: "Follow a train across all stops.",
    train: "Train",
    showTrain: "Show train",
    recentRoutes: "Recent routes",
    reverseLast: "Reverse last route",
    earlier: "Earlier",
    later: "Later",
    earliest: "Earliest",
    latest: "Latest",
    transfers: "transfers",
    transfer: "transfer",
    mins: "mins",
    fromPlatform: "from platform",
    toPlatform: "to platform",
    walkingPart: "Walking part",
    liveboardHeading: "Liveboard station",
    liveboardDescription: "Departing trains and their possible delays.",
    stationAmenities: "Station amenities",
    stationAddress: "Address",
    noStationAmenities: "No station amenities are available in the local station data.",
    composition: "Train composition",
    compositionLead: "Carriage layout and amenities",
    compositionUnavailable: "No train composition is available for this train.",
    seats: "seats",
    standing: "standing",
    firstClass: "first class",
    secondClass: "second class",
    trainAmenities: "Amenities",
    trainLength: "Length",
    trainUnit: "Unit",
    toilets: "Toilets",
    tables: "Tables",
    powerOutlets: "Power outlets",
    heating: "Heating",
    airco: "Air conditioning",
    luggage: "Luggage section",
    prm: "Accessible section",
    priority: "Priority seats",
    bikes: "Bike section",
    quickFilter: "Quick filter",
    noFilterResults: "No departures match this filter.",
    noRoutes: "No routes were found for this search.",
    sameStations: "The departure and destination station are the same.",
    stationLookupError: "We could not translate your text to a station. Pick a suggested station and try again.",
    liveboardStationError: "Pick a suggested station to show its liveboard.",
    trainIdError: "Enter a train id such as IC1832.",
    loadingTitle: "Looking up real-time train data",
    loadingSub: "The app is requesting api.irail.be directly.",
    requestFailed: "Request failed",
    noTrainStops: "No stops were found for this train.",
    departure: "Departure",
    delay: "Delay",
    platform: "Platform",
    canceled: "canceled",
  },
  nl: {
    navRoute: "Route plannen",
    navLiveboard: "Station",
    navTrain: "Trein",
    language: "Taal",
    routeTitle: "Vind een trein",
    routeLead: "Plan Belgische treinreizen rechtstreeks met api.irail.be.",
    from: "Van",
    to: "Naar",
    fromPlaceholder: "Typ vertrekstation",
    toPlaceholder: "Typ bestemmingsstation",
    reverseRoute: "Keer route om",
    departureAt: "Vertrek",
    arrivalAt: "Aankomst",
    time: "Tijd",
    date: "Datum",
    search: "Zoeken",
    liveboardTitle: "Station",
    liveboardLead: "Bekijk vertrekken en stationsvoorzieningen.",
    station: "Station",
    stationPlaceholder: "Typ station",
    showDepartures: "Toon vertrekken",
    trainTitle: "Treinoverzicht",
    trainLead: "Volg een trein langs alle haltes.",
    train: "Trein",
    showTrain: "Toon trein",
    recentRoutes: "Recente routes",
    reverseLast: "Keer vorige route om",
    earlier: "Vroeger",
    later: "Later",
    earliest: "Vroegste",
    latest: "Laatste",
    transfers: "overstappen",
    transfer: "overstap",
    mins: "min",
    fromPlatform: "van spoor",
    toPlatform: "naar spoor",
    walkingPart: "Wandelstuk",
    liveboardHeading: "Liveboard station",
    liveboardDescription: "Vertrekkende treinen en mogelijke vertragingen.",
    stationAmenities: "Stationsvoorzieningen",
    stationAddress: "Adres",
    noStationAmenities: "Geen stationsvoorzieningen beschikbaar in de lokale stationsdata.",
    composition: "Treinsamenstelling",
    compositionLead: "Rijtuigen en voorzieningen",
    compositionUnavailable: "Geen treinsamenstelling beschikbaar voor deze trein.",
    seats: "zitplaatsen",
    standing: "staanplaatsen",
    firstClass: "eerste klas",
    secondClass: "tweede klas",
    trainAmenities: "Voorzieningen",
    trainLength: "Lengte",
    trainUnit: "Stel",
    toilets: "Toiletten",
    tables: "Tafels",
    powerOutlets: "Stopcontacten",
    heating: "Verwarming",
    airco: "Airco",
    luggage: "Bagageruimte",
    prm: "Toegankelijk deel",
    priority: "Voorrangsplaatsen",
    bikes: "Fietsruimte",
    quickFilter: "Snel filteren",
    noFilterResults: "Geen vertrekken gevonden voor deze filter.",
    noRoutes: "Er werden geen routes gevonden.",
    sameStations: "Vertrek- en bestemmingsstation zijn hetzelfde.",
    stationLookupError: "We konden je tekst niet omzetten naar een station. Kies een voorgesteld station en probeer opnieuw.",
    liveboardStationError: "Kies een voorgesteld station om het liveboard te tonen.",
    trainIdError: "Vul een treinnummer in, bijvoorbeeld IC1832.",
    loadingTitle: "Realtime treindata opvragen",
    loadingSub: "De app vraagt api.irail.be rechtstreeks op.",
    requestFailed: "Aanvraag mislukt",
    noTrainStops: "Er werden geen haltes gevonden voor deze trein.",
    departure: "Vertrek",
    delay: "Vertraging",
    platform: "Spoor",
    canceled: "afgeschaft",
  },
  fr: {
    navRoute: "Planifier",
    navLiveboard: "Gare",
    navTrain: "Train",
    language: "Langue",
    routeTitle: "Trouver un train",
    routeLead: "Planifiez vos voyages en train directement avec api.irail.be.",
    from: "De",
    to: "Vers",
    fromPlaceholder: "Tapez la gare de depart",
    toPlaceholder: "Tapez la gare de destination",
    reverseRoute: "Inverser le trajet",
    departureAt: "Depart",
    arrivalAt: "Arrivee",
    time: "Heure",
    date: "Date",
    search: "Rechercher",
    liveboardTitle: "Gare",
    liveboardLead: "Consultez les departs et equipements de la gare.",
    station: "Gare",
    stationPlaceholder: "Tapez une gare",
    showDepartures: "Afficher les departs",
    trainTitle: "Apercu du train",
    trainLead: "Suivez un train a travers tous ses arrets.",
    train: "Train",
    showTrain: "Afficher le train",
    recentRoutes: "Trajets recents",
    reverseLast: "Inverser le dernier trajet",
    earlier: "Plus tot",
    later: "Plus tard",
    earliest: "Premier",
    latest: "Dernier",
    transfers: "correspondances",
    transfer: "correspondance",
    mins: "min",
    fromPlatform: "du quai",
    toPlatform: "au quai",
    walkingPart: "Partie a pied",
    liveboardHeading: "Liveboard gare",
    liveboardDescription: "Trains au depart et retards eventuels.",
    stationAmenities: "Equipements de gare",
    stationAddress: "Adresse",
    noStationAmenities: "Aucun equipement disponible dans les donnees locales des gares.",
    composition: "Composition du train",
    compositionLead: "Voitures et equipements",
    compositionUnavailable: "Aucune composition disponible pour ce train.",
    seats: "places",
    standing: "debout",
    firstClass: "premiere classe",
    secondClass: "deuxieme classe",
    trainAmenities: "Equipements",
    trainLength: "Longueur",
    trainUnit: "Unite",
    toilets: "Toilettes",
    tables: "Tables",
    powerOutlets: "Prises",
    heating: "Chauffage",
    airco: "Climatisation",
    luggage: "Espace bagages",
    prm: "Espace accessible",
    priority: "Places prioritaires",
    bikes: "Espace velo",
    quickFilter: "Filtrer",
    noFilterResults: "Aucun depart ne correspond a ce filtre.",
    noRoutes: "Aucun trajet n'a ete trouve.",
    sameStations: "La gare de depart et la gare d'arrivee sont identiques.",
    stationLookupError: "Nous n'avons pas pu convertir ce texte en gare. Choisissez une suggestion et reessayez.",
    liveboardStationError: "Choisissez une gare suggeree pour afficher son liveboard.",
    trainIdError: "Saisissez un numero de train comme IC1832.",
    loadingTitle: "Recherche des donnees en temps reel",
    loadingSub: "L'application interroge directement api.irail.be.",
    requestFailed: "La requete a echoue",
    noTrainStops: "Aucun arret n'a ete trouve pour ce train.",
    departure: "Depart",
    delay: "Retard",
    platform: "Quai",
    canceled: "supprime",
  },
  de: {
    navRoute: "Route planen",
    navLiveboard: "Bahnhof",
    navTrain: "Zug",
    language: "Sprache",
    routeTitle: "Zug finden",
    routeLead: "Planen Sie Zugreisen direkt mit api.irail.be.",
    from: "Von",
    to: "Nach",
    fromPlaceholder: "Abfahrtsbahnhof eingeben",
    toPlaceholder: "Zielbahnhof eingeben",
    reverseRoute: "Route umkehren",
    departureAt: "Abfahrt",
    arrivalAt: "Ankunft",
    time: "Zeit",
    date: "Datum",
    search: "Suchen",
    liveboardTitle: "Bahnhof",
    liveboardLead: "Abfahrten und Bahnhofsausstattung anzeigen.",
    station: "Bahnhof",
    stationPlaceholder: "Bahnhof eingeben",
    showDepartures: "Abfahrten anzeigen",
    trainTitle: "Zugubersicht",
    trainLead: "Folgen Sie einem Zug uber alle Halte.",
    train: "Zug",
    showTrain: "Zug anzeigen",
    recentRoutes: "Letzte Routen",
    reverseLast: "Letzte Route umkehren",
    earlier: "Fruher",
    later: "Spater",
    earliest: "Erste",
    latest: "Letzte",
    transfers: "Umstiege",
    transfer: "Umstieg",
    mins: "Min.",
    fromPlatform: "von Gleis",
    toPlatform: "nach Gleis",
    walkingPart: "Fussweg",
    liveboardHeading: "Liveboard Bahnhof",
    liveboardDescription: "Abfahrende Zuge und mogliche Verspatungen.",
    stationAmenities: "Bahnhofsausstattung",
    stationAddress: "Adresse",
    noStationAmenities: "Keine Bahnhofsausstattung in den lokalen Stationsdaten verfugbar.",
    composition: "Zugzusammenstellung",
    compositionLead: "Wagen und Ausstattung",
    compositionUnavailable: "Keine Zugzusammenstellung fur diesen Zug verfugbar.",
    seats: "Sitzplatze",
    standing: "Stehplatze",
    firstClass: "erste Klasse",
    secondClass: "zweite Klasse",
    trainAmenities: "Ausstattung",
    trainLength: "Lange",
    trainUnit: "Einheit",
    toilets: "Toiletten",
    tables: "Tische",
    powerOutlets: "Steckdosen",
    heating: "Heizung",
    airco: "Klimaanlage",
    luggage: "Gepackbereich",
    prm: "Barrierefreier Bereich",
    priority: "Vorrangplatze",
    bikes: "Fahrradbereich",
    quickFilter: "Schnell filtern",
    noFilterResults: "Keine Abfahrten passen zu diesem Filter.",
    noRoutes: "Es wurden keine Routen gefunden.",
    sameStations: "Abfahrts- und Zielbahnhof sind gleich.",
    stationLookupError: "Der Text konnte keinem Bahnhof zugeordnet werden. Wahlen Sie einen Vorschlag und versuchen Sie es erneut.",
    liveboardStationError: "Wahlen Sie einen vorgeschlagenen Bahnhof, um das Liveboard anzuzeigen.",
    trainIdError: "Geben Sie eine Zugnummer wie IC1832 ein.",
    loadingTitle: "Echtzeitdaten werden geladen",
    loadingSub: "Die App fragt api.irail.be direkt ab.",
    requestFailed: "Anfrage fehlgeschlagen",
    noTrainStops: "Fur diesen Zug wurden keine Halte gefunden.",
    departure: "Abfahrt",
    delay: "Verspatung",
    platform: "Gleis",
    canceled: "ausfall",
  },
};

const state = {
  stations: [],
  routeFrom: null,
  routeTo: null,
  liveboardStation: null,
  locale: resolveInitialLocale(),
  recentRoutes: [],
  currentConnections: [],
};

const els = {
  views: [...document.querySelectorAll("[data-view]")],
  viewButtons: [...document.querySelectorAll("[data-view-button]")],
  routeForm: document.querySelector("#route-form"),
  routeFrom: document.querySelector("#route-from"),
  routeTo: document.querySelector("#route-to"),
  routeTime: document.querySelector("#route-time"),
  routeDate: document.querySelector("#route-date"),
  routeSwap: document.querySelector("#route-swap"),
  recentRoutes: document.querySelector("#recent-routes"),
  routeAlert: document.querySelector("#route-alert"),
  routeResults: document.querySelector("#route-results"),
  liveboardForm: document.querySelector("#liveboard-form"),
  liveboardStation: document.querySelector("#liveboard-station"),
  liveboardTime: document.querySelector("#liveboard-time"),
  liveboardAlert: document.querySelector("#liveboard-alert"),
  liveboardResults: document.querySelector("#liveboard-results"),
  trainForm: document.querySelector("#train-form"),
  trainId: document.querySelector("#train-id"),
  trainDate: document.querySelector("#train-date"),
  trainAlert: document.querySelector("#train-alert"),
  trainResults: document.querySelector("#train-results"),
  languageSelect: document.querySelector("#language-select"),
};

init();

async function init() {
  state.recentRoutes = loadRecentRoutes();
  document.documentElement.lang = state.locale;
  els.languageSelect.value = state.locale;
  setDefaultDateTimes();
  applyTranslations();
  bindNavigation();
  bindForms();
  bindLanguagePicker();
  bindStationAutocomplete(els.routeFrom, "route-from", station => {
    state.routeFrom = station;
  });
  bindStationAutocomplete(els.routeTo, "route-to", station => {
    state.routeTo = station;
  });
  bindStationAutocomplete(els.liveboardStation, "liveboard-station", station => {
    state.liveboardStation = station;
  });

  try {
    const data = await fetchJson("./stations.json");
    state.stations = data["@graph"] || [];
    restoreFromUrl();
    renderRecentRoutes();
  } catch (error) {
    showAlert(els.routeAlert, "danger", t("requestFailed"));
  }
}

function setDefaultDateTimes() {
  const now = new Date();
  const localDate = toDateInputValue(now);
  const localTime = toTimeInputValue(now);
  els.routeDate.value = localDate;
  els.routeTime.value = localTime;
  els.liveboardTime.value = localTime;
  els.trainDate.value = localDate;
}

function bindNavigation() {
  els.viewButtons.forEach(button => {
    button.addEventListener("click", () => setView(button.dataset.viewButton));
  });
}

function bindLanguagePicker() {
  els.languageSelect.addEventListener("change", () => {
    const locale = normalizeLocale(els.languageSelect.value);
    state.locale = locale;
    document.documentElement.lang = locale;
    writeStorage(LANGUAGE_STORAGE_KEY, locale);
    applyTranslations();
    refreshStationInputs();
    renderRecentRoutes();
    rerenderCurrentResults();
  });
}

function bindForms() {
  els.routeForm.addEventListener("submit", event => {
    event.preventDefault();
    searchRoute();
  });

  els.liveboardForm.addEventListener("submit", event => {
    event.preventDefault();
    searchLiveboard();
  });

  els.trainForm.addEventListener("submit", event => {
    event.preventDefault();
    searchTrain();
  });

  els.routeSwap.addEventListener("click", () => {
    swapRouteStations(true);
  });

  els.liveboardResults.addEventListener("input", event => {
    if (event.target.matches("#liveboard-filter")) {
      renderLiveboardList(window.currentLiveboardDepartures || [], event.target.value);
    }
  });
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(node => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(node => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach(node => {
    node.title = t(node.dataset.i18nTitle);
    node.setAttribute("aria-label", t(node.dataset.i18nTitle));
  });
}

function t(key) {
  return (translations[state.locale] && translations[state.locale][key]) || translations.en[key] || key;
}

function setView(name, updateUrl = true) {
  els.views.forEach(view => view.classList.toggle("hidden", view.dataset.view !== name));
  els.viewButtons.forEach(button => {
    button.classList.toggle("is-active", button.dataset.viewButton === name);
  });

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("view", name);
    history.replaceState(null, "", url);
  }
}

function bindStationAutocomplete(input, menuKey, onSelect) {
  const menu = document.querySelector(`[data-autocomplete-menu="${menuKey}"]`);
  let matches = [];
  let activeIndex = -1;

  input.addEventListener("input", () => {
    onSelect(null);
    matches = findStations(input.value);
    activeIndex = -1;
    renderAutocompleteMenu(menu, matches, activeIndex);
  });

  input.addEventListener("focus", () => {
    matches = findStations(input.value);
    renderAutocompleteMenu(menu, matches, activeIndex);
  });

  input.addEventListener("keydown", event => {
    if (!menu.classList.contains("is-open")) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, matches.length - 1);
      renderAutocompleteMenu(menu, matches, activeIndex);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderAutocompleteMenu(menu, matches, activeIndex);
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      chooseStation(matches[activeIndex]);
    }

    if (event.key === "Escape") {
      closeAutocomplete(menu);
    }
  });

  menu.addEventListener("mousedown", event => {
    const option = event.target.closest("[data-station-index]");
    if (!option) {
      return;
    }
    event.preventDefault();
    chooseStation(matches[Number(option.dataset.stationIndex)]);
  });

  input.addEventListener("blur", () => {
    window.setTimeout(() => closeAutocomplete(menu), 120);
  });

  function chooseStation(station) {
    if (!station) {
      return;
    }
    onSelect(station);
    input.value = stationDisplayName(station);
    closeAutocomplete(menu);
  }
}

function renderAutocompleteMenu(menu, matches, activeIndex) {
  if (!matches.length) {
    closeAutocomplete(menu);
    return;
  }

  menu.innerHTML = matches.map((station, index) => {
    const display = escapeHtml(stationDisplayName(station));
    return `<button class="autocomplete-option ${index === activeIndex ? "is-active" : ""}" type="button" data-station-index="${index}">${display}</button>`;
  }).join("");
  menu.classList.add("is-open");
}

function closeAutocomplete(menu) {
  menu.classList.remove("is-open");
}

function findStations(query) {
  const queryInfo = stationQueryInfo(query);
  if (!queryInfo) {
    return [];
  }

  const results = [];
  for (const station of state.stations) {
    const names = stationSearchNames(station);
    const rank = stationMatchRank(queryInfo.regex, names);

    if (rank !== null) {
      results.push({ station, rank });
    }
  }

  return results
    .sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      return stationFrequency(b.station) - stationFrequency(a.station);
    })
    .map(result => result.station)
    .slice(0, 6);
}

function stationQueryInfo(query) {
  let normalized = query || "";
  normalized = normalized.replace(/Brussel Nat.+/i, "Brussels Airport");
  normalized = normalized.replace(/Brussels Airport ?-? ?Z?a?v?e?n?t?e?m?/i, "Brussels Airport");
  normalized = normalized.replace(/- /g, "-");
  normalized = normalized.replace(/l alleud/ig, "l'alleud");
  normalized = normalized.replace(/ Cdg /ig, " Charles de Gaulle ");
  normalized = normalized.replace(/ am /ig, " ");
  normalized = normalized.replace(/frankfurt fl/ig, "frankfurt main fl");
  normalized = normalized.replace(/Bru\./ig, "Brussel");
  normalized = normalized.replace(/Brux\./ig, "Bruxelles");
  normalized = normalized.replace(/Maastricht Randwijck/ig, "Maastricht Randwyck");
  normalized = normalized.replace(/\s?\(.*?\)/ig, "");
  normalized = normalized.replace(/st\.-/ig, "st ");
  normalized = normalized.replace(/st-/ig, "st ");
  normalized = normalized.replace(/st(\s|$|\.)/ig, "__SAINT__ ");
  normalized = normalized.split("/")[0].trim();
  normalized = normalizeStationText(normalized).replace(/([- ])+/g, " ").trim();

  if (!normalized) {
    return null;
  }

  const source = escapeRegExp(normalized).replace(/__SAINT__/g, "(saint|st|sint)");
  try {
    return { regex: new RegExp(source, "i") };
  } catch {
    return null;
  }
}

function stationSearchNames(station) {
  return stationNameVariants(station).map(name => {
    const normalized = normalizeStationText(name.replace(/ am /ig, " ")).replace(/(-| )+/g, " ");
    return { original: name, normalized };
  });
}

function stationNameVariants(station) {
  const alternatives = Array.isArray(station.alternative)
    ? station.alternative
    : station.alternative ? [station.alternative] : [];
  return [station.name, ...alternatives.map(item => item["@value"])].filter(Boolean);
}

function stationMatchRank(regex, names) {
  if (names.some(name => isExactStationMatch(regex, name))) {
    return 0;
  }
  if (names.some(name => isWordPrefixStationMatch(regex, name))) {
    return 1;
  }
  if (names.some(name => isPrefixStationMatch(regex, name))) {
    return 2;
  }
  if (names.some(name => isPartialStationMatch(regex, name))) {
    return 3;
  }
  return null;
}

function isPartialStationMatch(regex, name) {
  return stationNameForms(name).some(value => regex.test(value));
}

function isExactStationMatch(regex, name) {
  const exact = new RegExp(`^${regex.source}$`, "i");
  return stationNameForms(name).some(value => exact.test(value));
}

function isWordPrefixStationMatch(regex, name) {
  const prefix = new RegExp(`^${regex.source}(?:\\b|\\s)`, "i");
  return stationNameForms(name).some(value => prefix.test(value));
}

function isPrefixStationMatch(regex, name) {
  const prefix = new RegExp(`^${regex.source}`, "i");
  return stationNameForms(name).some(value => prefix.test(value));
}

function stationNameForms(name) {
  return [name.normalized, name.normalized.replace(/'/g, " ")];
}

function stationFrequency(station) {
  return Number(station.avgStopTime || station.avgStopTimes || 0);
}

function normalizeStationText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function searchRoute() {
  const from = state.routeFrom || stationFromInput(els.routeFrom.value);
  const to = state.routeTo || stationFromInput(els.routeTo.value);

  clearRouteResults();
  if (!from || !to) {
    showAlert(els.routeAlert, "danger", t("stationLookupError"));
    return;
  }
  if (from["@id"] === to["@id"]) {
    showAlert(els.routeAlert, "info", t("sameStations"));
    return;
  }

  state.routeFrom = from;
  state.routeTo = to;
  els.routeFrom.value = stationDisplayName(from);
  els.routeTo.value = stationDisplayName(to);
  setLoading(els.routeResults);

  const timesel = new FormData(els.routeForm).get("route-timesel") || "departure";
  const params = new URLSearchParams({
    from: stationApiId(from),
    to: stationApiId(to),
    date: toApiDate(els.routeDate.value),
    time: toApiTime(els.routeTime.value),
    timesel,
    format: "json",
    lang: state.locale,
    typeOfTransport: "automatic",
  });

  updateUrl({
    view: "route",
    from: from["@id"],
    to: to["@id"],
    date: els.routeDate.value,
    time: els.routeTime.value,
    timesel,
  });

  try {
    const data = await fetchJson(`${API_BASE}/connections/?${params}`);
    const connections = asArray(data.connection);
    state.currentConnections = connections;
    rememberRoute(from, to);
    renderRouteResults(connections);
  } catch (error) {
    showAlert(els.routeAlert, "danger", error.message || t("requestFailed"));
    els.routeResults.innerHTML = "";
  }
}

function renderRouteResults(connections) {
  els.routeResults.innerHTML = "";

  if (!connections.length) {
    showAlert(els.routeAlert, "info", t("noRoutes"));
    return;
  }

  const panels = connections.map((connection, index) => routeConnectionPanel(connection, index)).join("");
  els.routeResults.innerHTML = `
    <div class="route-results-layout">
      <div class="connections-list">${panels}</div>
      <aside class="result-actions">
        <button class="secondary-button" type="button" data-route-earlier>${escapeHtml(t("earlier"))}</button>
        <button class="secondary-button" type="button" data-route-later>${escapeHtml(t("later"))}</button>
        <button class="secondary-button" type="button" data-route-edge="earliest">${escapeHtml(t("earliest"))}</button>
        <button class="secondary-button" type="button" data-route-edge="latest">${escapeHtml(t("latest"))}</button>
      </aside>
    </div>
  `;

  els.routeResults.querySelectorAll("[data-toggle-panel]").forEach(button => {
    button.addEventListener("click", () => {
      button.closest(".result-card").classList.toggle("is-open");
    });
  });
  els.routeResults.querySelectorAll("[data-train-id]").forEach(button => {
    button.addEventListener("click", () => openTrain(button.dataset.trainId, button.dataset.trainDate));
  });
  const earlierButton = els.routeResults.querySelector("[data-route-earlier]");
  const laterButton = els.routeResults.querySelector("[data-route-later]");
  earlierButton.addEventListener("click", () => searchFromFirstVisibleDeparture(-60));
  laterButton.addEventListener("click", () => searchFromLastVisibleDeparture());
  els.routeResults.querySelectorAll("[data-route-edge]").forEach(button => {
    button.addEventListener("click", () => setRouteEdge(button.dataset.routeEdge));
  });
}

function routeConnectionPanel(connection, index) {
  const departure = connection.departure || {};
  const arrival = connection.arrival || {};
  const vias = asArray(connection.vias && connection.vias.via);
  const duration = Number(connection.duration || (arrival.time - departure.time) || 0);
  const isDelayed = Number(departure.delay || 0) > 0 || Number(departure.canceled || 0) > 0 || Number(arrival.canceled || 0) > 0;
  const occupancy = occupancyName(departure.occupancy || connection.occupancy);

  return `
    <article class="result-card ${index === 0 ? "is-open" : ""}">
      <button class="connection-summary" type="button" data-toggle-panel>
        <span>
          <span class="connection-times">
            ${isDelayed ? `<span class="delay-route">!</span>` : ""}
            <span>${formatEpochTime(departure.time)}</span>
            <span>-&gt;</span>
            <span>${formatEpochTime(arrival.time)}</span>
          </span>
          <span class="connection-meta">
            <span>${escapeHtml(formatDuration(duration))}</span>
            ${vias.length ? `<span>${vias.length} ${escapeHtml(vias.length === 1 ? t("transfer") : t("transfers"))}</span>` : ""}
          </span>
        </span>
        <span class="summary-right">
          <img src="../images/occupancy-${escapeAttribute(occupancy)}.svg" alt="${escapeAttribute(occupancy)} occupancy" height="18" width="18">
          <span class="badge">${escapeHtml(platformName(departure.platform))}</span>
        </span>
      </button>
      <div class="connection-body">
        <div class="timeline">
          ${routeStopRow(departure, departure.station, true)}
        ${trainLine(departure)}
        ${vias.map(via => routeViaBlock(via)).join("")}
        ${routeStopRow(arrival, arrival.station, false)}
        </div>
      </div>
    </article>
  `;
}

function routeViaBlock(via) {
  const transferSeconds = Math.max(0, Number((via.departure && via.departure.time) || 0) - Number((via.arrival && via.arrival.time) || 0));
  return `
    ${routeStopRow(via.arrival || {}, via.station, false)}
    <span class="planner-switch">
      ${escapeHtml(formatTransferDuration(transferSeconds))}
      <br>${escapeHtml(t("fromPlatform"))} ${escapeHtml(platformName(via.arrival && via.arrival.platform))}
      ${escapeHtml(t("toPlatform"))} ${escapeHtml(platformName(via.departure && via.departure.platform))}
    </span>
    ${routeStopRow(via.departure || {}, via.station, true)}
    ${trainLine(via.departure || {})}
  `;
}

function routeStopRow(stop, station, includeDelay) {
  return `
    <div class="planner-row">
      <span class="planner-time"><b>${formatEpochTime(stop.time)}</b></span>
      <span class="planner-station">
        <b>${escapeHtml(station || "")}</b>
        ${includeDelay ? delayLabel(stop.delay, stop.canceled) : ""}
      </span>
      <span class="planner-platform"><span class="badge">${escapeHtml(platformName(stop.platform))}</span></span>
    </div>
  `;
}

function trainLine(stop) {
  if (Number(stop.walking || 0) === 1) {
    return `<span class="planner-train">${escapeHtml(t("walkingPart"))}</span>`;
  }

  const vehicle = vehicleShortName(stop.vehicle);
  const date = toApiDateFromEpoch(stop.time);
  return `
    <span class="planner-train">
      ${escapeHtml((stop.direction && stop.direction.name) || "")}
      ${vehicle ? `<span class="small">- <button type="button" data-train-id="${escapeAttribute(vehicle)}" data-train-date="${escapeAttribute(date)}">${escapeHtml(vehicle)}</button></span>` : ""}
      <img src="../images/occupancy-${escapeAttribute(occupancyName(stop.occupancy))}.svg" alt="" height="16" width="16">
    </span>
  `;
}

async function searchLiveboard() {
  const station = state.liveboardStation || stationFromInput(els.liveboardStation.value);
  els.liveboardAlert.innerHTML = "";
  els.liveboardResults.innerHTML = "";

  if (!station) {
    showAlert(els.liveboardAlert, "danger", t("liveboardStationError"));
    return;
  }

  state.liveboardStation = station;
  els.liveboardStation.value = stationDisplayName(station);
  setLoading(els.liveboardResults);

  const params = new URLSearchParams({
    id: stationApiId(station),
    date: toApiDate(els.routeDate.value),
    time: toApiTime(els.liveboardTime.value),
    arrdep: "departure",
    lang: state.locale,
    format: "json",
    alerts: "false",
  });

  updateUrl({
    view: "liveboard",
    station: station["@id"],
    time: els.liveboardTime.value,
  });

  try {
    const data = await fetchJson(`${API_BASE}/liveboard/?${params}`);
    const departures = asArray(data.departures && data.departures.departure);
    window.currentLiveboardDepartures = departures;
    renderLiveboard(station, departures);
  } catch (error) {
    showAlert(els.liveboardAlert, "danger", error.message || t("requestFailed"));
    els.liveboardResults.innerHTML = "";
  }
}

function renderLiveboard(station, departures) {
  els.liveboardResults.innerHTML = `
    <section class="liveboard-panel">
      <h2 class="section-heading">${escapeHtml(t("liveboardHeading"))} <strong>${escapeHtml(stationDisplayName(station))}</strong></h2>
      <p class="small">${escapeHtml(t("liveboardDescription"))}</p>
      ${renderStationAmenities(station)}
      <input id="liveboard-filter" class="quick-filter" placeholder="${escapeAttribute(t("quickFilter"))}">
      <div class="list-group" id="liveboard-list"></div>
    </section>
  `;
  renderLiveboardList(departures, "");
}

function renderStationAmenities(station) {
  const facilities = station.facilities || {};
  const address = stationAddress(facilities);
  const amenities = stationAmenityLabels(facilities);

  if (!address && !amenities.length) {
    return `
      <section class="station-amenities">
        <h3>${escapeHtml(t("stationAmenities"))}</h3>
        <p class="small">${escapeHtml(t("noStationAmenities"))}</p>
      </section>
    `;
  }

  return `
    <section class="station-amenities">
      <h3>${escapeHtml(t("stationAmenities"))}</h3>
      ${address ? `<p class="small"><strong>${escapeHtml(t("stationAddress"))}</strong>: ${escapeHtml(address)}</p>` : ""}
      <div class="amenity-chips">
        ${amenities.map(label => `<span>${escapeHtml(label)}</span>`).join("")}
      </div>
      ${renderSalesHours(facilities)}
    </section>
  `;
}

function stationAmenityLabels(facilities) {
  const amenityMap = [
    ["ticket_vending_machine", "Ticket machine"],
    ["luggage_lockers", "Lockers"],
    ["free_parking", "Free parking"],
    ["taxi", "Taxi"],
    ["bicycle_spots", "Bike parking"],
    ["blue-bike", "Blue-bike"],
    ["bus", "Bus"],
    ["tram", "Tram"],
    ["metro", "Metro"],
    ["wheelchair_available", "Wheelchairs"],
    ["ramp", "Boarding ramp"],
    ["elevated_platform", "Raised platform"],
    ["escalator_up", "Escalator up"],
    ["escalator_down", "Escalator down"],
    ["elevator_platform", "Platform elevator"],
    ["audio_induction_loop", "Audio induction loop"],
  ];
  const labels = amenityMap.filter(([key]) => isTruthyFlag(facilities[key])).map(([, label]) => label);
  const disabledParking = numericValue(facilities.disabled_parking_spots);
  if (disabledParking) {
    labels.push(`${disabledParking} disabled parking`);
  }
  return labels;
}

function stationAddress(facilities) {
  return [facilities.street, facilities.zip, facilities.city].filter(Boolean).join(", ");
}

function renderSalesHours(facilities) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const rows = days.map(day => {
    const open = facilities[`sales_open_${day}`];
    const close = facilities[`sales_close_${day}`];
    return open && close ? `<span>${escapeHtml(day.slice(0, 3))}: ${escapeHtml(open)}-${escapeHtml(close)}</span>` : "";
  }).filter(Boolean);

  return rows.length ? `<div class="sales-hours">${rows.join("")}</div>` : "";
}

function renderLiveboardList(departures, filter) {
  const list = document.querySelector("#liveboard-list");
  if (!list) {
    return;
  }
  const query = filter.trim().toLowerCase();
  const filtered = departures.filter(dep => {
    return !query || [dep.station, dep.vehicle, dep.platform].join(" ").toLowerCase().includes(query);
  });

  if (!filtered.length) {
    list.innerHTML = `<div class="alert alert-info">${escapeHtml(t("noFilterResults"))}</div>`;
    return;
  }

  list.innerHTML = filtered.map(dep => {
    const vehicle = vehicleShortName(dep.vehicle);
    const date = toApiDateFromEpoch(dep.time);
    return `
      <button class="liveboard-item" type="button" data-train-id="${escapeAttribute(vehicle)}" data-train-date="${escapeAttribute(date)}">
        <span class="text-tabular">${formatEpochTime(dep.time)}</span>
        <span><strong>${escapeHtml(dep.station || "")}</strong> <span class="small">${escapeHtml(vehicle)}</span></span>
        <span class="badge">${escapeHtml(platformName(dep.platform))}</span>
        <span>${delayLabel(dep.delay, dep.canceled)}</span>
      </button>
    `;
  }).join("");

  list.querySelectorAll("[data-train-id]").forEach(button => {
    button.addEventListener("click", () => openTrain(button.dataset.trainId, button.dataset.trainDate));
  });
}

async function searchTrain() {
  const id = normalizeVehicleId(els.trainId.value);
  const date = toApiDate(els.trainDate.value);
  els.trainAlert.innerHTML = "";
  els.trainResults.innerHTML = "";

  if (!id) {
    showAlert(els.trainAlert, "danger", t("trainIdError"));
    return;
  }

  els.trainId.value = id;
  setLoading(els.trainResults);
  updateUrl({ view: "train", train: id, date: els.trainDate.value });

  const params = new URLSearchParams({
    id,
    date,
    format: "json",
    lang: state.locale,
    alerts: "false",
  });

  try {
    const [vehicleData, compositionData] = await Promise.all([
      fetchJson(`${API_BASE}/vehicle/?${params}`),
      fetchComposition(id),
    ]);
    renderTrain(vehicleData, compositionData);
  } catch (error) {
    showAlert(els.trainAlert, "danger", error.message || t("requestFailed"));
    els.trainResults.innerHTML = "";
  }
}

async function fetchComposition(vehicleId) {
  const params = new URLSearchParams({
    id: compositionVehicleId(vehicleId),
    format: "json",
    data: "all",
    lang: state.locale,
  });

  try {
    return await fetchJson(`${API_BASE}/composition/?${params}`);
  } catch {
    return null;
  }
}

function renderTrain(data, compositionData = null) {
  const stops = asArray(data.stops && data.stops.stop);
  const trainName = vehicleShortName(data.vehicle || (data.vehicleinfo && data.vehicleinfo.name));
  const first = stops[0];
  const last = stops[stops.length - 1];

  if (!stops.length) {
    showAlert(els.trainAlert, "info", t("noTrainStops"));
    return;
  }

  els.trainResults.innerHTML = `
    <section class="train-panel">
      <h2 class="section-heading">${escapeHtml(trainName)}: ${escapeHtml(first.station)} - ${escapeHtml(last.station)}</h2>
      <div class="train-table">
        <div class="train-row train-header">
          <span></span>
          <span>${escapeHtml(t("departure"))}</span>
          <span>${escapeHtml(t("delay"))}</span>
          <span>${escapeHtml(t("platform"))}</span>
          <span>${escapeHtml(t("station"))}</span>
        </div>
        ${stops.map((stop, index) => trainStopRow(stop, stops[index + 1])).join("")}
      </div>
      ${renderComposition(compositionData)}
    </section>
  `;
}

function trainStopRow(stop, nextStop) {
  const isTrainHere = nextStop && Number(stop.left || 0) === 1 && Number(nextStop.left || 0) === 0;
  return `
    <div class="train-row">
      <span>${isTrainHere ? `<img src="../images/train.svg" alt="Current train position" height="16" width="16">` : ""}</span>
      <span class="text-tabular">${formatEpochTime(stop.time || stop.scheduledDepartureTime)}</span>
      <span>${delayLabel(stop.delay || stop.departureDelay, stop.canceled || stop.departureCanceled)}</span>
      <span><span class="badge">${escapeHtml(platformName(stop.platform))}</span></span>
      <span>${escapeHtml(stop.station || "")}</span>
    </div>
  `;
}

function renderComposition(data) {
  const segments = compositionSegments(data);
  if (!segments.length) {
    return `
      <section class="composition-panel">
        <div class="composition-heading">
          <h3>${escapeHtml(t("composition"))}</h3>
          <p class="small">${escapeHtml(t("compositionUnavailable"))}</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="composition-panel">
      <div class="composition-heading">
        <h3>${escapeHtml(t("composition"))}</h3>
        <p class="small">${escapeHtml(t("compositionLead"))}</p>
      </div>
      ${segments.map(renderCompositionSegment).join("")}
    </section>
  `;
}

function compositionSegments(data) {
  const composition = data && data.composition;
  return asArray(composition && composition.segments && composition.segments.segment);
}

function renderCompositionSegment(segment, segmentIndex) {
  const units = asArray(segment.composition && segment.composition.units && segment.composition.units.unit);
  const origin = segment.origin && segment.origin.name;
  const destination = segment.destination && segment.destination.name;
  const title = origin && destination ? `${origin} - ${destination}` : `${t("composition")} ${segmentIndex + 1}`;

  return `
    <article class="composition-segment">
      <h4>${escapeHtml(title)}</h4>
      <div class="composition-track">
        ${units.map((unit, index) => renderCompositionUnit(unit, index, units.length)).join("")}
      </div>
    </article>
  `;
}

function renderCompositionUnit(unit, index, total) {
  const materialType = unit.materialSubTypeName || unit.materialTypeName || materialTypeLabel(unit.materialType) || t("trainUnit");
  const seatsFirst = numericValue(unit.seatsFirstClass) + numericValue(unit.seatsCoupeFirstClass);
  const seatsSecond = numericValue(unit.seatsSecondClass) + numericValue(unit.seatsCoupeSecondClass);
  const standing = numericValue(unit.standingPlacesFirstClass) + numericValue(unit.standingPlacesSecondClass);
  const length = numericValue(unit.lengthInMeter);
  const amenities = trainAmenityLabels(unit);

  return `
    <div class="composition-unit">
      <div class="unit-roof"></div>
      <div class="unit-body">
        <div class="unit-title">
          <strong>${escapeHtml(t("trainUnit"))} ${index + 1}/${total}</strong>
          <span>${escapeHtml(materialType)}</span>
        </div>
        <div class="unit-stats">
          <span>${seatsFirst} ${escapeHtml(t("firstClass"))}</span>
          <span>${seatsSecond} ${escapeHtml(t("secondClass"))}</span>
          ${standing ? `<span>${standing} ${escapeHtml(t("standing"))}</span>` : ""}
          ${length ? `<span>${length}m ${escapeHtml(t("trainLength"))}</span>` : ""}
        </div>
        <div class="amenity-chips">
          ${amenities.map(label => `<span>${escapeHtml(label)}</span>`).join("") || `<span>${escapeHtml(t("compositionUnavailable"))}</span>`}
        </div>
      </div>
      <div class="unit-wheels"><span></span><span></span></div>
    </div>
  `;
}

function materialTypeLabel(materialType) {
  if (!materialType) {
    return "";
  }
  return [materialType.parent_type, materialType.sub_type].filter(Boolean).join(" ");
}

function trainAmenityLabels(unit) {
  const amenities = [
    ["hasToilets", t("toilets")],
    ["hasTables", t("tables")],
    ["hasSecondClassOutlets", t("powerOutlets")],
    ["hasFirstClassOutlets", t("powerOutlets")],
    ["hasHeating", t("heating")],
    ["hasAirco", t("airco")],
    ["hasLuggageSection", t("luggage")],
    ["hasPrmSection", t("prm")],
    ["hasPriorityPlaces", t("priority")],
    ["hasBikeSection", t("bikes")],
  ];
  return [...new Set(amenities.filter(([key]) => isTruthyFlag(unit[key])).map(([, label]) => label))];
}

function openTrain(vehicle, date) {
  if (!vehicle) {
    return;
  }
  setView("train");
  els.trainId.value = normalizeVehicleId(vehicle);
  if (date) {
    els.trainDate.value = apiDateToInputDate(date);
  }
  searchTrain();
}

function stationFromInput(value) {
  return findStations(value)[0] || null;
}

function stationDisplayName(station) {
  if (!station) {
    return "";
  }
  const alternatives = Array.isArray(station.alternative)
    ? station.alternative
    : station.alternative ? [station.alternative] : [];
  const localized = alternatives.find(item => item["@language"] === state.locale);
  return (localized && localized["@value"]) || station.name || "";
}

function stationApiId(station) {
  return `BE.NMBS.${station["@id"].replace(STATION_ID_PREFIX, "")}`;
}

function normalizeVehicleId(value) {
  const raw = (value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("http://irail.be/vehicle/")) {
    return `${VEHICLE_PREFIX}${raw.split("/").pop()}`;
  }
  if (raw.startsWith(VEHICLE_PREFIX)) {
    return raw;
  }
  return `${VEHICLE_PREFIX}${raw.replace(/^BE\.NMBS\./i, "")}`;
}

function compositionVehicleId(value) {
  return vehicleShortName(value);
}

function vehicleShortName(value) {
  return (value || "").replace(/^BE\.NMBS\./, "");
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

function setLoading(container) {
  container.innerHTML = `
    <div class="loading">
      <div class="loader">Loading...</div>
      <h2 class="section-heading">${escapeHtml(t("loadingTitle"))}</h2>
      <p class="small">${escapeHtml(t("loadingSub"))}</p>
    </div>
  `;
}

function showAlert(container, type, message) {
  container.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
}

function clearRouteResults() {
  els.routeAlert.innerHTML = "";
  els.routeResults.innerHTML = "";
}

function shiftRouteTime(minutes) {
  const [hours, mins] = els.routeTime.value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, mins || 0, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  els.routeTime.value = toTimeInputValue(date);
  searchRoute();
}

function searchFromFirstVisibleDeparture(minutesOffset) {
  const first = state.currentConnections[0];
  const departureTime = first && first.departure && Number(first.departure.time);
  if (!departureTime) {
    shiftRouteTime(minutesOffset);
    return;
  }
  setRouteDateTimeFromEpoch(departureTime + (minutesOffset * 60));
  els.routeForm.querySelector("[value='departure']").checked = true;
  searchRoute();
}

function searchFromLastVisibleDeparture() {
  const last = state.currentConnections[state.currentConnections.length - 1];
  const departureTime = last && last.departure && Number(last.departure.time);
  if (!departureTime) {
    shiftRouteTime(60);
    return;
  }
  setRouteDateTimeFromEpoch(departureTime);
  els.routeForm.querySelector("[value='departure']").checked = true;
  searchRoute();
}

function setRouteDateTimeFromEpoch(seconds) {
  const date = new Date(Number(seconds) * 1000);
  els.routeDate.value = toDateInputValue(date);
  els.routeTime.value = toTimeInputValue(date);
}

function setRouteEdge(edge) {
  if (edge === "earliest") {
    els.routeTime.value = "00:00";
    els.routeForm.querySelector("[value='departure']").checked = true;
  } else {
    els.routeTime.value = "23:59";
    els.routeForm.querySelector("[value='arrival']").checked = true;
  }
  searchRoute();
}

function restoreFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "route";
  setView(view, false);

  const from = stationByUri(params.get("from"));
  const to = stationByUri(params.get("to"));
  const station = stationByUri(params.get("station"));
  if (from) {
    state.routeFrom = from;
    els.routeFrom.value = stationDisplayName(from);
  }
  if (to) {
    state.routeTo = to;
    els.routeTo.value = stationDisplayName(to);
  }
  if (params.get("date")) {
    els.routeDate.value = params.get("date");
    els.trainDate.value = params.get("date");
  }
  if (params.get("time")) {
    els.routeTime.value = params.get("time");
    els.liveboardTime.value = params.get("time");
  }
  if (params.get("timesel")) {
    const radio = els.routeForm.querySelector(`[value="${params.get("timesel")}"]`);
    if (radio) {
      radio.checked = true;
    }
  }
  if (station) {
    state.liveboardStation = station;
    els.liveboardStation.value = stationDisplayName(station);
  }
  if (params.get("train")) {
    els.trainId.value = params.get("train");
  }
}

function rememberRoute(from, to) {
  const route = { from: from["@id"], to: to["@id"] };
  state.recentRoutes = [
    route,
    ...state.recentRoutes.filter(item => item.from !== route.from || item.to !== route.to),
  ].slice(0, 4);
  writeStorage(RECENT_ROUTES_STORAGE_KEY, JSON.stringify(state.recentRoutes));
  renderRecentRoutes();
}

function renderRecentRoutes() {
  if (!els.recentRoutes || !state.recentRoutes.length || !state.stations.length) {
    els.recentRoutes.innerHTML = "";
    return;
  }

  const lastRoute = state.recentRoutes[0];
  const currentTime = toTimeInputValue(new Date());
  const buttons = state.recentRoutes.map((route, index) => {
    const from = stationByUri(route.from);
    const to = stationByUri(route.to);
    if (!from || !to) {
      return "";
    }
    return `
      <button class="ghost-button" type="button" data-recent-route="${index}">
        ${escapeHtml(stationDisplayName(from))} -&gt; ${escapeHtml(stationDisplayName(to))}
        <span class="small">${escapeHtml(currentTime)}</span>
      </button>
    `;
  }).join("");

  els.recentRoutes.innerHTML = `
    <div class="recent-card">
      <span class="recent-title">${escapeHtml(t("recentRoutes"))}</span>
      <div class="recent-list">
        <button class="secondary-button" type="button" data-reverse-recent>${escapeHtml(t("reverseLast"))}</button>
        ${buttons}
      </div>
    </div>
  `;

  const reverseRecentButton = els.recentRoutes.querySelector("[data-reverse-recent]");
  if (reverseRecentButton) {
    reverseRecentButton.addEventListener("click", () => {
      applyRecentRoute({ from: lastRoute.to, to: lastRoute.from });
    });
  }
  els.recentRoutes.querySelectorAll("[data-recent-route]").forEach(button => {
    button.addEventListener("click", () => {
      applyRecentRoute(state.recentRoutes[Number(button.dataset.recentRoute)]);
    });
  });
}

function applyRecentRoute(route) {
  const from = stationByUri(route.from);
  const to = stationByUri(route.to);
  if (!from || !to) {
    return;
  }

  state.routeFrom = from;
  state.routeTo = to;
  refreshStationInputs();
  const now = new Date();
  els.routeDate.value = toDateInputValue(now);
  els.routeTime.value = toTimeInputValue(now);
  els.routeForm.querySelector("[value='departure']").checked = true;
  setView("route");
  searchRoute();
}

function swapRouteStations(runSearch) {
  const from = state.routeFrom;
  state.routeFrom = state.routeTo;
  state.routeTo = from;
  refreshStationInputs();
  if (runSearch && state.routeFrom && state.routeTo) {
    searchRoute();
  }
}

function refreshStationInputs() {
  els.routeFrom.value = stationDisplayName(state.routeFrom);
  els.routeTo.value = stationDisplayName(state.routeTo);
  els.liveboardStation.value = stationDisplayName(state.liveboardStation);
}

function rerenderCurrentResults() {
  if (state.currentConnections.length) {
    renderRouteResults(state.currentConnections);
  }
  if (window.currentLiveboardDepartures && state.liveboardStation) {
    renderLiveboard(state.liveboardStation, window.currentLiveboardDepartures);
  }
}

function stationByUri(uri) {
  if (!uri) {
    return null;
  }
  const decoded = decodeURIComponent(uri);
  return state.stations.find(station => station["@id"] === decoded || stationApiId(station) === decoded) || null;
}

function updateUrl(params) {
  const url = new URL(window.location.href);
  url.search = "";
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  history.replaceState(null, "", url);
}

function asArray(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function formatEpochTime(seconds) {
  if (!seconds) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BELGIUM_TIME_ZONE,
  }).format(new Date(Number(seconds) * 1000));
}

function formatDuration(seconds) {
  const minutes = Math.round(Number(seconds || 0) / 60);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours ? `${hours} h ` : ""}${remainder ? `${remainder} min` : ""}`.trim();
}

function formatTransferDuration(seconds) {
  const minutes = Math.max(0, Math.round(Number(seconds || 0) / 60));
  return `${minutes} ${t("mins")}`;
}

function delayLabel(delay, canceled) {
  if (Number(canceled || 0) > 0) {
    return `<span class="delay">${escapeHtml(t("canceled"))}</span>`;
  }
  const minutes = Math.round(Number(delay || 0) / 60);
  return minutes > 0 ? `<span class="delay">+${minutes}'</span>` : "";
}

function platformName(platform) {
  return platform || "?";
}

function occupancyName(occupancy) {
  if (!occupancy) {
    return "unknown";
  }
  if (typeof occupancy === "string") {
    return occupancy.replace("http://api.irail.be/terms/", "") || "unknown";
  }
  return occupancy.name || "unknown";
}

function isTruthyFlag(value) {
  return value === true || value === 1 || value === "1" || value === "true" || value === "yes";
}

function numericValue(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function toApiDate(inputDate) {
  if (!inputDate) {
    return toApiDateFromEpoch(Date.now() / 1000);
  }
  const [year, month, day] = inputDate.split("-");
  return `${day}${month}${year.slice(-2)}`;
}

function apiDateToInputDate(apiDate) {
  if (!apiDate || apiDate.length !== 6) {
    return toDateInputValue(new Date());
  }
  return `20${apiDate.slice(4, 6)}-${apiDate.slice(2, 4)}-${apiDate.slice(0, 2)}`;
}

function toApiTime(inputTime) {
  return (inputTime || "00:00").replace(":", "").slice(0, 4);
}

function toApiDateFromEpoch(seconds) {
  const parts = dateTimeParts(new Date(Number(seconds) * 1000));
  return `${parts.day}${parts.month}${parts.year.slice(-2)}`;
}

function toDateInputValue(date) {
  const parts = dateTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function toTimeInputValue(date) {
  const parts = dateTimeParts(date);
  return `${parts.hour}:${parts.minute}`;
}

function dateTimeParts(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: BELGIUM_TIME_ZONE,
  }).formatToParts(date);
  return Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resolveInitialLocale() {
  const stored = normalizeLocale(readStorage(LANGUAGE_STORAGE_KEY));
  if (stored) {
    return stored;
  }

  const browserLanguages = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || "en"];
  const preferred = browserLanguages.map(normalizeLocale).find(Boolean);
  return preferred || "en";
}

function normalizeLocale(locale) {
  const normalized = String(locale || "").toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : "";
}

function loadRecentRoutes() {
  try {
    const parsed = JSON.parse(readStorage(RECENT_ROUTES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter(route => route && route.from && route.to).slice(0, 4)
      : [];
  } catch {
    return [];
  }
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return "";
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Persistence is optional; private browsing modes can disable localStorage.
  }
}
