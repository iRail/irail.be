import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";

const root = resolve("dist");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png" };
createServer(async (request, response) => {
  let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  // The same artifact is mounted at the root of a second URL namespace to
  // check that promotion does not require any asset or worker URL changes.
  if (pathname.startsWith("/promoted/")) pathname = pathname.replace("/promoted/", "/beta/");
  if (pathname.endsWith("/")) pathname += "index.html";
  const file = resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}/`)) { response.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" }); response.end(body);
  }
  catch { response.writeHead(404).end(); }
}).listen(4175, "127.0.0.1");
