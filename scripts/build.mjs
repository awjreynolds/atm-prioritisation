import { mkdir, copyFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await mkdir("dist/data", { recursive: true });
await copyFile("src/index.html", "dist/index.html");
await copyFile("src/styles.css", "dist/styles.css");
await copyFile("src/app.mjs", "dist/app.mjs");
await copyFile("src/route-map.mjs", "dist/route-map.mjs");
await copyFile("data/pilot-routes.json", "dist/data/pilot-routes.json");
