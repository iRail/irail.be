// Display dates day-first, while URLs and application state use ISO dates.
export function dateInputToIso(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return "";
  }

  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  if (year === "0000" || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== `${year}-${month}-${day}`) {
    return "";
  }
  return `${year}-${month}-${day}`;
}

export function isoToDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  const formatted = `${day}/${month}/${year}`;
  return dateInputToIso(formatted) ? formatted : "";
}

export function isValidTimeInput(value) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
