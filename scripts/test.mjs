import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const routeContract = JSON.parse(
  await readFile("data/route-contract.json", "utf8"),
);
const sourceInventory = JSON.parse(
  await readFile("data/pilot-source-inventory.json", "utf8"),
);
const atmRouteExtractionSchema = JSON.parse(
  await readFile("data/atm-route-extraction-schema.json", "utf8"),
);
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const { styleRouteForMap } = await import("../src/route-styles.mjs");
const { formatRouteDetail } = await import("../src/route-details.mjs");

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

assert.equal(
  packageJson.scripts["validate:sources"],
  "node scripts/validate-source-inventory.mjs",
);

assert.equal(
  packageJson.scripts["validate:destinations"],
  "node scripts/validate-destinations.mjs",
);

assert.equal(
  packageJson.scripts["validate:atm-routes"],
  "node scripts/validate-atm-routes.mjs",
);

assert.deepEqual(atmRouteExtractionSchema.required_collection_metadata, [
  "batch_id",
  "batch_name",
  "batch_area",
  "extraction_status",
  "geometry_precision",
  "geometry_status",
  "official_geometry",
  "source_summary",
  "notes",
]);

assert.deepEqual(atmRouteExtractionSchema.required_feature_properties, [
  "atm_route_id",
  "route_name",
  "source_layer",
  "source_atm_classification",
  "geometry_status",
  "geometry_confidence",
  "needs_human_spot_check",
  "source_ids",
  "provenance_notes",
  "uncertainty_notes",
]);

assert.equal(
  atmRouteExtractionSchema.allowed_feature_values.geometry_status.includes(
    "ambiguous-or-unextractable",
  ),
  true,
);

execFileSync("npm", ["run", "validate:sources"], { stdio: "pipe" });
execFileSync("npm", ["run", "validate:destinations"], { stdio: "pipe" });

function validateAtmRoutes(geoJsonFile) {
  return execFileSync("node", ["scripts/validate-atm-routes.mjs", geoJsonFile], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function atmRoutesValidationFailure(geoJsonFile) {
  try {
    validateAtmRoutes(geoJsonFile);
  } catch (error) {
    assert.notEqual(error.status, 0);
    return error.stderr;
  }

  assert.fail(`Expected ATM route validation to fail for ${geoJsonFile}`);
}

assert.equal(existsSync("data/atm-routes-bath-somer-valley.geojson"), true);
validateAtmRoutes("data/atm-routes-bath-somer-valley.geojson");
const bathSomerValleyAtmRoutes = JSON.parse(
  await readFile("data/atm-routes-bath-somer-valley.geojson", "utf8"),
);
const wecaLcwipUrbanAreas = JSON.parse(
  await readFile("data/weca-lcwip-urban-areas.geojson", "utf8"),
);
const wecaSatnCentroids = JSON.parse(
  await readFile("data/weca-satn-centroids.geojson", "utf8"),
);
const wecaStrategicNetwork = JSON.parse(
  await readFile("data/weca-strategic-network.geojson", "utf8"),
);
const nationalCycleNetwork = JSON.parse(
  await readFile("data/national-cycle-network.geojson", "utf8"),
);
assert.equal(bathSomerValleyAtmRoutes.type, "FeatureCollection");
assert.equal(bathSomerValleyAtmRoutes.features.length >= 5, true);
assert.equal(
  bathSomerValleyAtmRoutes.features.some(
    (feature) => feature.properties?.source_layer === "atm-route",
  ),
  true,
);
assert.equal(
  bathSomerValleyAtmRoutes.features.some(
    (feature) => feature.properties?.source_layer === "context-greenway",
  ),
  true,
);
assert.equal(
  bathSomerValleyAtmRoutes.features.some(
    (feature) => feature.properties?.source_layer === "prototype-hypothesis",
  ),
  false,
);
assert.equal(wecaLcwipUrbanAreas.type, "FeatureCollection");
assert.equal(wecaLcwipUrbanAreas.features.length, 14);
assert.deepEqual(
  wecaLcwipUrbanAreas.features.map((feature) => feature.properties.area_name),
  [
    "Bristol",
    "Bath and Batheaston",
    "Keynsham",
    "Radstock",
    "Midsomer Norton",
    "Peasedown St John",
    "Paulton",
    "Yate",
    "Chipping Sodbury",
    "Thornbury",
    "Weston-super-Mare",
    "Clevedon",
    "Nailsea",
    "Portishead",
  ],
);
assert.equal(wecaSatnCentroids.type, "FeatureCollection");
assert.equal(wecaSatnCentroids.features.length, 221);
assert.equal(
  wecaSatnCentroids.features.filter(
    (feature) => feature.properties.satn_feature_type === "community-centroid",
  ).length,
  111,
);
assert.equal(
  wecaSatnCentroids.features.filter(
    (feature) => feature.properties.satn_feature_type === "centroid-connection",
  ).length,
  110,
);
assert.equal(
  wecaSatnCentroids.features.some(
    (feature) => feature.properties.area_name === "Somer Valley",
  ),
  false,
);
assert.equal(
  wecaSatnCentroids.features.some(
    (feature) => feature.properties.area_name === "Radstock",
  ),
  true,
);
assert.equal(
  wecaSatnCentroids.features.some(
    (feature) => feature.properties.area_name === "Midsomer Norton",
  ),
  true,
);
for (const bathCentroidName of [
  "Bath city centre",
  "Walcot and London Road",
  "Lansdown and Camden",
  "Bathwick",
  "Widcombe",
  "Bear Flat",
  "Oldfield Park",
  "Moorlands",
  "Newbridge",
  "Claverton Down",
]) {
  assert.equal(
    wecaSatnCentroids.features.some(
      (feature) => feature.properties.area_name === bathCentroidName,
    ),
    true,
  );
}
assert.equal(wecaStrategicNetwork.type, "FeatureCollection");
assert.equal(wecaStrategicNetwork.features.length, 27);
assert.equal(
  wecaStrategicNetwork.features.filter(
    (feature) =>
      feature.properties.strategic_network_feature_type ===
      "core-interurban-link",
  ).length,
  18,
);
assert.equal(
  wecaStrategicNetwork.features.filter(
    (feature) =>
      feature.properties.strategic_network_feature_type ===
      "quiet-lane-opportunity",
  ).length,
  9,
);
assert.equal(
  wecaStrategicNetwork.features.some(
    (feature) =>
      feature.properties.corridor_name === "A370 Bristol to Weston-super-Mare",
  ),
  true,
);
assert.equal(
  wecaStrategicNetwork.features.some(
    (feature) =>
      feature.properties.default_treatment_intent ===
      "make-good-a-road-active-travel-corridor",
  ),
  true,
);
assert.equal(nationalCycleNetwork.type, "FeatureCollection");
assert.equal(
  nationalCycleNetwork.features.some(
    (feature) => feature.properties.ncn_status === "current",
  ),
  true,
);
assert.equal(
  nationalCycleNetwork.features.some(
    (feature) => feature.properties.ncn_status === "reclassified",
  ),
  true,
);
const knownSourceIds = new Set(
  sourceInventory.sources.map((source) => source.id),
);
for (const feature of bathSomerValleyAtmRoutes.features) {
  assert.equal(
    feature.properties.source_ids.every((sourceId) =>
      knownSourceIds.has(sourceId),
    ),
    true,
  );
}
assert.equal(
  existsSync("docs/product/bath-somer-valley-atm-extraction.md"),
  true,
);
const bathSomerValleyExtractionNote = await readFile(
  "docs/product/bath-somer-valley-atm-extraction.md",
  "utf8",
);
const bathSomerValleyExtractionNoteText =
  bathSomerValleyExtractionNote.replace(/\s+/g, " ");
assert.match(bathSomerValleyExtractionNoteText, /Bath to Somer Valley/i);
assert.match(bathSomerValleyExtractionNoteText, /Active Travel Masterplan Route Map/i);
assert.match(bathSomerValleyExtractionNoteText, /best-fit/i);
assert.match(bathSomerValleyExtractionNoteText, /ambigu/i);
assert.match(bathSomerValleyExtractionNoteText, /not official reusable council GeoJSON/i);

assert.equal(
  existsSync("docs/product/full-banes-atm-extraction-plan.md"),
  true,
);
const fullBanesExtractionPlan = await readFile(
  "docs/product/full-banes-atm-extraction-plan.md",
  "utf8",
);
const fullBanesExtractionPlanText = fullBanesExtractionPlan.replace(/\s+/g, " ");
assert.match(fullBanesExtractionPlanText, /full B&NES ATM route extraction/i);
assert.match(fullBanesExtractionPlanText, /data\/atm-route-extraction-schema\.json/i);
assert.match(fullBanesExtractionPlanText, /geographic batch/i);
assert.match(fullBanesExtractionPlanText, /ambiguous or unextractable/i);
assert.match(fullBanesExtractionPlanText, /not official reusable council GeoJSON/i);

assert.equal(sourceInventory.pilot_area, "Bath to Somer Valley");
assert.equal(sourceInventory.review_status, "reviewed-for-mvp");
assert.equal(
  sourceInventory.sources.some(
    (source) =>
      source.category === "a367-hypothesis" &&
      source.mvp_dataset_safety === "review-before-use" &&
      source.claim_limits.includes("not route preference"),
  ),
  true,
);
assert.equal(
  sourceInventory.sources.some(
    (source) =>
      source.category === "greenway-context" &&
      source.claim_limits.includes("not automatically preferred"),
  ),
  true,
);
assert.equal(
  sourceInventory.sources.some((source) =>
    ["unavailable-for-mvp", "unsuitable-for-mvp"].includes(
      source.mvp_dataset_safety,
    ),
  ),
  true,
);

await rm("tmp-route-tests", { recursive: true, force: true });
await mkdir("tmp-route-tests", { recursive: true });

await writeFile("tmp-route-tests/not-feature-collection.geojson", "{}\n");
assert.match(
  atmRoutesValidationFailure("tmp-route-tests/not-feature-collection.geojson"),
  /FeatureCollection/,
);

await writeFile(
  "tmp-route-tests/atm-feature-missing-properties.geojson",
  `${JSON.stringify(
    {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [-2.45, 51.29],
              [-2.42, 51.32],
            ],
          },
          properties: {},
        },
      ],
    },
    null,
    2,
  )}\n`,
);
assert.match(
  atmRoutesValidationFailure(
    "tmp-route-tests/atm-feature-missing-properties.geojson",
  ),
  /atm_route_id/,
);

await writeFile(
  "tmp-route-tests/atm-routes-unextractable-feature.geojson",
  `${JSON.stringify(
    {
      type: "FeatureCollection",
      metadata: {
        batch_id: "future-batch",
        batch_name: "Future batch",
        batch_area: "B&NES future batch",
        extraction_status: "planned-batch",
        geometry_precision: "unextractable",
        geometry_status: "ambiguous-or-unextractable",
        official_geometry: false,
        source_summary: "Public ATM map context requires review.",
        notes: "Planning fixture. This is not official reusable council GeoJSON.",
      },
      features: [
        {
          type: "Feature",
          geometry: null,
          properties: {
            atm_route_id: "atm-future-ambiguous-route",
            route_name: "Future ambiguous route",
            source_layer: "atm-route",
            source_atm_classification: "strategic",
            geometry_status: "ambiguous-or-unextractable",
            geometry_confidence: "unextractable",
            needs_human_spot_check: true,
            source_ids: ["banes-active-travel-masterplan-route-map"],
            provenance_notes:
              "The public ATM map identifies a route in this area.",
            uncertainty_notes:
              "The public map is too ambiguous to draw a best-fit geometry.",
          },
        },
      ],
    },
    null,
    2,
  )}\n`,
);
validateAtmRoutes("tmp-route-tests/atm-routes-unextractable-feature.geojson");

await writeFile(
  "tmp-route-tests/atm-routes-unknown-source.geojson",
  `${JSON.stringify(
    {
      type: "FeatureCollection",
      metadata: {
        batch_id: "future-batch",
        batch_name: "Future batch",
        batch_area: "B&NES future batch",
        extraction_status: "planned-batch",
        geometry_precision: "unextractable",
        geometry_status: "ambiguous-or-unextractable",
        official_geometry: false,
        source_summary: "Public ATM map context requires review.",
        notes: "Planning fixture. This is not official reusable council GeoJSON.",
      },
      features: [
        {
          type: "Feature",
          geometry: null,
          properties: {
            atm_route_id: "atm-future-unknown-source",
            route_name: "Future unknown source route",
            source_layer: "atm-route",
            source_atm_classification: "strategic",
            geometry_status: "ambiguous-or-unextractable",
            geometry_confidence: "unextractable",
            needs_human_spot_check: true,
            source_ids: ["unknown-source"],
            provenance_notes:
              "The public ATM map identifies a route in this area.",
            uncertainty_notes:
              "The public map is too ambiguous to draw a best-fit geometry.",
          },
        },
      ],
    },
    null,
    2,
  )}\n`,
);
assert.match(
  atmRoutesValidationFailure("tmp-route-tests/atm-routes-unknown-source.geojson"),
  /unknown-source/,
);

await writeFile(
  "tmp-route-tests/atm-routes-missing-batch-metadata.geojson",
  `${JSON.stringify(
    {
      type: "FeatureCollection",
      metadata: {},
      features: [],
    },
    null,
    2,
  )}\n`,
);
assert.match(
  atmRoutesValidationFailure(
    "tmp-route-tests/atm-routes-missing-batch-metadata.geojson",
  ),
  /metadata\.batch_id/,
);

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

function validateDestinations(destinationFile) {
  return execFileSync("node", ["scripts/validate-destinations.mjs", destinationFile], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function destinationValidationFailure(destinationFile) {
  try {
    validateDestinations(destinationFile);
  } catch (error) {
    assert.notEqual(error.status, 0);
    return error.stderr;
  }

  assert.fail(`Expected destination validation to fail for ${destinationFile}`);
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

const completeDestinationRecord = {
  destination_id: "somer-valley-education-destinations",
  destination_name: "Somer Valley education destinations",
  destination_type: "school-cluster",
  pilot_area: "Bath to Somer Valley",
  destination_status: "indicative-source-context",
  location_status: "indicative",
  display_position: {
    x: 68,
    y: 62,
  },
  source_ids: ["dfe-get-information-about-schools", "os-open-names"],
  related_route_ids: ["prototype-somer-valley-school-access-review"],
  school_access_relevance: "high",
  provenance_notes:
    "Use DfE school records and OS Open Names before replacing this cluster.",
  uncertainty_notes:
    "This is destination context only, not catchment analysis.",
  claim_limits:
    "destination context only; no school-run impact; no catchment coverage; no route preference; no quantified modal-shift claims",
};

const supportingRouteDetail = formatRouteDetail({
  ...completeRouteRecord,
  route_name: "Two Tunnels and Colliers Way source corridor",
  corridor_name: "Bath to Somer Valley",
  network_status: "supporting",
  network_role: "greenway-strategic-link",
  modal_shift_potential: "medium",
  age12_standard_target: "partial-after-intervention",
  school_access_relevance: "low",
  broad_intervention_need: "existing-route-may-be-sufficient",
  why_this_route_matters:
    "This route keeps strategic greenway context visible for review.",
  what_needs_review:
    "Review whether its role is leisure, utility, strategic, or mixed.",
  evidence_notes: "Greenway evidence is useful context, not a final decision.",
  provenance_notes: "Uses reviewed public source inventory entries.",
});

assert.deepEqual(supportingRouteDetail.summary, {
  title: "Two Tunnels and Colliers Way source corridor",
  corridor: "Bath to Somer Valley",
  networkStatus: "Supporting route",
  networkRole: "Greenway strategic link",
  modalShiftPotential: "Medium modal shift potential",
  age12Target: "Partial after intervention",
  schoolAccessRelevance: "Low school access relevance",
  broadInterventionNeed: "Existing route may be sufficient",
});
assert.equal(
  supportingRouteDetail.whyThisRouteMatters,
  "This route keeps strategic greenway context visible for review.",
);
assert.equal(
  supportingRouteDetail.whatNeedsReview,
  "Review whether its role is leisure, utility, strategic, or mixed.",
);
assert.deepEqual(supportingRouteDetail.notes, [
  "Greenway evidence is useful context, not a final decision.",
  "Uses reviewed public source inventory entries.",
  "Open MVP evidence questions remain unresolved.",
]);

const routeStatusCaveats = routeContract.allowedValues.network_status.map(
  (network_status) => [
    network_status,
    formatRouteDetail({
      ...completeRouteRecord,
      network_status,
    }).statusCaveat,
  ],
);

assert.deepEqual(routeStatusCaveats, [
  [
    "preferred",
    "Preferred in this simplified layer means a candidate investment priority for review; it does not mean the route is already safe or usable today.",
  ],
  [
    "supporting",
    "Supporting route means useful network context or connection; it is separate from a preferred investment status.",
  ],
  [
    "not-preferred",
    "Not preferred in this simplified layer means the prototype is not prioritising this route; it does not delete source evidence or make a final route decision.",
  ],
  [
    "needs-review",
    "Needs review means the available evidence is not enough to assign a stronger prototype status.",
  ],
]);

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

await writeFile(
  "tmp-route-tests/valid-destinations.json",
  `${JSON.stringify([completeDestinationRecord], null, 2)}\n`,
);

validateDestinations("tmp-route-tests/valid-destinations.json");

const destinationWithoutProvenance = { ...completeDestinationRecord };
delete destinationWithoutProvenance.provenance_notes;

await writeFile(
  "tmp-route-tests/destination-missing-provenance.json",
  `${JSON.stringify([destinationWithoutProvenance], null, 2)}\n`,
);

assert.match(
  destinationValidationFailure(
    "tmp-route-tests/destination-missing-provenance.json",
  ),
  /provenance_notes/,
);

const destinationWithUnknownSource = {
  ...completeDestinationRecord,
  source_ids: ["unknown-source"],
};

await writeFile(
  "tmp-route-tests/destination-unknown-source.json",
  `${JSON.stringify([destinationWithUnknownSource], null, 2)}\n`,
);

assert.match(
  destinationValidationFailure("tmp-route-tests/destination-unknown-source.json"),
  /unknown-source/,
);

const destinationWithUnsafeSource = {
  ...completeDestinationRecord,
  source_ids: ["dft-bus-open-data-service"],
};

await writeFile(
  "tmp-route-tests/destination-unsafe-source.json",
  `${JSON.stringify([destinationWithUnsafeSource], null, 2)}\n`,
);

assert.match(
  destinationValidationFailure("tmp-route-tests/destination-unsafe-source.json"),
  /safe-for-first-prototype/,
);

assert.equal(existsSync("data/pilot-routes.json"), true);
validateRoutes("data/pilot-routes.json");
assert.equal(existsSync("data/pilot-destinations.json"), true);
validateDestinations("data/pilot-destinations.json");

const pilotRoutes = JSON.parse(
  await readFile("data/pilot-routes.json", "utf8"),
);
const pilotDestinations = JSON.parse(
  await readFile("data/pilot-destinations.json", "utf8"),
);
const pilotRouteLayers = new Set(pilotRoutes.map((route) => route.route_layer));
assert.equal(pilotRoutes.length >= 4, true);
assert.equal(pilotRoutes.length <= 6, true);
assert.equal(pilotRouteLayers.has("atm-background"), true);
assert.equal(pilotRouteLayers.has("prototype-simplified"), true);

const pilotDestinationTypes = new Set(
  pilotDestinations.map((destination) => destination.destination_type),
);
assert.equal(pilotDestinationTypes.has("school-cluster"), true);
assert.equal(pilotDestinationTypes.has("settlement-centre"), true);

const sourceInventoryIds = new Set(
  sourceInventory.sources.map((source) => source.id),
);
for (const destination of pilotDestinations) {
  assert.equal(
    destination.source_ids.every((sourceId) => sourceInventoryIds.has(sourceId)),
    true,
  );
}

const allowedDataStatuses = new Set([
  "source-context",
  "prototype",
  "hypothesis",
]);
for (const route of pilotRoutes) {
  assert.equal(allowedDataStatuses.has(route.data_status), true);
}
const a367Route = pilotRoutes.find((route) => /a367/i.test(route.route_id));
assert.equal(a367Route.data_status, "hypothesis");
assert.notEqual(a367Route.network_status, "preferred");

const allowedGeometrySources = new Set([
  "official-map-context",
  "manual-prototype-sketch",
  "not-included",
]);
for (const route of pilotRoutes) {
  assert.equal(allowedGeometrySources.has(route.geometry_source), true);
  assert.equal(Array.isArray(route.source_ids), true);
  assert.equal(route.source_ids.length > 0, true);
}
for (const route of pilotRoutes.filter(
  (route) => route.route_layer === "prototype-simplified",
)) {
  assert.equal(route.route_geometry_status, "prototype-indicative");
  assert.match(route.route_geometry_notes, /prototype|indicative/i);
}
const { hydrateLeafletRouteMap, renderRouteMap } = await import("../src/route-map.mjs");
const renderedRouteMap = renderRouteMap(pilotRoutes, {
  atmRoutesGeoJson: bathSomerValleyAtmRoutes,
  wecaLcwipUrbanAreasGeoJson: wecaLcwipUrbanAreas,
  wecaSatnCentroidsGeoJson: wecaSatnCentroids,
  wecaStrategicNetworkGeoJson: wecaStrategicNetwork,
  nationalCycleNetworkGeoJson: nationalCycleNetwork,
});
const renderedRouteMapWithDestinations = renderRouteMap(pilotRoutes, {
  atmRoutesGeoJson: bathSomerValleyAtmRoutes,
  wecaLcwipUrbanAreasGeoJson: wecaLcwipUrbanAreas,
  wecaSatnCentroidsGeoJson: wecaSatnCentroids,
  wecaStrategicNetworkGeoJson: wecaStrategicNetwork,
  nationalCycleNetworkGeoJson: nationalCycleNetwork,
  destinations: pilotDestinations,
  showDestinations: true,
});
const renderedSelectedRouteMap = renderRouteMap(pilotRoutes, {
  atmRoutesGeoJson: bathSomerValleyAtmRoutes,
  wecaLcwipUrbanAreasGeoJson: wecaLcwipUrbanAreas,
  wecaSatnCentroidsGeoJson: wecaSatnCentroids,
  wecaStrategicNetworkGeoJson: wecaStrategicNetwork,
  nationalCycleNetworkGeoJson: nationalCycleNetwork,
  selectedRouteId: "prototype-a367-utility-corridor-hypothesis",
});
const renderedSelectedSchoolRouteMap = renderRouteMap(pilotRoutes, {
  atmRoutesGeoJson: bathSomerValleyAtmRoutes,
  wecaLcwipUrbanAreasGeoJson: wecaLcwipUrbanAreas,
  wecaSatnCentroidsGeoJson: wecaSatnCentroids,
  wecaStrategicNetworkGeoJson: wecaStrategicNetwork,
  nationalCycleNetworkGeoJson: nationalCycleNetwork,
  destinations: pilotDestinations,
  selectedRouteId: "prototype-somer-valley-school-access-review",
  showDestinations: true,
});
assert.match(renderedRouteMap, /Original ATM-style source evidence/i);
assert.match(renderedRouteMap, /Simplified prototype layer/i);
assert.match(renderedRouteMap, /data-leaflet-route-map/i);
assert.match(renderedRouteMap, /OpenStreetMap contributors/i);
assert.match(renderedRouteMap, /Visible ATM\/context geometry/i);
assert.match(renderedRouteMap, /7 checked-in best-fit lon\/lat features/i);
assert.match(renderedRouteMap, /data-map-layer="source-context"/i);
assert.match(renderedRouteMap, /data-map-layer="urban-evidence"/i);
assert.match(renderedRouteMap, /14 bounded LCWIP urban areas/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="atm-strategic"/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="atm-quiet"/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="atm-community-connections"/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="atm-missing-pavement"/i);
assert.match(renderedRouteMap, /data-map-layer-action="select-all"/i);
assert.match(renderedRouteMap, /data-map-layer-action="clear-all"/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="urban-evidence"/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="weca-strategic-network"/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="quiet-lane-opportunities"/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="deprecated-ncn-opportunities"/i);
assert.match(renderedRouteMap, /data-map-layer-toggle="national-cycle-network"/i);
assert.match(renderedRouteMap, /221 community centroid\/connector features/i);
assert.match(renderedRouteMap, /data-map-layer="weca-strategic-network"/i);
assert.match(renderedRouteMap, /18 prioritised corridor links/i);
assert.match(renderedRouteMap, /data-map-layer="quiet-lane-opportunities"/i);
assert.match(renderedRouteMap, /9 supporting reach or greenway opportunity features/i);
assert.match(renderedRouteMap, /data-map-layer="deprecated-ncn-opportunities"/i);
assert.match(renderedRouteMap, /855 current and reclassified\/former NCN features/i);
assert.match(renderedRouteMap, /data-map-layer="national-cycle-network"/i);
assert.match(renderedRouteMap, /reclassified\/former features/i);
assert.match(renderedRouteMap, /not official alignments/i);
assert.match(renderedRouteMap, /data-route-layer="atm-background"/i);
assert.match(renderedRouteMap, /data-route-layer="prototype-simplified"/i);
assert.match(renderedRouteMap, /<button[^>]+data-route-id="/i);
assert.match(renderedRouteMap, /aria-controls="route-detail"/i);
assert.match(renderedRouteMap, /--route-stroke:#b8c2cc/i);
assert.match(renderedRouteMap, /--route-opacity:0\.45/i);
assert.match(renderedRouteMap, /data-route-status-label="Needs review"/i);
assert.match(renderedRouteMap, /data-modal-shift-label="Unknown modal shift potential"/i);
assert.equal(
  renderedRouteMap.indexOf('data-route-layer="atm-background"') <
    renderedRouteMap.indexOf('data-route-layer="prototype-simplified"'),
  true,
);

assert.match(renderedRouteMap, /prototype-indicative/i);
assert.match(renderedRouteMap, /manual-prototype-sketch/i);
assert.match(renderedRouteMap, /not a final preferred alignment/i);

const hydratedMap = hydrateRouteMapWithFakeLeaflet({
  atmRoutesGeoJson: bathSomerValleyAtmRoutes,
  routes: pilotRoutes,
});
assert.equal(hydratedMap.tileUrls[0], "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
assert.equal(hydratedMap.geoJsonFeatureCounts.includes(7), true);
assert.equal(hydratedMap.prototypeFeatures.length, 0);
assert.equal(hydratedMap.prototypeRouteClickHandlers.length, 0);

const hydratedSelectedPrototypeMap = hydrateRouteMapWithFakeLeaflet({
  atmRoutesGeoJson: bathSomerValleyAtmRoutes,
  routes: pilotRoutes,
  selectedRouteId: "prototype-somer-valley-school-access-review",
});
assert.equal(hydratedSelectedPrototypeMap.geoJsonFeatureCounts.includes(1), true);
const somerValleyPrototypeFeature = hydratedSelectedPrototypeMap.prototypeFeatures.find(
  (feature) =>
    feature.properties?.route_id ===
    "prototype-somer-valley-school-access-review",
);
assert.deepEqual(
  somerValleyPrototypeFeature.geometry.coordinates.slice(0, 2),
  [
    [-2.485, 51.285],
    [-2.471, 51.287],
  ],
);
assert.equal(
  containsSegment(somerValleyPrototypeFeature.geometry.coordinates, [
    -2.529,
    51.298,
  ], [
    -2.448,
    51.293,
  ]),
  false,
);
hydratedSelectedPrototypeMap.prototypeRouteClickHandlers[0]();
assert.equal(
  hydratedSelectedPrototypeMap.selectedRouteIds[0],
  "prototype-somer-valley-school-access-review",
);

assert.match(renderedRouteMapWithDestinations, /School and key destination context/i);
assert.match(renderedRouteMapWithDestinations, /data-destination-layer="pilot-destinations"/i);
assert.match(renderedRouteMapWithDestinations, /data-destination-id="somer-valley-education-destinations"/i);
assert.match(renderedRouteMapWithDestinations, /Somer Valley education destinations/i);
assert.match(renderedRouteMapWithDestinations, /indicative-source-context/i);
assert.match(renderedRouteMapWithDestinations, /no school-run impact/i);
assert.match(renderedRouteMapWithDestinations, /data-destination-toggle/i);
assert.match(renderedRouteMapWithDestinations, /checked/i);

assert.match(renderedRouteMap, /Route data:/i);
assert.match(renderedRouteMap, /checked-in pilot dataset/i);
assert.match(renderedRouteMap, /B&amp;NES Active Travel Masterplan source context/i);

assert.match(renderedSelectedRouteMap, /id="route-detail"/i);
assert.match(renderedSelectedRouteMap, /A367 utility-corridor hypothesis/i);
assert.match(renderedSelectedRouteMap, /Needs review/i);
assert.match(renderedSelectedRouteMap, /Utility spine/i);
assert.match(renderedSelectedRouteMap, /Unknown modal shift potential/i);
assert.match(
  renderedSelectedRouteMap,
  /Unknown age-12 independent travel target/i,
);
assert.match(renderedSelectedRouteMap, /Unknown school access relevance/i);
assert.match(renderedSelectedRouteMap, /Officer review needed/i);
assert.match(renderedSelectedRouteMap, /Why this route matters/i);
assert.match(renderedSelectedRouteMap, /What needs review/i);
assert.match(renderedSelectedRouteMap, /Evidence and provenance/i);
assert.match(renderedSelectedRouteMap, /not a final preferred alignment/i);
assert.doesNotMatch(renderedSelectedRouteMap, /final route decision/i);

assert.match(renderedSelectedSchoolRouteMap, /class="route-detail-destinations"/i);
assert.match(renderedSelectedSchoolRouteMap, /Route-linked destination context/i);
assert.match(renderedSelectedSchoolRouteMap, /Somer Valley education destinations/i);
assert.match(renderedSelectedSchoolRouteMap, /High school access relevance/i);
assert.match(renderedSelectedSchoolRouteMap, /no school-run impact/i);
assert.doesNotMatch(renderedSelectedSchoolRouteMap, /school-run reduction/i);

const pilotRoutesText = JSON.stringify(pilotRoutes);
assert.doesNotMatch(
  pilotRoutesText,
  /\d+\s*(%|percent|car-mile|car mile|school-run|school run|modal shift|funding eligibility)/i,
);

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
assert.equal(existsSync("dist/route-details.mjs"), true);
assert.equal(existsSync("dist/app.mjs"), true);
assert.equal(existsSync("dist/route-map.mjs"), true);
assert.equal(existsSync("dist/data/pilot-routes.json"), true);
assert.equal(existsSync("dist/data/pilot-destinations.json"), true);
assert.equal(existsSync("dist/data/atm-routes-bath-somer-valley.geojson"), true);
assert.equal(existsSync("dist/data/weca-lcwip-urban-areas.geojson"), true);
assert.equal(existsSync("dist/data/weca-satn-centroids.geojson"), true);
assert.equal(existsSync("dist/data/weca-strategic-network.geojson"), true);
assert.equal(existsSync("dist/data/national-cycle-network.geojson"), true);

const page = await readFile("dist/index.html", "utf8");
const visibleText = page.replace(/\s+/g, " ");

assert.match(page, /href="styles\.css"/i);
assert.match(
  page,
  /type="module" src="app\.mjs\?v=ncn-review-current-20260521"/i,
);

const clientScript = await readFile("dist/app.mjs", "utf8");
assert.match(clientScript, /hydrateLeafletRouteMap/i);
assert.match(clientScript, /renderRouteMap/i);
assert.match(clientScript, /route-map\.mjs\?v=ncn-review-current-20260521/i);
assert.match(clientScript, /pilot-routes\.json/i);
assert.match(clientScript, /pilot-destinations\.json/i);
assert.match(clientScript, /atm-routes-bath-somer-valley\.geojson/i);
assert.match(clientScript, /weca-lcwip-urban-areas\.geojson/i);
assert.match(clientScript, /weca-satn-centroids\.geojson/i);
assert.match(clientScript, /weca-strategic-network\.geojson/i);
assert.match(clientScript, /national-cycle-network\.geojson/i);
assert.match(clientScript, /leaflet@1\.9\.4/i);
assert.match(clientScript, /innerHTML\s*=\s*renderRouteMap/i);
assert.match(clientScript, /hydrateLeafletRouteMap/i);
assert.match(clientScript, /addEventListener\("click"/i);
assert.match(clientScript, /closest\("\[data-route-id\]"\)/i);
assert.match(clientScript, /closest\("\[data-destination-toggle\]"\)/i);
assert.match(clientScript, /closest\("\[data-map-layer-toggle\]"\)/i);
assert.match(clientScript, /closest\("\[data-map-layer-action\]"\)/i);
assert.match(clientScript, /selectedRouteId/i);
assert.match(clientScript, /showDestinations/i);
assert.match(clientScript, /showAtmStrategicLayer\s*=\s*false/i);
assert.match(clientScript, /showUrbanEvidenceLayer\s*=\s*false/i);
assert.match(clientScript, /showWecaStrategicNetworkLayer/i);
assert.match(clientScript, /showWecaStrategicNetworkLayer\s*=\s*true/i);
assert.match(clientScript, /showDeprecatedNcnOpportunitiesLayer/i);

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
assert.match(visibleText, /Core inter-urban network/i);
assert.match(visibleText, /Core WECA inter-urban A-road corridor/i);
assert.match(visibleText, /Phase 3 quiet-lane and greenway reach/i);
assert.match(visibleText, /Phase 4 NCN review/i);
assert.match(visibleText, /current routes to protect\/upgrade/i);

const styles = await readFile("dist/styles.css", "utf8");
assert.match(styles, /route-layer-background[\s\S]*opacity:\s*0\.[0-9]+/i);
assert.match(styles, /route-layer-prototype[\s\S]*border-left:\s*[4-9]px/i);
assert.match(styles, /route-line[\s\S]*cursor:\s*pointer/i);
assert.match(styles, /route-detail-panel/i);
assert.match(styles, /destination-layer/i);
assert.match(styles, /destination-marker/i);
assert.match(styles, /destination-toggle/i);
assert.match(styles, /route-detail-destinations/i);
assert.match(styles, /map-attribution/i);

assert.equal(existsSync("README.md"), true);
const readme = await readFile("README.md", "utf8");
const readmeText = readme.replace(/\s+/g, " ");
assert.match(readmeText, /independent proof of concept/i);
assert.match(readmeText, /not.*official council/i);
assert.match(readmeText, /GitHub Pages/i);
assert.match(readmeText, /prototype data assumptions/i);
assert.match(readmeText, /npm run validate:routes -- path\/to\/routes\.json/i);
assert.match(readmeText, /data\/pilot-routes\.json/i);
assert.match(readmeText, /pilot source inventory/i);
assert.match(readmeText, /npm run validate:sources/i);
assert.match(readmeText, /pilot destination dataset/i);
assert.match(readmeText, /data\/pilot-destinations\.json/i);
assert.match(readmeText, /npm run validate:destinations/i);
assert.match(readmeText, /no school-run impact/i);

assert.equal(existsSync(".github/workflows/pages.yml"), true);
const workflow = await readFile(".github/workflows/pages.yml", "utf8");
assert.match(workflow, /github-pages/i);
assert.match(workflow, /npm run build/i);

assert.equal(
  existsSync("docs/product/first-review-ready-prototype-review.md"),
  true,
);
const firstReviewNote = await readFile(
  "docs/product/first-review-ready-prototype-review.md",
  "utf8",
);
const firstReviewNoteText = firstReviewNote.replace(/\s+/g, " ");
assert.match(firstReviewNoteText, /first review-ready prototype pass/i);
assert.match(firstReviewNoteText, /Maintainer sign-off completed/i);
assert.match(firstReviewNoteText, /approved to share/i);
assert.match(firstReviewNoteText, /independent personal proof-of-concept/i);
assert.match(firstReviewNoteText, /not.*council.*endorsed/i);
assert.match(firstReviewNoteText, /not.*WECA.*endorsed/i);
assert.match(firstReviewNoteText, /A367 utility-corridor hypothesis/i);
assert.match(firstReviewNoteText, /not.*settled preferred route/i);
assert.match(firstReviewNoteText, /clickable indicative route sketch/i);
assert.match(firstReviewNoteText, /route data provenance/i);
assert.match(firstReviewNoteText, /uncertainty/i);
assert.match(firstReviewNoteText, /non-specialist reviewer/i);
assert.match(firstReviewNoteText, /unresolved/i);
assert.doesNotMatch(
  firstReviewNoteText,
  /\d+\s*(%|percent|car-mile|car mile|school-run|school run|modal shift|funding eligibility)/i,
);

assert.equal(existsSync("CONTEXT.md"), true);
const domainContext = await readFile("CONTEXT.md", "utf8");
const domainContextText = domainContext.replace(/\s+/g, " ");
assert.match(domainContextText, /ATM Source Layer/i);
assert.match(domainContextText, /Review Corridor Layer/i);
assert.match(domainContextText, /Destination Context Layer/i);
assert.match(domainContextText, /Uncertainty Layer/i);
assert.match(domainContextText, /ATM Dataset Manifest/i);
assert.match(domainContextText, /Extraction Batch/i);
assert.match(domainContextText, /B&NES-Wide Full Product Pass/i);
assert.doesNotMatch(domainContextText, /combined dataset/i);
assert.doesNotMatch(domainContextText, /before deepening every Review Corridor/i);

const requiredAdrFiles = [
  "docs/adr/0001-separate-atm-source-layer-from-prototype-prioritisation.md",
  "docs/adr/0002-use-review-corridors-as-the-product-unit.md",
  "docs/adr/0003-use-atm-dataset-manifest-instead-of-source-mega-file.md",
  "docs/adr/0004-require-evidence-backed-review-corridors.md",
  "docs/adr/0005-build-agent-led-extraction-pipeline.md",
  "docs/adr/0006-start-with-banes-wide-full-product-pass.md",
  "docs/adr/0007-use-explicit-unknowns-in-banes-wide-product.md",
  "docs/adr/0008-require-four-map-layer-families.md",
  "docs/adr/0009-make-source-prototype-conflicts-explicit.md",
  "docs/adr/0010-keep-review-workflow-read-only-in-the-app.md",
];
for (const adrFile of requiredAdrFiles) {
  assert.equal(existsSync(adrFile), true, `${adrFile} should exist`);
}

function hydrateRouteMapWithFakeLeaflet(options) {
  const originalWindow = globalThis.window;
  const tileUrls = [];
  const geoJsonFeatureCounts = [];
  const prototypeFeatures = [];
  const prototypeRouteClickHandlers = [];
  const selectedRouteIds = [];
  const root = {
    querySelector(selector) {
      assert.equal(selector, "[data-leaflet-route-map]");
      return {};
    },
  };

  globalThis.window = {
    L: {
      map() {
        return {
          fitBounds(bounds, fitOptions) {
            assert.deepEqual(bounds, [["bounds"]]);
            assert.deepEqual(fitOptions, { padding: [18, 18] });
          },
        };
      },
      tileLayer(url, tileOptions) {
        tileUrls.push(url);
        assert.match(tileOptions.attribution, /OpenStreetMap contributors/i);
        return {
          addTo() {
            return {};
          },
        };
      },
      geoJSON(featureCollection, geoJsonOptions = {}) {
        geoJsonFeatureCounts.push(featureCollection.features.length);
        if (
          featureCollection.features.some(
            (feature) =>
              feature.properties?.source_layer === "prototype-prioritisation",
          )
        ) {
          prototypeFeatures.push(...featureCollection.features);
        }
        for (const feature of featureCollection.features) {
          const layer = {
            on(eventName, handler) {
              assert.equal(eventName, "click");
              prototypeRouteClickHandlers.push(handler);
            },
          };
          geoJsonOptions.onEachFeature?.(feature, layer);
          geoJsonOptions.style?.(feature);
        }
        return {
          addTo() {
            return {};
          },
        };
      },
      featureGroup() {
        return {
          getBounds() {
            return [["bounds"]];
          },
        };
      },
    },
  };

  try {
    hydrateLeafletRouteMap(root, {
      ...options,
      onRouteSelect(routeId) {
        selectedRouteIds.push(routeId);
      },
    });
  } finally {
    globalThis.window = originalWindow;
  }

  return {
    geoJsonFeatureCounts,
    prototypeFeatures,
    prototypeRouteClickHandlers,
    selectedRouteIds,
    tileUrls,
  };
}

function containsSegment(coordinates, start, end) {
  return coordinates.some((coordinate, index) => {
    const previous = coordinates[index - 1];
    return (
      previous &&
      previous[0] === start[0] &&
      previous[1] === start[1] &&
      coordinate[0] === end[0] &&
      coordinate[1] === end[1]
    );
  });
}

await rm("tmp-route-tests", { recursive: true, force: true });
