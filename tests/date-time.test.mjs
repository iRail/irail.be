import assert from "node:assert/strict";
import test from "node:test";
import { dateInputToIso, isoToDateInput, isValidTimeInput } from "../date-time.js";

test("dates are day-first even when the day could be a US month", () => {
  assert.equal(dateInputToIso("08/11/2026"), "2026-11-08");
  assert.equal(isoToDateInput("2026-11-08"), "08/11/2026");
  assert.equal(dateInputToIso("31/12/2026"), "2026-12-31");
});

test("valid calendar dates round-trip without a timezone conversion", () => {
  for (const value of ["2026-01-01", "2026-03-29", "2026-10-25", "2026-12-31", "2028-02-29", "2000-02-29", "0099-01-01"]) {
    assert.equal(dateInputToIso(isoToDateInput(value)), value);
  }
});

test("impossible dates and unexpected formats are rejected", () => {
  for (const value of ["", "11/13/2026", "31/04/2026", "29/02/2026", "29/02/1900", "00/11/2026", "08/00/2026", "08/11/0000", "2026-11-08", "8/11/2026", "08/11/26", "08/11/2026 extra"]) {
    assert.equal(dateInputToIso(value), "", value);
  }
  for (const value of ["", "2026-02-29", "2026-04-31", "2026-13-08", "0000-01-01", "08/11/2026", "2026-1-1"]) {
    assert.equal(isoToDateInput(value), "", value);
  }
});

test("time inputs accept the full 24-hour day", () => {
  for (const value of ["00:00", "00:05", "12:00", "14:05", "23:59"]) {
    assert.equal(isValidTimeInput(value), true, value);
  }
  for (const value of ["", "24:00", "12:60", "02:05 PM", "2:05", "14:5", "14:05:00", "-1:05"]) {
    assert.equal(isValidTimeInput(value), false, value);
  }
});
