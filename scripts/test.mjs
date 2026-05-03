import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const routeContract = JSON.parse(
  await readFile("data/route-contract.json", "utf8"),
);
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const { styleRouteForMap } = await import("../src/route-styles.mjs");

assert.deepEqual(routeContract.requiredFields, [
  "route_id",
  "route_name",
  "corridor_name",
  "source_atm_classification",
  "network_status",
  "network_role",
  "modal_shift_potential",
  "age12_standard_target",
  "school_access_relevance",
  "broad_intervention_need",
  "why_this_route_matters",
  "what_needs_review",
  "evidence_notes",
  "provenance_notes",
  "uncertainty_notes",
]);

assert.deepEqual(routeContract.allowedValues, {
  network_status: [
    "preferred",
    "supporting",
    "not-preferred",
    "needs-review",
  ],
  network_role: [
    "utility-spine",
    "settlement-connector",
    "school-access-link",
    "greenway-strategic-link",
    "leisure-tourism-link",
    "bus-corridor-access",
    "gap-filler",
    "local-feeder",
    "unknown",
  ],
  modal_shift_potential: ["high", "medium", "low", "unknown"],
  age12_standard_target: [
    "likely-after-intervention",
    "partial-after-intervention",
    "unlikely-without-major-change",
    "already-good-enough",
    "unknown",
  ],
  school_access_relevance: ["high", "medium", "low", "unknown"],
  broad_intervention_need: [
    "existing-route-may-be-sufficient",
    "upgrade-likely-needed",
    "new-or-substantially-improved-route-likely-needed",
    "officer-review-needed",
    "unknown",
  ],
});

assert.equal(
  packageJson.scripts["validate:routes"],
  "node scripts/validate-routes.mjs",
);

await rm("tmp-route-tests", { recursive: true, force: true });
await mkdir("tmp-route-tests", { recursive: true });

function validateRoutes(routeFile) {
  return execFileSync("node", ["scripts/validate-routes.mjs", routeFile], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function validationFailure(routeFile) {
  try {
    validateRoutes(routeFile);
  } catch (error) {
    assert.notEqual(error.status, 0);
    return error.stderr;
  }

  assert.fail(`Expected route validation to fail for ${routeFile}`);
}

const completeRouteRecord = {
  route_id: "bath-somer-valley-pilot",
  route_name: "Bath to Somer Valley pilot corridor",
  corridor_name: "Bath to Somer Valley",
  source_atm_classification: "strategic",
  network_status: "needs-review",
  network_role: "unknown",
  modal_shift_potential: "unknown",
  age12_standard_target: "unknown",
  school_access_relevance: "unknown",
  broad_intervention_need: "officer-review-needed",
  why_this_route_matters:
    "Evidence review is needed before assigning a proposed status.",
  what_needs_review:
    "Route role, school access relevance, and intervention assumptions.",
  evidence_notes: "No final evidence conclusion has been encoded.",
  provenance_notes: "Prototype fixture for route contract validation.",
  uncertainty_notes: "Open MVP evidence questions remain unresolved.",
};

const atmBackgroundStyle = styleRouteForMap({
  ...completeRouteRecord,
  route_layer: "atm-background",
  network_status: "supporting",
  modal_shift_potential: "high",
});

assert.equal(atmBackgroundStyle.stroke, "#b8c2cc");
assert.equal(atmBackgroundStyle.strokeWidth, 2);
assert.equal(atmBackgroundStyle.strokeOpacity, 0.45);
assert.equal(atmBackgroundStyle.strokeDasharray, "2 7");
assert.equal(atmBackgroundStyle.layerOrder, 0);

const prototypeStatusStyles = routeContract.allowedValues.network_status.map(
  (network_status) => [
    network_status,
    styleRouteForMap({
      ...completeRouteRecord,
      route_layer: "prototype-simplified",
      network_status,
      modal_shift_potential: "medium",
    }),
  ],
);

assert.deepEqual(
  prototypeStatusStyles.map(([network_status, style]) => [
    network_status,
    style.stroke,
    style.strokeDasharray,
    style.statusLabel,
  ]),
  [
    ["preferred", "#0072b2", "none", "Preferred in simplified layer"],
    ["supporting", "#009e73", "8 4", "Supporting route"],
    ["not-preferred", "#d55e00", "2 5", "Not preferred in simplified layer"],
    ["needs-review", "#cc79a7", "10 3 2 3", "Needs review"],
  ],
);

const prototypeModalShiftStyles =
  routeContract.allowedValues.modal_shift_potential.map(
    (modal_shift_potential) => [
      modal_shift_potential,
      styleRouteForMap({
        ...completeRouteRecord,
        route_layer: "prototype-simplified",
        network_status: "needs-review",
        modal_shift_potential,
      }),
    ],
  );

assert.deepEqual(
  prototypeModalShiftStyles.map(([modal_shift_potential, style]) => [
    modal_shift_potential,
    style.strokeWidth,
    style.modalShiftLabel,
  ]),
  [
    ["high", 8, "High modal shift potential"],
    ["medium", 5, "Medium modal shift potential"],
    ["low", 3, "Low modal shift potential"],
    ["unknown", 4, "Unknown modal shift potential"],
  ],
);

assert.throws(
  () =>
    styleRouteForMap({
      ...completeRouteRecord,
      route_layer: "prototype-simplified",
      network_status: "decided",
      modal_shift_potential: "medium",
    }),
  {
    name: "RangeError",
    message: /Unsupported network_status value "decided"/,
  },
);

assert.throws(
  () =>
    styleRouteForMap({
      ...completeRouteRecord,
      route_layer: "prototype-simplified",
      network_status: "needs-review",
      modal_shift_potential: "certain",
    }),
  {
    name: "RangeError",
    message: /Unsupported modal_shift_potential value "certain"/,
  },
);

await writeFile(
  "tmp-route-tests/valid-routes.json",
  `${JSON.stringify([completeRouteRecord], null, 2)}\n`,
);

validateRoutes("tmp-route-tests/valid-routes.json");

await writeFile("tmp-route-tests/non-object-record.json", "[null]\n");

assert.match(
  validationFailure("tmp-route-tests/non-object-record.json"),
  /record 1.*object/,
);

const routeWithoutProvenance = { ...completeRouteRecord };
delete routeWithoutProvenance.provenance_notes;

await writeFile(
  "tmp-route-tests/missing-provenance.json",
  `${JSON.stringify([routeWithoutProvenance], null, 2)}\n`,
);

assert.match(
  validationFailure("tmp-route-tests/missing-provenance.json"),
  /provenance_notes/,
);

const routeWithBlankUncertainty = {
  ...completeRouteRecord,
  uncertainty_notes: "",
};

await writeFile(
  "tmp-route-tests/blank-uncertainty.json",
  `${JSON.stringify([routeWithBlankUncertainty], null, 2)}\n`,
);

assert.match(
  validationFailure("tmp-route-tests/blank-uncertainty.json"),
  /uncertainty_notes/,
);

const routeWithUnsupportedStatus = {
  ...completeRouteRecord,
  network_status: "decided",
};

await writeFile(
  "tmp-route-tests/unsupported-status.json",
  `${JSON.stringify([routeWithUnsupportedStatus], null, 2)}\n`,
);

assert.match(
  validationFailure("tmp-route-tests/unsupported-status.json"),
  /network_status.*decided/,
);

await rm("dist", { recursive: true, force: true });

execFileSync("npm", ["run", "build"], { stdio: "pipe" });

assert.equal(existsSync("dist/index.html"), true);
assert.equal(existsSync("dist/styles.css"), true);
assert.equal(existsSync("dist/route-styles.mjs"), true);

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
assert.match(visibleText, /Preferred in simplified layer/i);
assert.match(visibleText, /Needs review/i);
assert.match(visibleText, /line pattern/i);
assert.match(visibleText, /High modal shift potential/i);
assert.match(visibleText, /Low modal shift potential/i);
assert.match(visibleText, /wider lines indicate stronger potential/i);

assert.equal(existsSync("README.md"), true);
const readme = await readFile("README.md", "utf8");
const readmeText = readme.replace(/\s+/g, " ");
assert.match(readmeText, /independent proof of concept/i);
assert.match(readmeText, /not.*official council/i);
assert.match(readmeText, /GitHub Pages/i);
assert.match(readmeText, /prototype data assumptions/i);
assert.match(readmeText, /npm run validate:routes -- path\/to\/routes\.json/i);

assert.equal(existsSync(".github/workflows/pages.yml"), true);
const workflow = await readFile(".github/workflows/pages.yml", "utf8");
assert.match(workflow, /github-pages/i);
assert.match(workflow, /npm run build/i);

await rm("tmp-route-tests", { recursive: true, force: true });
