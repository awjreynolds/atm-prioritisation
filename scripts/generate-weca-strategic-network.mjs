import { mkdir, writeFile } from "node:fs/promises";

const outputFile = new URL("../data/weca-strategic-network.geojson", import.meta.url);

const strategicBackboneCorridors = [
  corridor("backbone-a4-bristol-bath", "A4 Bristol to Bath via Keynsham", "primary-a-road-backbone", "a-road-adjacent-path-preferred", "A4", [
    [-2.5879, 51.4545],
    [-2.511, 51.449],
    [-2.4977, 51.4311],
    [-2.4585, 51.4072],
    [-2.3905, 51.395],
    [-2.3591, 51.3811],
  ]),
  corridor("backbone-a367-bath-radstock-msn", "A367 Bath to Radstock and Midsomer Norton", "primary-a-road-backbone", "a-road-adjacent-path-preferred", "A367", [
    [-2.3591, 51.3811],
    [-2.3776, 51.3538],
    [-2.4322, 51.3408],
    [-2.4519, 51.291],
    [-2.4846, 51.2855],
  ]),
  corridor("backbone-a362-msn-frome", "A362 Midsomer Norton to Frome gateway", "external-gateway-backbone", "a-road-adjacent-path-preferred", "A362", [
    [-2.4846, 51.2855],
    [-2.4381, 51.2698],
    [-2.3215, 51.2308],
  ], { external_gateway: "Frome" }),
  corridor("backbone-a37-bristol-somer-valley", "A37 Bristol to Somer Valley", "primary-a-road-backbone", "a-road-adjacent-path-preferred", "A37", [
    [-2.5879, 51.4545],
    [-2.5602, 51.4066],
    [-2.5484, 51.3718],
    [-2.5307, 51.297],
    [-2.4846, 51.2855],
  ]),
  corridor("backbone-a39-bath-wells", "A39 Bath to Wells gateway", "external-gateway-backbone", "parallel-quiet-route-to-assess", "A39", [
    [-2.3591, 51.3811],
    [-2.4415, 51.3829],
    [-2.543, 51.3201],
    [-2.5797, 51.2762],
    [-2.648, 51.209],
  ], { external_gateway: "Wells" }),
  corridor("backbone-a4-bath-chippenham", "A4 Bath to Chippenham gateway", "external-gateway-backbone", "a-road-adjacent-path-preferred", "A4", [
    [-2.3591, 51.3811],
    [-2.3009, 51.3976],
    [-2.214, 51.417],
    [-2.115, 51.46],
  ], { external_gateway: "Chippenham/Corsham" }),
  corridor("backbone-a363-bath-bradford-trowbridge", "A363 Bath to Bradford-on-Avon and Trowbridge gateway", "external-gateway-backbone", "a-road-adjacent-path-preferred", "A363", [
    [-2.3591, 51.3811],
    [-2.3278, 51.3756],
    [-2.252, 51.346],
    [-2.208, 51.319],
  ], { external_gateway: "Bradford-on-Avon/Trowbridge" }),
  corridor("backbone-a432-bristol-yate", "A432 Bristol to Yate", "primary-a-road-backbone", "a-road-adjacent-path-preferred", "A432", [
    [-2.5879, 51.4545],
    [-2.5266, 51.4787],
    [-2.4774, 51.4932],
    [-2.416, 51.541],
  ]),
  corridor("backbone-a432-yate-chipping-sodbury", "A432 Yate to Chipping Sodbury", "primary-a-road-backbone", "a-road-adjacent-path-preferred", "A432", [
    [-2.416, 51.541],
    [-2.393, 51.538],
  ]),
  corridor("backbone-a38-bristol-thornbury", "A38 Bristol to Thornbury", "primary-a-road-backbone", "a-road-adjacent-path-preferred", "A38", [
    [-2.5879, 51.4545],
    [-2.5761, 51.5107],
    [-2.5711, 51.5541],
    [-2.521, 51.608],
  ]),
  corridor("backbone-a370-bristol-weston", "A370 Bristol to Weston-super-Mare", "primary-a-road-backbone", "a-road-adjacent-path-preferred", "A370", [
    [-2.5879, 51.4545],
    [-2.6608, 51.4298],
    [-2.7381, 51.4144],
    [-2.8235, 51.3885],
    [-2.977, 51.346],
  ]),
  corridor("backbone-a369-bristol-portishead", "A369 Bristol to Portishead", "primary-a-road-backbone", "a-road-adjacent-path-preferred", "A369", [
    [-2.5879, 51.4545],
    [-2.6678, 51.461],
    [-2.6828, 51.481],
    [-2.769, 51.485],
  ]),
  corridor("backbone-a371-weston-wells", "A371 Weston-super-Mare to Wells gateway", "external-gateway-backbone", "parallel-quiet-route-to-assess", "A371", [
    [-2.977, 51.346],
    [-2.8671, 51.3281],
    [-2.8029, 51.3333],
    [-2.7171, 51.3264],
    [-2.648, 51.209],
  ], { external_gateway: "Wells" }),
];

const quietLaneReachCorridors = [
  corridor("quiet-reach-chew-valley", "Chew Valley quiet-lane reach", "quiet-lane-rural-reach", "20mph-quiet-lane-priority", "rural lanes", [
    [-2.5484, 51.3718],
    [-2.5753, 51.3676],
    [-2.6108, 51.3676],
    [-2.6306, 51.3533],
    [-2.5945, 51.3355],
  ]),
  corridor("quiet-reach-cam-brook-valley", "Cam Brook villages quiet-lane reach", "quiet-lane-rural-reach", "20mph-quiet-lane-priority", "rural lanes", [
    [-2.4519, 51.291],
    [-2.4537, 51.316],
    [-2.4765, 51.3256],
    [-2.487, 51.3436],
    [-2.4792, 51.3604],
  ]),
  corridor("quiet-reach-bath-south-villages", "Bath southern villages quiet-lane reach", "quiet-lane-rural-reach", "20mph-quiet-lane-priority", "rural lanes", [
    [-2.3657, 51.3705],
    [-2.3604, 51.3518],
    [-2.3747, 51.3232],
    [-2.4154, 51.3003],
  ]),
  corridor("quiet-reach-bath-avon-valley", "Bath Avon Valley quiet-lane reach", "quiet-lane-rural-reach", "20mph-quiet-lane-priority", "rural lanes", [
    [-2.3591, 51.3811],
    [-2.3227, 51.393],
    [-2.3009, 51.3976],
  ]),
  corridor("quiet-reach-north-somerset-villages", "North Somerset villages quiet-lane reach", "quiet-lane-rural-reach", "20mph-quiet-lane-priority", "rural lanes", [
    [-2.7381, 51.4144],
    [-2.7843, 51.3902],
    [-2.8106, 51.3715],
    [-2.8235, 51.3885],
    [-2.8034, 51.4469],
  ]),
  corridor("quiet-reach-south-glos-villages", "South Gloucestershire villages quiet-lane reach", "quiet-lane-rural-reach", "20mph-quiet-lane-priority", "rural lanes", [
    [-2.4774, 51.4932],
    [-2.4346, 51.4853],
    [-2.4357, 51.5185],
    [-2.416, 51.541],
  ]),
];

const greenwayOpportunityCorridors = [
  corridor("quiet-opportunity-bristol-bath-railway-path", "Bristol and Bath Railway Path strategic quiet-route opportunity", "strategic-quiet-route-opportunity", "protect-upgrade-greenway", "greenway", [
    [-2.5879, 51.4545],
    [-2.499, 51.4871],
    [-2.4755, 51.4418],
    [-2.4585, 51.4072],
    [-2.3591, 51.3811],
  ]),
  corridor("quiet-opportunity-two-tunnels-colliers-way", "Two Tunnels and Colliers Way strategic quiet-route opportunity", "strategic-quiet-route-opportunity", "protect-upgrade-greenway", "greenway", [
    [-2.3591, 51.3811],
    [-2.327, 51.3565],
    [-2.3034, 51.3427],
    [-2.4519, 51.291],
    [-2.4846, 51.2855],
  ]),
  corridor("quiet-opportunity-strawberry-line", "Strawberry Line strategic quiet-route opportunity", "strategic-quiet-route-opportunity", "protect-upgrade-greenway", "greenway", [
    [-2.977, 51.346],
    [-2.8671, 51.3281],
    [-2.8312, 51.3124],
    [-2.8235, 51.3885],
  ]),
  corridor("quiet-opportunity-festival-way", "Festival Way strategic quiet-route opportunity", "strategic-quiet-route-opportunity", "protect-upgrade-greenway", "greenway", [
    [-2.5879, 51.4545],
    [-2.6608, 51.4298],
    [-2.7381, 51.4144],
    [-2.8235, 51.3885],
  ]),
];

const featureCollection = {
  type: "FeatureCollection",
  name: "WECA strategic active travel network synthesis",
  metadata: {
    created_at: new Date().toISOString(),
    status: "prototype-corridor-synthesis",
    notes:
      "Corridor-level synthesis for WECA plus strategic external gateways. Lines are planning corridors, not designed alignments. Primary A-road corridors are treated as the default strategic backbone; quiet-lane and greenway corridors show reach and parallel-route opportunities.",
  },
  features: [
    ...strategicBackboneCorridors,
    ...quietLaneReachCorridors,
    ...greenwayOpportunityCorridors,
  ],
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(featureCollection, null, 2)}\n`);

console.log(
  `Generated ${featureCollection.features.length} WECA strategic network features to ${outputFile.pathname}`,
);

function corridor(
  id,
  name,
  corridorRole,
  treatmentIntent,
  basis,
  coordinates,
  extraProperties = {},
) {
  return {
    type: "Feature",
    id,
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {
      strategic_network_feature_type: corridorRole,
      corridor_name: name,
      treatment_intent: treatmentIntent,
      geometry_basis: basis,
      source_layer: "weca-strategic-network-synthesis",
      status: "prototype-corridor",
      provenance_notes:
        "Prototype corridor geometry sketched from known settlement centres, A-road names, NCN/greenway context and SATN-style settlement reach logic.",
      uncertainty_notes:
        "Indicative corridor only. Requires route audit, highway boundary review, traffic-speed context and land/constraint checks before any design conclusion.",
      ...extraProperties,
    },
  };
}
