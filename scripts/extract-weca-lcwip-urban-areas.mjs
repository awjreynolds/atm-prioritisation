import { mkdir, writeFile } from "node:fs/promises";

const sourceServiceUrl =
  "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/BUA_2022_GB/FeatureServer/0/query";
const outputFile = new URL(
  "../data/weca-lcwip-urban-areas.geojson",
  import.meta.url,
);
const centroidConnectionsOutputFile = new URL(
  "../data/weca-satn-centroids.geojson",
  import.meta.url,
);
const wecaLcwipUrl =
  "https://www.westofengland-ca.gov.uk/wp-content/uploads/2022/04/Full-LCWIP-Jan-2021.pdf";

const areaDefinitions = [
  {
    id: "lcwip-urban-bristol",
    name: "Bristol",
    componentNames: ["Bristol"],
    lcwipEvidence: "WECA LCWIP Bristol walking/cycling urban area context.",
  },
  {
    id: "lcwip-urban-bath-batheaston",
    name: "Bath and Batheaston",
    componentNames: ["Bath", "Batheaston"],
    lcwipEvidence: "WECA LCWIP Bath urban area context.",
  },
  {
    id: "lcwip-urban-keynsham",
    name: "Keynsham",
    componentNames: ["Keynsham"],
    lcwipEvidence: "WECA LCWIP Keynsham urban area context.",
  },
  {
    id: "lcwip-urban-somer-valley",
    name: "Somer Valley",
    componentNames: ["Radstock", "Midsomer Norton"],
    lcwipEvidence: "WECA LCWIP Somer Valley urban area context.",
  },
];
const centroidConnections = [
  ["lcwip-urban-bristol", "lcwip-urban-keynsham"],
  ["lcwip-urban-keynsham", "lcwip-urban-bath-batheaston"],
  ["lcwip-urban-keynsham", "lcwip-urban-somer-valley"],
  ["lcwip-urban-bath-batheaston", "lcwip-urban-somer-valley"],
];

const componentNames = areaDefinitions.flatMap((area) => area.componentNames);
const where = `BUA22NM IN (${componentNames
  .map((name) => `'${name.replaceAll("'", "''")}'`)
  .join(",")})`;
const sourceUrl = `${sourceServiceUrl}?where=${encodeURIComponent(
  where,
)}&outFields=BUA22CD,BUA22NM,LONG,LAT,Shape__Area&returnGeometry=true&outSR=4326&f=geojson`;

const response = await fetch(sourceUrl);

if (!response.ok) {
  throw new Error(`Unable to fetch ONS built-up areas: ${response.status}`);
}

const sourceGeoJson = await response.json();
const sourceFeatures = new Map(
  (sourceGeoJson.features ?? []).map((feature) => [
    feature.properties?.BUA22NM,
    feature,
  ]),
);
const missingComponents = componentNames.filter((name) => !sourceFeatures.has(name));

if (missingComponents.length > 0) {
  throw new Error(`Missing ONS built-up areas: ${missingComponents.join(", ")}`);
}

const featureCollection = {
  type: "FeatureCollection",
  name: "WECA LCWIP urban areas",
  metadata: {
    source_boundary_dataset: "ONS Built Up Areas (December 2022) Boundaries GB BGG",
    source_boundary_url:
      "https://geoportal.statistics.gov.uk/datasets/ons::built-up-areas-december-2022-boundaries-gb-bgg",
    source_lcwip_url: wecaLcwipUrl,
    extracted_at: new Date().toISOString(),
    notes:
      "LCWIP/SATN urban-area context represented with ONS 2022 built-up-area boundaries and grouped into the requested WECA LCWIP areas.",
  },
  features: areaDefinitions.map((area) => {
    const components = area.componentNames.map((name) => sourceFeatures.get(name));

    return {
      type: "Feature",
      id: area.id,
      geometry: {
        type: "MultiPolygon",
        coordinates: components.flatMap((feature) =>
          multiPolygonCoordinates(feature.geometry),
        ),
      },
      properties: {
        lcwip_area_id: area.id,
        area_name: area.name,
        area_type: "lcwip-urban-area",
        component_built_up_areas: components.map(
          (feature) => feature.properties.BUA22NM,
        ),
        component_built_up_area_codes: components.map(
          (feature) => feature.properties.BUA22CD,
        ),
        source_boundary_dataset:
          "ONS Built Up Areas (December 2022) Boundaries GB BGG",
        source_lcwip_document:
          "West of England Local Cycling and Walking Infrastructure Plan 2020-2036",
        source_lcwip_url: wecaLcwipUrl,
        provenance_notes: area.lcwipEvidence,
      },
    };
  }),
};
const centroidsByAreaId = new Map(
  areaDefinitions.map((area) => {
    const components = area.componentNames.map((name) => sourceFeatures.get(name));
    return [area.id, areaCentroid(components)];
  }),
);
const areaDefinitionById = new Map(areaDefinitions.map((area) => [area.id, area]));
const centroidConnectionCollection = {
  type: "FeatureCollection",
  name: "WECA SATN community centroids and connections",
  metadata: {
    source_boundary_dataset: "ONS Built Up Areas (December 2022) Boundaries GB BGG",
    source_boundary_url:
      "https://geoportal.statistics.gov.uk/datasets/ons::built-up-areas-december-2022-boundaries-gb-bgg",
    source_lcwip_url: wecaLcwipUrl,
    extracted_at: featureCollection.metadata.extracted_at,
    notes:
      "SATN-style community centroids derived from grouped ONS built-up-area centroids. Connector lines are a simple non-crossing network between the requested LCWIP urban areas.",
  },
  features: [
    ...areaDefinitions.map((area) => ({
      type: "Feature",
      id: `${area.id}-centroid`,
      geometry: {
        type: "Point",
        coordinates: centroidsByAreaId.get(area.id),
      },
      properties: {
        satn_feature_type: "community-centroid",
        lcwip_area_id: area.id,
        area_name: area.name,
        component_built_up_areas: area.componentNames,
        provenance_notes:
          "Community centroid derived from ONS 2022 built-up-area centroid coordinates.",
      },
    })),
    ...centroidConnections.map(([fromAreaId, toAreaId]) => {
      const fromArea = areaDefinitionById.get(fromAreaId);
      const toArea = areaDefinitionById.get(toAreaId);

      return {
        type: "Feature",
        id: `satn-connection-${fromAreaId.replace("lcwip-urban-", "")}-${toAreaId.replace("lcwip-urban-", "")}`,
        geometry: {
          type: "LineString",
          coordinates: [centroidsByAreaId.get(fromAreaId), centroidsByAreaId.get(toAreaId)],
        },
        properties: {
          satn_feature_type: "centroid-connection",
          from_area_id: fromAreaId,
          to_area_id: toAreaId,
          from_area_name: fromArea.name,
          to_area_name: toArea.name,
          connection_rule: "non-crossing-centroid-connector",
          provenance_notes:
            "Indicative SATN-style connection between community centroids. Connector set is intentionally non-crossing.",
        },
      };
    }),
  ],
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(featureCollection, null, 2)}\n`);
await writeFile(
  centroidConnectionsOutputFile,
  `${JSON.stringify(centroidConnectionCollection, null, 2)}\n`,
);

console.log(
  `Extracted ${featureCollection.features.length} WECA LCWIP urban areas to ${outputFile.pathname}`,
);
console.log(
  `Extracted ${centroidConnectionCollection.features.length} WECA SATN centroid features to ${centroidConnectionsOutputFile.pathname}`,
);

function multiPolygonCoordinates(geometry) {
  if (geometry?.type === "MultiPolygon") {
    return geometry.coordinates;
  }

  if (geometry?.type === "Polygon") {
    return [geometry.coordinates];
  }

  throw new Error(`Unsupported ONS built-up-area geometry: ${geometry?.type}`);
}

function areaCentroid(components) {
  const totalArea = components.reduce(
    (total, feature) => total + Number(feature.properties.Shape__Area ?? 0),
    0,
  );

  if (totalArea === 0) {
    return [
      roundCoordinate(
        components.reduce((total, feature) => total + feature.properties.LONG, 0) /
          components.length,
      ),
      roundCoordinate(
        components.reduce((total, feature) => total + feature.properties.LAT, 0) /
          components.length,
      ),
    ];
  }

  return [
    roundCoordinate(
      components.reduce(
        (total, feature) =>
          total + feature.properties.LONG * Number(feature.properties.Shape__Area),
        0,
      ) / totalArea,
    ),
    roundCoordinate(
      components.reduce(
        (total, feature) =>
          total + feature.properties.LAT * Number(feature.properties.Shape__Area),
        0,
      ) / totalArea,
    ),
  ];
}

function roundCoordinate(value) {
  return Number(value.toFixed(7));
}
