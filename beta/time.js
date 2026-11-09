const zone = "Europe/Brussels";
const partsFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

export function localParts(milliseconds) {
  return Object.fromEntries(partsFormat.formatToParts(new Date(milliseconds))
    .filter(part => part.type !== "literal").map(part => [part.type, part.value]));
}

export function dateAndTime(milliseconds) {
  const p = localParts(milliseconds);
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

// Date inputs describe Belgian wall time, even when the browser is abroad.
// Reject the missing spring DST hour instead of silently changing the request.
export function belgianInstant(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  for (const offset of [2, 1]) {
    const candidate = wall - offset * 3600000;
    const actual = dateAndTime(candidate);
    if (actual.date === date && actual.time === time) return new Date(candidate);
  }
  return null;
}

export function serviceDayInstant(serviceDate) {
  const value = String(serviceDate);
  if (!/^\d{8}$/.test(value)) return null;
  return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}T12:00:00Z`);
}

export function stationKey(identifier) {
  const value = String(identifier ?? "");
  const match = /\/stops\/S?(\d+)(?:_[^/]*)?$/.exec(value)
    || /(?:BE\.NMBS\.|\/stations\/NMBS\/)0*(\d+)$/.exec(value)
    || /^0*(\d{6,9})$/.exec(value);
  return match ? String(Number(match[1])) : value;
}

export function journeyKey(journey) {
  return journey.legs.map(leg => leg.kind === "ride"
    ? `${leg.tripIri}|${leg.serviceDate}|${leg.boardStop}|${leg.alightStop}`
    : `walk|${JSON.stringify(leg.from)}|${JSON.stringify(leg.to)}`).join(";");
}
