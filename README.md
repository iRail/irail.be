# iRail.be static frontend

This repository contains the GitHub Pages frontend for iRail.be.

It replaces the old `hyperRail` server-rendered application with a client-side HTML, CSS, and JavaScript app. The app talks directly to `https://api.irail.be` for route planning, station departures, train details, and train composition data.

## Station autocomplete data

The station autocomplete uses a generated `stations.json` file. The source data comes from the `irail/stations` repository.

To rebuild it locally:

```sh
npm run build:stations -- --source path/to/irail-stations
```

GitHub Actions runs this build daily by checking out `irail/stations`, regenerating `stations.json`, and committing the file when it changed.
