import { readFile } from "node:fs/promises";

const [geoJsonFile] = process.argv.slice(2);

if (!geoJsonFile) {
  console.error("Usage: node scripts/validate-atm-routes.mjs <routes.geojson>");
  process.exit(1);
}

const geoJson = JSON.parse(await readFile(geoJsonFile, "utf8"));
const errors = [];
const allowedGeometryTypes = new Set(["LineString", "MultiLineString"]);
const allowedSourceLayers = new Set([
  "atm-route",
  "context-greenway",
  "context-route",
]);
const allowedGeometryConfidence = new Set(["high", "medium", "low"]);
const requiredProperties = [
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
];
const officialGeometryPattern =
  /\bofficial\s+(reusable\s+)?(council\s+)?(geojson|geometry)\b/i;
const bounds = {
  minLon: -2.65,
  maxLon: -2.25,
  minLat: 51.2,
  maxLat: 51.45,
};

if (geoJson.type !== "FeatureCollection") {
  errors.push("ATM route dataset must be a GeoJSON FeatureCollection.");
}

if (!Array.isArray(geoJson.features)) {
  errors.push("ATM route dataset must include a features array.");
}

if (Array.isArray(geoJson.features)) {
  geoJson.features.forEach((feature, featureIndex) => {
    const featureLabel =
      feature?.properties?.atm_route_id ?? `feature ${featureIndex + 1}`;

    if (feature?.type !== "Feature") {
      errors.push(`${featureLabel}: feature must have type "Feature"`);
      return;
    }

    if (!allowedGeometryTypes.has(feature.geometry?.type)) {
      errors.push(
        `${featureLabel}: geometry must be LineString or MultiLineString`,
      );
    } else {
      for (const coordinate of coordinatesFor(feature.geometry)) {
        if (!isCoordinatePair(coordinate)) {
          errors.push(`${featureLabel}: coordinates must be lon/lat pairs`);
          continue;
        }

        const [lon, lat] = coordinate;
        if (
          lon < bounds.minLon ||
          lon > bounds.maxLon ||
          lat < bounds.minLat ||
          lat > bounds.maxLat
        ) {
          errors.push(
            `${featureLabel}: coordinate ${lon},${lat} is outside B&NES pilot bounds`,
          );
        }
      }
    }

    const properties = feature.properties;
    if (properties === null || typeof properties !== "object") {
      errors.push(`${featureLabel}: properties must be an object`);
      return;
    }

    for (const property of requiredProperties) {
      if (!(property in properties)) {
        errors.push(`${featureLabel}: missing required property "${property}"`);
      } else if (
        typeof properties[property] === "string" &&
        properties[property].trim() === ""
      ) {
        errors.push(`${featureLabel}: required property "${property}" cannot be blank`);
      }
    }

    if (
      "source_layer" in properties &&
      !allowedSourceLayers.has(properties.source_layer)
    ) {
      errors.push(
        `${featureLabel}: unsupported source_layer "${properties.source_layer}"`,
      );
    }

    if (
      "geometry_status" in properties &&
      properties.geometry_status !== "best-fit-extracted-from-public-atm-map"
    ) {
      errors.push(
        `${featureLabel}: geometry_status must be "best-fit-extracted-from-public-atm-map"`,
      );
    }

    if (
      "geometry_confidence" in properties &&
      !allowedGeometryConfidence.has(properties.geometry_confidence)
    ) {
      errors.push(
        `${featureLabel}: unsupported geometry_confidence "${properties.geometry_confidence}"`,
      );
    }

    if (
      properties.geometry_confidence === "low" &&
      properties.needs_human_spot_check !== true
    ) {
      errors.push(
        `${featureLabel}: low-confidence features must set needs_human_spot_check true`,
      );
    }

    if (!Array.isArray(properties.source_ids) || properties.source_ids.length === 0) {
      errors.push(`${featureLabel}: source_ids must be a non-empty array`);
    }

    if (
      impliesOfficialGeometry(properties.provenance_notes ?? "") ||
      impliesOfficialGeometry(properties.uncertainty_notes ?? "")
    ) {
      errors.push(`${featureLabel}: notes must not imply official reusable geometry`);
    }
  });
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

function coordinatesFor(geometry) {
  if (geometry.type === "LineString") {
    return geometry.coordinates ?? [];
  }

  return (geometry.coordinates ?? []).flat();
}

function isCoordinatePair(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((coordinate) => typeof coordinate === "number")
  );
}

function impliesOfficialGeometry(value) {
  const text = String(value);
  return officialGeometryPattern.test(text) && !/not\s+official/i.test(text);
}
