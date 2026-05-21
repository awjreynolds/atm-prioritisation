import { mkdir, writeFile } from "node:fs/promises";

const outputFile = new URL("../data/national-cycle-network.geojson", import.meta.url);
const mapExtent = "-2.8,51.15,-2.15,51.55";
const layers = [
  {
    status: "current",
    sourceName: "National Cycle Network (Public)",
    serviceUrl:
      "https://services5.arcgis.com/1ZHcUS1lwPTg4ms0/arcgis/rest/services/National_Cycle_Network_Public/FeatureServer/0/query",
    outFields:
      "Desc_,Greenway,RouteType,RouteNo,LinkNo,RouteCat,OpenStatus,Surface,Quality,Lighting,RoadClass,SegmentID",
  },
  {
    status: "reclassified",
    sourceName: "Reclassified Routes (Public)",
    serviceUrl:
      "https://services5.arcgis.com/1ZHcUS1lwPTg4ms0/arcgis/rest/services/Reclassified_Routes_Public/FeatureServer/0/query",
    outFields: "Desc_,GlobalID",
  },
];

const features = [];

for (const layer of layers) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: layer.outFields,
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
    geometry: mapExtent,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
  });
  const response = await fetch(`${layer.serviceUrl}?${params}`);

  if (!response.ok) {
    throw new Error(`Unable to fetch ${layer.sourceName}: ${response.status}`);
  }

  const geoJson = await response.json();
  features.push(
    ...(geoJson.features ?? []).map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        source_layer: "national-cycle-network",
        ncn_status: layer.status,
        source_dataset: layer.sourceName,
      },
    })),
  );
}

const featureCollection = {
  type: "FeatureCollection",
  name: "National Cycle Network and reclassified routes",
  metadata: {
    extracted_at: new Date().toISOString(),
    source_current:
      "https://www.arcgis.com/home/item.html?id=5defd254e78745bfb12d0456abc1bcf1",
    source_reclassified:
      "https://www.arcgis.com/home/item.html?id=fbb7b0ceeb30470c973596ee4b7a58b9",
    notes:
      "Current NCN and public reclassified/former route features clipped by query extent around the West of England/B&NES prototype map.",
  },
  features,
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(featureCollection, null, 2)}\n`);

console.log(
  `Extracted ${features.length} NCN current/reclassified features to ${outputFile.pathname}`,
);
