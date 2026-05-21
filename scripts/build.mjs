import { mkdir, copyFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await mkdir("dist/data", { recursive: true });
await copyFile("src/index.html", "dist/index.html");
await copyFile("src/styles.css", "dist/styles.css");
await copyFile("src/route-styles.mjs", "dist/route-styles.mjs");
await copyFile("src/route-details.mjs", "dist/route-details.mjs");
await copyFile("src/app.mjs", "dist/app.mjs");
await copyFile("src/route-map.mjs", "dist/route-map.mjs");
await copyFile("data/pilot-routes.json", "dist/data/pilot-routes.json");
await copyFile("data/pilot-destinations.json", "dist/data/pilot-destinations.json");
await copyFile(
  "data/atm-routes-bath-somer-valley.geojson",
  "dist/data/atm-routes-bath-somer-valley.geojson",
);
await copyFile("data/banes-atm-full.geojson", "dist/data/banes-atm-full.geojson");
