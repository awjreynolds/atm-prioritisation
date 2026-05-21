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
const satnUrbanCentroidDefinitions = [
  ...areaDefinitions.filter((area) => area.id !== "lcwip-urban-somer-valley"),
  {
    id: "satn-centroid-radstock",
    name: "Radstock",
    componentNames: ["Radstock"],
  },
  {
    id: "satn-centroid-midsomer-norton",
    name: "Midsomer Norton",
    componentNames: ["Midsomer Norton"],
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
  {
    id: "satn-centroid-bath-city-centre",
    name: "Bath city centre",
    coordinates: [-2.3591, 51.3811],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-walcot-london-road",
    name: "Walcot and London Road",
    coordinates: [-2.3511, 51.3883],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-lansdown-camden",
    name: "Lansdown and Camden",
    coordinates: [-2.3641, 51.3919],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-bathwick",
    name: "Bathwick",
    coordinates: [-2.3456, 51.383],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-widcombe",
    name: "Widcombe",
    coordinates: [-2.3542, 51.3755],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-bear-flat",
    name: "Bear Flat",
    coordinates: [-2.3657, 51.3705],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-oldfield-park",
    name: "Oldfield Park",
    coordinates: [-2.3826, 51.3767],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-moorlands",
    name: "Moorlands",
    coordinates: [-2.3872, 51.368],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-newbridge",
    name: "Newbridge",
    coordinates: [-2.4022, 51.3851],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-claverton-down",
    name: "Claverton Down",
    coordinates: [-2.3278, 51.3756],
    centroidSource: "manual-city-village-centroid",
  },
  {
    id: "satn-centroid-bathford",
    name: "Bathford",
    coordinates: [-2.3009, 51.3976],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-freshford",
    name: "Freshford",
    coordinates: [-2.3034, 51.3427],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-limpley-stoke",
    name: "Limpley Stoke",
    coordinates: [-2.3148, 51.3477],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-monkton-combe",
    name: "Monkton Combe",
    coordinates: [-2.327, 51.3565],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-southstoke",
    name: "South Stoke",
    coordinates: [-2.3604, 51.3518],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-combe-hay",
    name: "Combe Hay",
    coordinates: [-2.402, 51.3385],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-tunley",
    name: "Tunley",
    coordinates: [-2.4322, 51.3408],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-dunkerton",
    name: "Dunkerton",
    coordinates: [-2.4238, 51.3279],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-wellow",
    name: "Wellow",
    coordinates: [-2.3747, 51.3232],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-shoscombe",
    name: "Shoscombe",
    coordinates: [-2.4154, 51.3003],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-camerton",
    name: "Camerton",
    coordinates: [-2.4537, 51.316],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-priston",
    name: "Priston",
    coordinates: [-2.4395, 51.3428],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-englishcombe",
    name: "Englishcombe",
    coordinates: [-2.4059, 51.3583],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-corston",
    name: "Corston",
    coordinates: [-2.4415, 51.3829],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-newton-st-loe",
    name: "Newton St Loe",
    coordinates: [-2.4496, 51.3792],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-kelston",
    name: "Kelston",
    coordinates: [-2.435, 51.4018],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-marksbury",
    name: "Marksbury",
    coordinates: [-2.4792, 51.3604],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-farmborough",
    name: "Farmborough",
    coordinates: [-2.487, 51.3436],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-timsbury",
    name: "Timsbury",
    coordinates: [-2.4765, 51.3256],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-high-littleton",
    name: "High Littleton",
    coordinates: [-2.5098, 51.3245],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-hallatrow",
    name: "Hallatrow",
    coordinates: [-2.5265, 51.3185],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-farrington-gurney",
    name: "Farrington Gurney",
    coordinates: [-2.5307, 51.297],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-clutton",
    name: "Clutton",
    coordinates: [-2.5427, 51.329],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-temple-cloud",
    name: "Temple Cloud",
    coordinates: [-2.543, 51.3201],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-pensford",
    name: "Pensford",
    coordinates: [-2.5484, 51.3718],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-stanton-drew",
    name: "Stanton Drew",
    coordinates: [-2.5753, 51.3676],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-chew-magna",
    name: "Chew Magna",
    coordinates: [-2.6108, 51.3676],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-chew-stoke",
    name: "Chew Stoke",
    coordinates: [-2.6306, 51.3533],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-bishop-sutton",
    name: "Bishop Sutton",
    coordinates: [-2.5945, 51.3355],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-whitchurch-village",
    name: "Whitchurch Village",
    coordinates: [-2.5602, 51.4066],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-bitton",
    name: "Bitton",
    coordinates: [-2.4616, 51.4235],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-wick",
    name: "Wick",
    coordinates: [-2.4247, 51.453],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-oldland-common",
    name: "Oldland Common",
    coordinates: [-2.4755, 51.4418],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-longwell-green",
    name: "Longwell Green",
    coordinates: [-2.4999, 51.4397],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-warmley",
    name: "Warmley",
    coordinates: [-2.4779, 51.46],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-emersons-green",
    name: "Emersons Green",
    coordinates: [-2.4774, 51.4932],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-mangotsfield",
    name: "Mangotsfield",
    coordinates: [-2.499, 51.4871],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-pucklechurch",
    name: "Pucklechurch",
    coordinates: [-2.4346, 51.4853],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-winterbourne",
    name: "Winterbourne",
    coordinates: [-2.5045, 51.5232],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-frampton-cotterell",
    name: "Frampton Cotterell",
    coordinates: [-2.4778, 51.5251],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-coalpit-heath",
    name: "Coalpit Heath",
    coordinates: [-2.4681, 51.5166],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-westerleigh",
    name: "Westerleigh",
    coordinates: [-2.4357, 51.5185],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-stoke-gifford",
    name: "Stoke Gifford",
    coordinates: [-2.5401, 51.516],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-bradley-stoke",
    name: "Bradley Stoke",
    coordinates: [-2.547, 51.5352],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-patchway",
    name: "Patchway",
    coordinates: [-2.5847, 51.5314],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-filton",
    name: "Filton",
    coordinates: [-2.5761, 51.5107],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-almondsbury",
    name: "Almondsbury",
    coordinates: [-2.5711, 51.5541],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-long-ashton",
    name: "Long Ashton",
    coordinates: [-2.6608, 51.4298],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-pill",
    name: "Pill",
    coordinates: [-2.6828, 51.481],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-abbots-leigh",
    name: "Abbots Leigh",
    coordinates: [-2.6678, 51.461],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-backwell",
    name: "Backwell",
    coordinates: [-2.7381, 51.4144],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-flax-bourton",
    name: "Flax Bourton",
    coordinates: [-2.6998, 51.4213],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-wrington",
    name: "Wrington",
    coordinates: [-2.7623, 51.3618],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-congresbury",
    name: "Congresbury",
    coordinates: [-2.8106, 51.3715],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-yatton",
    name: "Yatton",
    coordinates: [-2.8235, 51.3885],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-cleeve",
    name: "Cleeve",
    coordinates: [-2.7843, 51.3902],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-wraxall",
    name: "Wraxall",
    coordinates: [-2.7265, 51.4425],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-tickenham",
    name: "Tickenham",
    coordinates: [-2.8034, 51.4469],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-banwell",
    name: "Banwell",
    coordinates: [-2.8671, 51.3281],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-winscombe",
    name: "Winscombe",
    coordinates: [-2.8312, 51.3124],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-sandford",
    name: "Sandford",
    coordinates: [-2.8354, 51.3317],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-churchill",
    name: "Churchill",
    coordinates: [-2.8029, 51.3333],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-blagdon",
    name: "Blagdon",
    coordinates: [-2.7171, 51.3264],
    centroidSource: "manual-village-centroid",
  },
  {
    id: "satn-centroid-norton-st-philip",
    name: "Norton St Philip",
    coordinates: [-2.3238, 51.3028],
    centroidSource: "manual-edge-village-centroid",
  },
  {
    id: "satn-centroid-rode",
    name: "Rode",
    coordinates: [-2.2818, 51.2839],
    centroidSource: "manual-edge-village-centroid",
  },
  {
    id: "satn-centroid-kilmersdon",
    name: "Kilmersdon",
    coordinates: [-2.4381, 51.2698],
    centroidSource: "manual-edge-village-centroid",
  },
  {
    id: "satn-centroid-holcombe",
    name: "Holcombe",
    coordinates: [-2.4664, 51.2491],
    centroidSource: "manual-edge-village-centroid",
  },
  {
    id: "satn-centroid-chilcompton",
    name: "Chilcompton",
    coordinates: [-2.5068, 51.2603],
    centroidSource: "manual-edge-village-centroid",
  },
  {
    id: "satn-centroid-oakhill",
    name: "Oakhill",
    coordinates: [-2.5276, 51.2245],
    centroidSource: "manual-edge-village-centroid",
  },
  {
    id: "satn-centroid-chewton-mendip",
    name: "Chewton Mendip",
    coordinates: [-2.5797, 51.2762],
    centroidSource: "manual-edge-village-centroid",
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
  satnUrbanCentroidDefinitions.map((area) => {
    const components = area.componentNames.map((name) => sourceFeatures.get(name));
    return [area.id, areaCentroid(components)];
  }),
);
const satnCentroids = [
  ...satnUrbanCentroidDefinitions.map((area) => {
    const components = area.componentNames.map((name) => sourceFeatures.get(name));

    return {
      id: area.id.startsWith("satn-centroid-") ? area.id : `${area.id}-centroid`,
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
