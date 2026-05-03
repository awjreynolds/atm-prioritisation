import { mkdir, copyFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await copyFile("src/index.html", "dist/index.html");
await copyFile("src/styles.css", "dist/styles.css");
await copyFile("src/route-styles.mjs", "dist/route-styles.mjs");
