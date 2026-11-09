import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = new URL("../", import.meta.url);
const output = new URL("dist/", root);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// Publish the existing site and its RDF/station pages alongside the new beta.
// Keep source files, dependencies, tests and local files out of the artifact.
for (const path of ["index.html", "app.js", "date-time.js", "styles.css", "favicon.ico", "site.webmanifest", "route.html", "CNAME", "assets", "ns", "stations", "stations.json"]) {
  await cp(new URL(path, root), new URL(path, output), { recursive: true });
}
await writeFile(new URL(".nojekyll", output), "");
await build({ configFile: fileURLToPath(new URL("vite.beta.config.js", root)) });
console.log("Built the existing site at dist/ and the planner at dist/beta/.");
