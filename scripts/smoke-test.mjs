import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const distDirectory = resolve("dist");
const baseUrl = "http://atm-prioritisation.local/";

execFileSync("npm", ["run", "build"], { stdio: "pipe" });

const pageResponse = await fetchBuiltAsset("/");
assert.equal(pageResponse.status, 200);

const pageHtml = await pageResponse.text();
const pageText = visibleText(pageHtml);
assert.match(
  pageText,
  /independent personal proof-of-concept work, not a council-owned plan, WECA-owned plan, formal LCWIP, or final prioritised network/i,
);
assert.match(pageText, /Route status/i);
assert.match(pageText, /Route status uses colour and line pattern/i);
assert.match(pageText, /Modal shift potential/i);
assert.match(pageText, /line width; wider lines indicate stronger potential/i);

const cssResponse = await fetchBuiltAsset("styles.css");
assert.equal(cssResponse.status, 200);
const css = await cssResponse.text();
assert.match(css, /@media\s*\(max-width:\s*780px\)/i);
assert.match(css, /grid-template-columns:\s*1fr/i);

const atmGeoJsonResponse = await fetchBuiltAsset(
  "data/atm-routes-bath-somer-valley.geojson",
);
assert.equal(atmGeoJsonResponse.status, 200);
const atmGeoJson = await atmGeoJsonResponse.json();
assert.equal(atmGeoJson.type, "FeatureCollection");

const banesAtmGeoJsonResponse = await fetchBuiltAsset("data/banes-atm-full.geojson");
assert.equal(banesAtmGeoJsonResponse.status, 200);
const banesAtmGeoJson = await banesAtmGeoJsonResponse.json();
assert.equal(banesAtmGeoJson.type, "FeatureCollection");
assert.equal(banesAtmGeoJson.features.length, 784);
assert.equal(
  banesAtmGeoJson.features.filter((feature) => feature.geometry).length,
  776,
);

const routeMap = await renderAppWithHarness();
assert.match(routeMap.innerHTML, /data-route-id="/i);
assert.match(routeMap.innerHTML, /Original ATM-style source evidence/i);
assert.match(routeMap.innerHTML, /Simplified prototype layer/i);
assert.match(routeMap.innerHTML, /data-leaflet-route-map/i);
assert.match(routeMap.innerHTML, /data-map-layer="source-context"/i);
assert.match(routeMap.innerHTML, /data-map-layer="prototype-prioritisation"/i);
assert.match(routeMap.innerHTML, /776 full B&amp;NES portal features/i);
assert.match(routeMap.innerHTML, /OpenStreetMap/i);
assert.match(routeMap.innerHTML, /OpenStreetMap contributors/i);
assert.match(routeMap.innerHTML, /not official alignments/i);

const selectedRouteId = firstRouteId(routeMap.innerHTML);
routeMap.dispatchClick(routeTarget(selectedRouteId));

assert.match(routeMap.innerHTML, /id="route-detail"/i);
assert.match(routeMap.innerHTML, /Route detail/i);
assert.match(routeMap.innerHTML, /Why this route matters/i);
assert.match(routeMap.innerHTML, /What needs review/i);
assert.match(routeMap.innerHTML, /Evidence and provenance/i);

const keyboardRouteMap = await renderAppWithHarness();
keyboardRouteMap.dispatchKeyDown(
  routeTarget("prototype-a367-utility-corridor-hypothesis"),
  "Enter",
);
assert.match(keyboardRouteMap.innerHTML, /A367 utility-corridor hypothesis/i);
assert.match(keyboardRouteMap.innerHTML, /Evidence and provenance/i);

auditAccessibility(`${pageHtml}\n${routeMap.innerHTML}`);

async function fetchBuiltAsset(resource) {
  try {
    const assetUrl = new URL(String(resource), baseUrl);
    const requestedPath =
      assetUrl.pathname === "/" ? "/index.html" : assetUrl.pathname;
    const filePath = safeJoin(distDirectory, decodeURIComponent(requestedPath));
    const file = await readFile(filePath);

    return new Response(file, {
      status: 200,
      headers: {
        "content-type": contentType(filePath),
      },
    });
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }
}

function safeJoin(rootDirectory, pathname) {
  const normalizedPath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(join(rootDirectory, normalizedPath));

  if (filePath !== rootDirectory && !filePath.startsWith(`${rootDirectory}${sep}`)) {
    throw new Error(`Refusing to serve path outside dist: ${pathname}`);
  }

  return filePath;
}

function contentType(filePath) {
  const extension = extname(filePath);
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".mjs" || extension === ".js") {
    return "text/javascript; charset=utf-8";
  }
  if (extension === ".json" || extension === ".geojson") {
    return "application/json; charset=utf-8";
  }

  return "application/octet-stream";
}

async function renderAppWithHarness() {
  const routeMap = createRouteMapElement();
  const originalDocument = globalThis.document;
  const originalFetch = globalThis.fetch;

  globalThis.document = {
    querySelector(selector) {
      return selector === "#route-map" ? routeMap : null;
    },
  };
  globalThis.fetch = (resource, options) => {
    assert.equal(options, undefined);
    return fetchBuiltAsset(resource);
  };

  try {
    await import(`${pathToFileURL(resolve("dist/app.mjs")).href}?smoke=${Date.now()}`);
  } finally {
    globalThis.document = originalDocument;
    globalThis.fetch = originalFetch;
  }

  return routeMap;
}

function createRouteMapElement() {
  const listeners = new Map();

  return {
    innerHTML: "",
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatchClick(target) {
      const listener = listeners.get("click");
      assert.equal(typeof listener, "function");
      listener({ target });
    },
    dispatchKeyDown(target, key) {
      const listener = listeners.get("keydown");
      assert.equal(typeof listener, "function");
      listener({
        key,
        preventDefault() {},
        target,
      });
    },
  };
}

function routeTarget(routeId) {
  return {
    closest(selector) {
      if (selector === "[data-destination-toggle]") {
        return null;
      }

      if (selector === "[data-route-id]") {
        return {
          dataset: {
            routeId,
          },
        };
      }

      return null;
    },
  };
}

function firstRouteId(html) {
  const match = html.match(/data-route-id="([^"]+)"/i);
  assert.notEqual(match, null);
  return match[1];
}

function auditAccessibility(html) {
  assert.match(html, /<html[^>]+lang="en"/i);
  assert.match(html, /<title>[^<]+<\/title>/i);
  assert.match(html, /<main\b/i);
  assert.doesNotMatch(html, /<img\b(?![^>]*\balt=)/i);

  const labelledRegions = html.match(/<(section|aside)\b[^>]*aria-label="[^"]+"/gi);
  assert.ok((labelledRegions?.length ?? 0) >= 3);

  const routeButtons = html.match(/<button\b[^>]*class="route-line"[\s\S]*?<\/button>/gi);
  assert.ok((routeButtons?.length ?? 0) > 0);

  for (const button of routeButtons) {
    assert.match(button, /aria-controls="route-detail"/i);
    assert.match(button, /aria-pressed="(true|false)"/i);
    assert.match(visibleText(button), /\S/);
  }

  const controlledIds = [
    ...html.matchAll(/aria-controls="([^"]+)"/gi),
  ].map((match) => match[1]);

  for (const controlledId of controlledIds) {
    assert.match(html, new RegExp(`id="${escapeRegExp(controlledId)}"`, "i"));
  }

  const labelledCheckboxes = html.match(
    /<label\b[\s\S]*<input\b[^>]*type="checkbox"[\s\S]*<\/label>/gi,
  );
  assert.ok((labelledCheckboxes?.length ?? 0) >= 1);
  assert.ok(labelledCheckboxes.some((label) => /School and key destination context/i.test(label)));
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
