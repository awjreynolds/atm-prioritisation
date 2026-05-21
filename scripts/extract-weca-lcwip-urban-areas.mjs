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
const additionalBuiltUpAreaCentroids = [
  { id: "satn-centroid-saltford", name: "Saltford", componentNames: ["Saltford"] },
  {
    id: "satn-centroid-peasedown-st-john",
    name: "Peasedown St John",
    componentNames: ["Peasedown St John"],
  },
  { id: "satn-centroid-paulton", name: "Paulton", componentNames: ["Paulton"] },
  { id: "satn-centroid-yate", name: "Yate", componentNames: ["Yate"] },
  {
    id: "satn-centroid-chipping-sodbury",
    name: "Chipping Sodbury",
    componentNames: ["Chipping Sodbury"],
  },
  { id: "satn-centroid-thornbury", name: "Thornbury", componentNames: ["Thornbury"] },
  { id: "satn-centroid-clevedon", name: "Clevedon", componentNames: ["Clevedon"] },
  { id: "satn-centroid-nailsea", name: "Nailsea", componentNames: ["Nailsea"] },
  { id: "satn-centroid-portishead", name: "Portishead", componentNames: ["Portishead"] },
  {
    id: "satn-centroid-weston-super-mare",
    name: "Weston-super-Mare",
    componentNames: ["Weston-super-Mare"],
  },
];
const manualCentroids = [
  {
    id: "satn-centroid-westfield",
    name: "Westfield",
    coordinates: [-2.4728, 51.2766],
    centroidSource: "manual-place-centroid",
  },
  {
    id: "satn-centroid-frome",
    name: "Frome",
    coordinates: [-2.3215, 51.2308],
    centroidSource: "manual-edge-context-centroid",
  },
  {
    id: "satn-centroid-clifton-whiteladies",
    name: "Clifton Village and Whiteladies Road",
    coordinates: [-2.6118, 51.4593],
    centroidSource: "manual-lcwip-city-village-centroid",
  },
  {
    id: "satn-centroid-shirehampton",
    name: "Shirehampton",
    coordinates: [-2.6799, 51.4888],
    centroidSource: "manual-lcwip-city-village-centroid",
  },
  {
    id: "satn-centroid-westbury-henleaze-southmead",
    name: "Westbury-on-Trym, Henleaze and Southmead",
    coordinates: [-2.6078, 51.4936],
    centroidSource: "manual-lcwip-city-village-centroid",
  },
  {
    id: "satn-centroid-gloucester-road",
    name: "Gloucester Road",
    coordinates: [-2.5926, 51.4746],
    centroidSource: "manual-lcwip-city-village-centroid",
  },
  {
    id: "satn-centroid-knowle-totterdown",
    name: "Knowle and Totterdown",
    coordinates: [-2.5744, 51.4388],
    centroidSource: "manual-lcwip-city-village-centroid",
  },
  {
    id: "satn-centroid-fishponds-church-road",
    name: "Fishponds and Church Road",
    coordinates: [-2.5266, 51.4787],
    centroidSource: "manual-lcwip-city-village-centroid",
  },
  {
    id: "satn-centroid-bedminster-southville",
    name: "Bedminster and Southville",
    coordinates: [-2.6035, 51.4413],
    centroidSource: "manual-lcwip-city-village-centroid",
  },
  {
    id: "satn-centroid-hartcliffe-hengrove",
    name: "Hartcliffe and Hengrove Park",
    coordinates: [-2.5939, 51.4086],
    centroidSource: "manual-lcwip-city-village-centroid",
  },
  {
    id: "satn-centroid-larkhall",
    name: "Larkhall",
    coordinates: [-2.3488, 51.3972],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-odd-down",
    name: "Odd Down",
    coordinates: [-2.3776, 51.3538],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-twerton",
    name: "Twerton",
    coordinates: [-2.3994, 51.3793],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-combe-down",
    name: "Combe Down",
    coordinates: [-2.3525, 51.3547],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-weston-bath",
    name: "Weston, Bath",
    coordinates: [-2.3909, 51.3891],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-bathampton",
    name: "Bathampton",
    coordinates: [-2.3227, 51.393],
    centroidSource: "manual-city-village-centroid",
  },
];

const componentNames = [
  ...areaDefinitions.flatMap((area) => area.componentNames),
  ...additionalBuiltUpAreaCentroids.flatMap((area) => area.componentNames),
];
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
const satnCentroids = [
  ...areaDefinitions.map((area) => {
    const components = area.componentNames.map((name) => sourceFeatures.get(name));

    return {
      id: `${area.id}-centroid`,
      areaId: area.id,
      name: area.name,
      coordinates: centroidsByAreaId.get(area.id),
      componentBuiltUpAreas: area.componentNames,
      centroidSource: "ons-built-up-area-centroid",
      provenanceNotes:
        "Community centroid derived from ONS 2022 built-up-area centroid coordinates.",
      weightArea: components.reduce(
        (total, feature) => total + Number(feature.properties.Shape__Area ?? 0),
        0,
      ),
    };
  }),
  ...additionalBuiltUpAreaCentroids.map((area) => {
    const components = area.componentNames.map((name) => sourceFeatures.get(name));

    return {
      id: area.id,
      areaId: area.id,
      name: area.name,
      coordinates: areaCentroid(components),
      componentBuiltUpAreas: area.componentNames,
      centroidSource: "ons-built-up-area-centroid",
      provenanceNotes:
        "Community centroid derived from ONS 2022 built-up-area centroid coordinates.",
      weightArea: components.reduce(
        (total, feature) => total + Number(feature.properties.Shape__Area ?? 0),
        0,
      ),
    };
  }),
  ...manualCentroids.map((centroid) => ({
    ...centroid,
    areaId: centroid.id,
    componentBuiltUpAreas: [],
    provenanceNotes:
      "Manual city-village centroid added for SATN-style local context where ONS built-up areas do not expose a separate internal neighbourhood polygon.",
    weightArea: 0,
  })),
];
const satnConnections = minimumSpanningTree(satnCentroids);
assertNoCrossingConnections(satnConnections, satnCentroids);
const centroidById = new Map(satnCentroids.map((centroid) => [centroid.id, centroid]));
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
      "SATN-style community centroids derived from ONS built-up-area centroids plus explicit city-village centroids. Connector lines are generated as a non-crossing minimum spanning tree.",
  },
  features: [
    ...satnCentroids.map((centroid) => ({
      type: "Feature",
      id: centroid.id,
      geometry: {
        type: "Point",
        coordinates: centroid.coordinates,
      },
      properties: {
        satn_feature_type: "community-centroid",
        lcwip_area_id: centroid.areaId,
        area_name: centroid.name,
        component_built_up_areas: centroid.componentBuiltUpAreas,
        centroid_source: centroid.centroidSource,
        provenance_notes: centroid.provenanceNotes,
      },
    })),
    ...satnConnections.map(({ fromId, toId }) => {
      const fromCentroid = centroidById.get(fromId);
      const toCentroid = centroidById.get(toId);

      return {
        type: "Feature",
        id: `satn-connection-${fromId.replace(/^(lcwip-urban-|satn-centroid-)/, "")}-${toId.replace(/^(lcwip-urban-|satn-centroid-)/, "")}`,
        geometry: {
          type: "LineString",
          coordinates: [fromCentroid.coordinates, toCentroid.coordinates],
        },
        properties: {
          satn_feature_type: "centroid-connection",
          from_area_id: fromId,
          to_area_id: toId,
          from_area_name: fromCentroid.name,
          to_area_name: toCentroid.name,
          connection_rule: "non-crossing-minimum-spanning-tree",
          provenance_notes:
            "Indicative SATN-style connection between community centroids. Connector set is generated as a non-crossing minimum spanning tree.",
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

function minimumSpanningTree(centroids) {
  const connectedIds = new Set([centroids[0].id]);
  const connections = [];

  while (connectedIds.size < centroids.length) {
    let bestConnection = null;

    for (const fromCentroid of centroids) {
      if (!connectedIds.has(fromCentroid.id)) {
        continue;
      }

      for (const toCentroid of centroids) {
        if (connectedIds.has(toCentroid.id)) {
          continue;
        }

        const candidate = {
          fromId: fromCentroid.id,
          toId: toCentroid.id,
          distance: squaredDistance(
            fromCentroid.coordinates,
            toCentroid.coordinates,
          ),
        };

        if (!bestConnection || candidate.distance < bestConnection.distance) {
          bestConnection = candidate;
        }
      }
    }

    connections.push(bestConnection);
    connectedIds.add(bestConnection.toId);
  }

  return connections;
}

function assertNoCrossingConnections(connections, centroids) {
  const centroidById = new Map(
    centroids.map((centroid) => [centroid.id, centroid.coordinates]),
  );

  for (let firstIndex = 0; firstIndex < connections.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < connections.length;
      secondIndex += 1
    ) {
      const first = connections[firstIndex];
      const second = connections[secondIndex];

      if (
        first.fromId === second.fromId ||
        first.fromId === second.toId ||
        first.toId === second.fromId ||
        first.toId === second.toId
      ) {
        continue;
      }

      if (
        segmentsIntersect(
          centroidById.get(first.fromId),
          centroidById.get(first.toId),
          centroidById.get(second.fromId),
          centroidById.get(second.toId),
        )
      ) {
        throw new Error(
          `SATN connector lines cross: ${first.fromId}-${first.toId} and ${second.fromId}-${second.toId}`,
        );
      }
    }
  }
}

function squaredDistance(first, second) {
  return (first[0] - second[0]) ** 2 + (first[1] - second[1]) ** 2;
}

function segmentsIntersect(a, b, c, d) {
  return (
    orientation(a, c, d) !== orientation(b, c, d) &&
    orientation(a, b, c) !== orientation(a, b, d)
  );
}

function orientation(a, b, c) {
  const value = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);

  if (Math.abs(value) < 1e-12) {
    return 0;
  }

  return value > 0 ? 1 : 2;
}

function roundCoordinate(value) {
  return Number(value.toFixed(7));
}
