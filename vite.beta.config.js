import { defineConfig } from "vite";

// The built directory can be served at /beta/ or copied to the domain root.
export default defineConfig({
  root: "beta",
  base: "./",
  build: { outDir: "../dist/beta", emptyOutDir: true },
  worker: { format: "es" },
});
