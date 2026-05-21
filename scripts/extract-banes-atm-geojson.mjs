import { mkdir, writeFile } from "node:fs/promises";

const sourceUrl =
  "https://bathnes.maps.xmap.cloud/bathnes_public/ows?typeName=final_february25&service=WFS&version=1.1.0&request=GetFeature&outputFormat=application/json&SrsName=urn:ogc:def:crs:EPSG::27700";
const outputFile = new URL("../data/banes-atm-full.geojson", import.meta.url);

const response = await fetch(sourceUrl);

if (!response.ok) {
  throw new Error(`Unable to fetch BANES ATM GeoJSON: ${response.status}`);
}

const sourceGeoJson = await response.json();
const extractedAt = new Date().toISOString();
const convertedGeoJson = {
  type: "FeatureCollection",
  name: "Full B&NES Active Travel Masterplan portal geometry",
  metadata: {
    source_url: sourceUrl,
    source_layer: "bathnes_public:final_february25",
    source_title: "B&NES planned Active Travel routes portal",
    extracted_at: extractedAt,
    original_crs: "EPSG:27700",
    output_crs: "EPSG:4326",
    feature_count: sourceGeoJson.features?.length ?? 0,
    notes:
      "Extracted from the public B&NES map portal WFS and converted from British National Grid to lon/lat for Leaflet display.",
  },
  features: (sourceGeoJson.features ?? []).map((feature) => ({
    type: "Feature",
    id: feature.id,
    geometry: convertGeometry(feature.geometry),
    properties: {
      portal_feature_id: feature.id,
      fid: feature.properties?.fid ?? null,
      name: feature.properties?.name ?? "",
      source_atm_classification: feature.properties?.type_2 ?? "Unknown",
      source_layer: "banes-atm-portal",
      provenance_notes:
        "Public B&NES Active Travel Masterplan portal layer bathnes_public:final_february25.",
    },
  })),
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(convertedGeoJson, null, 2)}\n`);

console.log(
  `Extracted ${convertedGeoJson.features.length} BANES ATM features to ${outputFile.pathname}`,
);

function convertGeometry(geometry) {
  if (!geometry) {
    return null;
  }

  if (geometry.type === "LineString") {
    return {
      type: "LineString",
      coordinates: geometry.coordinates.map(convertBngToLonLat),
    };
  }

  if (geometry.type === "MultiLineString") {
    return {
      type: "MultiLineString",
      coordinates: geometry.coordinates.map((line) =>
        line.map(convertBngToLonLat),
      ),
    };
  }

  throw new Error(`Unsupported BANES ATM geometry type: ${geometry.type}`);
}

function convertBngToLonLat([eastings, northings]) {
  const airy1830 = {
    a: 6377563.396,
    b: 6356256.909,
    f0: 0.9996012717,
    lat0: radians(49),
    lon0: radians(-2),
    n0: -100000,
    e0: 400000,
  };
  const e2 =
    1 - (airy1830.b * airy1830.b) / (airy1830.a * airy1830.a);
  const n = (airy1830.a - airy1830.b) / (airy1830.a + airy1830.b);
  let lat = airy1830.lat0;
  let meridionalArc = 0;

  do {
    lat =
      (northings - airy1830.n0 - meridionalArc) /
        (airy1830.a * airy1830.f0) +
      lat;
    meridionalArc = calculateMeridionalArc(lat, airy1830, n);
  } while (Math.abs(northings - airy1830.n0 - meridionalArc) >= 0.00001);

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const tanLat = Math.tan(lat);
  const nu =
    (airy1830.a * airy1830.f0) / Math.sqrt(1 - e2 * sinLat * sinLat);
  const rho =
    (airy1830.a * airy1830.f0 * (1 - e2)) /
    Math.pow(1 - e2 * sinLat * sinLat, 1.5);
  const eta2 = nu / rho - 1;
  const dE = eastings - airy1830.e0;

  const vii = tanLat / (2 * rho * nu);
  const viii =
    (tanLat / (24 * rho * Math.pow(nu, 3))) *
    (5 + 3 * tanLat ** 2 + eta2 - 9 * tanLat ** 2 * eta2);
  const ix =
    (tanLat / (720 * rho * Math.pow(nu, 5))) *
    (61 + 90 * tanLat ** 2 + 45 * tanLat ** 4);
  const x = 1 / (cosLat * nu);
  const xi =
    (1 / (6 * cosLat * nu ** 3)) * (nu / rho + 2 * tanLat ** 2);
  const xii =
    (1 / (120 * cosLat * nu ** 5)) *
    (5 +
      28 * tanLat ** 2 +
      24 * tanLat ** 4);
  const xiia =
    (1 / (5040 * cosLat * nu ** 7)) *
    (61 +
      662 * tanLat ** 2 +
      1320 * tanLat ** 4 +
      720 * tanLat ** 6);

  const osgbLat = lat - vii * dE ** 2 + viii * dE ** 4 - ix * dE ** 6;
  const osgbLon =
    airy1830.lon0 + x * dE - xi * dE ** 3 + xii * dE ** 5 - xiia * dE ** 7;
  const wgs84 = helmertOsgb36ToWgs84(osgbLat, osgbLon, 0);

  return [roundCoordinate(degrees(wgs84.lon)), roundCoordinate(degrees(wgs84.lat))];
}

function calculateMeridionalArc(lat, grid, n) {
  return (
    grid.b *
    grid.f0 *
    ((1 + n + (5 / 4) * n ** 2 + (5 / 4) * n ** 3) *
      (lat - grid.lat0) -
      (3 * n + 3 * n ** 2 + (21 / 8) * n ** 3) *
        Math.sin(lat - grid.lat0) *
        Math.cos(lat + grid.lat0) +
      ((15 / 8) * n ** 2 + (15 / 8) * n ** 3) *
        Math.sin(2 * (lat - grid.lat0)) *
        Math.cos(2 * (lat + grid.lat0)) -
      (35 / 24) *
        n ** 3 *
        Math.sin(3 * (lat - grid.lat0)) *
        Math.cos(3 * (lat + grid.lat0)))
  );
}

function helmertOsgb36ToWgs84(lat, lon, height) {
  const osgb36 = { a: 6377563.396, b: 6356256.909 };
  const wgs84 = { a: 6378137.0, b: 6356752.3141 };
  const cartesian = latLonToCartesian(lat, lon, height, osgb36);
  const transformed = {
    x:
      446.448 +
      (1 + 20.4894e-6) * cartesian.x +
      radians(0.1502 / 3600) * cartesian.y -
      radians(0.2470 / 3600) * cartesian.z,
    y:
      -125.157 -
      radians(0.1502 / 3600) * cartesian.x +
      (1 + 20.4894e-6) * cartesian.y -
      radians(0.8421 / 3600) * cartesian.z,
    z:
      542.06 +
      radians(0.2470 / 3600) * cartesian.x +
      radians(0.8421 / 3600) * cartesian.y +
      (1 + 20.4894e-6) * cartesian.z,
  };

  return cartesianToLatLon(transformed, wgs84);
}

function latLonToCartesian(lat, lon, height, datum) {
  const e2 = 1 - (datum.b * datum.b) / (datum.a * datum.a);
  const nu = datum.a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);

  return {
    x: (nu + height) * Math.cos(lat) * Math.cos(lon),
    y: (nu + height) * Math.cos(lat) * Math.sin(lon),
    z: ((1 - e2) * nu + height) * Math.sin(lat),
  };
}

function cartesianToLatLon({ x, y, z }, datum) {
  const e2 = 1 - (datum.b * datum.b) / (datum.a * datum.a);
  const p = Math.sqrt(x * x + y * y);
  let lat = Math.atan2(z, p * (1 - e2));
  let previousLat;

  do {
    previousLat = lat;
    const nu = datum.a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
    lat = Math.atan2(z + e2 * nu * Math.sin(lat), p);
  } while (Math.abs(lat - previousLat) > 1e-12);

  return {
    lat,
    lon: Math.atan2(y, x),
  };
}

function radians(degreesValue) {
  return (degreesValue * Math.PI) / 180;
}

function degrees(radiansValue) {
  return (radiansValue * 180) / Math.PI;
}

function roundCoordinate(value) {
  return Number(value.toFixed(7));
}
