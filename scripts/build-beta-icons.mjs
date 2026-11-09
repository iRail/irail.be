import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Optional asset maintenance command; builds use the checked-in PNG files.
// Rasterize the existing vector logo, preserving its branding and proportions.
const directory = new URL("../beta/public/assets/", import.meta.url);
const logo = await readFile(new URL("logo.svg", directory), "utf8");
const artwork = /<svg\b[^>]*>([\s\S]*)<\/svg>/u.exec(logo)[1];
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {});
const page = await browser.newPage();
try {
  for (const [name, size, fraction] of [
    ["icon-192.png", 192, .72], ["icon-512.png", 512, .72],
    ["icon-maskable-512.png", 512, .6], ["apple-touch-icon.png", 180, .72],
  ]) {
    const width = size * fraction, height = width * 29.957 / 39.312;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#c72929"/><svg x="${(size - width) / 2}" y="${(size - height) / 2}" width="${width}" height="${height}" viewBox="0 0 39.312 29.957">${artwork}</svg></svg>`;
    // Maskable artwork fits entirely inside the central 80% safe-zone circle.
    const png = await page.evaluate(async ({ svg, size }) => {
      const image = new Image();
      image.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = size;
      canvas.getContext("2d").drawImage(image, 0, 0);
      return canvas.toDataURL("image/png").split(",")[1];
    }, { svg, size });
    await writeFile(new URL(name, directory), Buffer.from(png, "base64"));
    if (name === "icon-512.png") await writeFile(new URL("app-icon.svg", directory), `${svg}\n`);
  }
} finally { await browser.close(); }
