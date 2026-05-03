import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";

await rm("dist", { recursive: true, force: true });

execFileSync("npm", ["run", "build"], { stdio: "pipe" });

assert.equal(existsSync("dist/index.html"), true);
assert.equal(existsSync("dist/styles.css"), true);

const page = await readFile("dist/index.html", "utf8");
const visibleText = page.replace(/\s+/g, " ");

assert.match(page, /href="styles\.css"/i);

assert.match(
  visibleText,
  /independent personal proof-of-concept work, not a council-owned plan, WECA-owned plan, formal LCWIP, or final prioritised network/i,
);

assert.match(page, /<section[^>]+aria-label="Prototype map"/i);
assert.match(visibleText, /map placeholder/i);

assert.match(page, /<aside[^>]+aria-label="Prototype legend"/i);
assert.match(visibleText, /route status/i);
assert.match(visibleText, /modal shift potential/i);

assert.equal(existsSync("README.md"), true);
const readme = await readFile("README.md", "utf8");
const readmeText = readme.replace(/\s+/g, " ");
assert.match(readmeText, /independent proof of concept/i);
assert.match(readmeText, /not.*official council/i);
assert.match(readmeText, /GitHub Pages/i);
assert.match(readmeText, /prototype data assumptions/i);

assert.equal(existsSync(".github/workflows/pages.yml"), true);
const workflow = await readFile(".github/workflows/pages.yml", "utf8");
assert.match(workflow, /github-pages/i);
assert.match(workflow, /npm run build/i);
