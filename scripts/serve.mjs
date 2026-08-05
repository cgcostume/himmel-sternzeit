#!/usr/bin/env node
// Dev script: serves the repo root over http so static/index.html can load ../dist/*.js as ES modules
// (blocked under file://) and static/index.css / static/index.js as plain relative paths. No dependency
// on a static-file-server package, this is a small enough job for node:http alone. Run via `pnpm start`.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT ?? 4173);

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
};

const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    let path = resolve(join(root, decodeURIComponent(url.pathname)));
    if (!path.startsWith(root)) {
        res.writeHead(403).end("forbidden");
        return;
    }

    try {
        if ((await stat(path)).isDirectory()) path = join(path, "index.html");
        const body = await readFile(path);
        res.writeHead(200, { "content-type": MIME_TYPES[extname(path)] ?? "application/octet-stream" });
        res.end(body);
    } catch {
        res.writeHead(404).end("not found");
    }
});

server.listen(port, () => {
    console.log(`serving ${root} at http://localhost:${port}/static/index.html`);
});
