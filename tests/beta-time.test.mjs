import test from "node:test";
import assert from "node:assert/strict";
import { belgianInstant, dateAndTime, journeyKey, serviceDayInstant, stationKey } from "../beta/time.js";

test("journey links retain Belgian local time across dates and browser timezones", () => {
  assert.equal(belgianInstant("2026-11-09", "23:30").toISOString(), "2026-11-09T22:30:00.000Z");
  assert.equal(belgianInstant("2026-07-09", "23:30").toISOString(), "2026-07-09T21:30:00.000Z");
  assert.deepEqual(dateAndTime(Date.parse("2026-11-09T23:30:00Z")), { date: "2026-11-10", time: "00:30" });
});

test("missing DST hours and invalid calendar dates are rejected", () => {
  assert.equal(belgianInstant("2026-03-29", "02:30"), null);
  assert.equal(belgianInstant("2026-02-30", "12:00"), null);
  assert.equal(belgianInstant("2026-11-09", "25:30"), null);
  assert.equal(belgianInstant("2026-10-25", "02:30").toISOString(), "2026-10-25T00:30:00.000Z");
});

test("train details use the train's service day even for journeys after midnight", () => {
  assert.equal(dateAndTime(Number(serviceDayInstant(20261108))).date, "2026-11-08");
});

test("platform IRIs resolve to the station shared by the planner's directory", () => {
  for (const id of ["BE.NMBS.008892007", "http://irail.be/stations/NMBS/008892007", "https://irail.be/id/be.sncb/stops/S8892007", "https://irail.be/id/be.sncb/stops/8892007_3"]) {
    assert.equal(stationKey(id), "8892007");
  }
});

test("expanded journeys keep their identity when a real-time update changes their times", () => {
  const leg = { kind: "ride", tripIri: "trip/502", serviceDate: 20261108, boardStop: 1, alightStop: 4, boardTime: 100, alightTime: 200 };
  const before = { legs: [leg] }, after = { legs: [{ ...leg, boardTime: 400, alightTime: 500 }] };
  assert.equal(journeyKey(before), journeyKey(after));
  assert.notEqual(journeyKey(before), journeyKey({ legs: [{ ...leg, serviceDate: 20261109 }] }));
});
