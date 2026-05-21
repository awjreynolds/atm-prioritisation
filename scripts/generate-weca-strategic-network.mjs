import { mkdir, writeFile } from "node:fs/promises";

const outputFile = new URL("../data/weca-strategic-network.geojson", import.meta.url);

const coreLinks = [
  link("core-bristol-bath-a4", "Bristol", "Bath and Batheaston", "A4", "P1", [
    [-2.5879, 51.4545],
    [-2.511, 51.449],
    [-2.4977, 51.4311],
    [-2.4585, 51.4072],
    [-2.3905, 51.395],
    [-2.3591, 51.3811],
  ], { via_nodes: ["Keynsham", "Saltford"] }),
  link("core-bath-radstock-msn-a367", "Bath and Batheaston", "Midsomer Norton", "A367", "P1", [
    [-2.3591, 51.3811],
    [-2.3776, 51.3538],
    [-2.4322, 51.3408],
    [-2.4519, 51.291],
    [-2.4846, 51.2855],
  ], { via_nodes: ["Odd Down", "Tunley", "Radstock"] }),
  link("core-bristol-msn-a37", "Bristol", "Midsomer Norton", "A37", "P1", [
    [-2.5879, 51.4545],
    [-2.5602, 51.4066],
    [-2.5484, 51.3718],
    [-2.5307, 51.297],
    [-2.4846, 51.2855],
  ], { via_nodes: ["Whitchurch Village", "Pensford", "Farrington Gurney"] }),
  link("core-bristol-yate-a432", "Bristol", "Yate", "A432", "P1", [
    [-2.5879, 51.4545],
    [-2.5266, 51.4787],
    [-2.4774, 51.4932],
    [-2.416, 51.541],
  ], { via_nodes: ["Fishponds", "Emersons Green"] }),
  link("core-yate-chipping-sodbury-a432", "Yate", "Chipping Sodbury", "A432", "P1", [
    [-2.416, 51.541],
    [-2.393, 51.538],
  ]),
  link("core-bristol-thornbury-a38", "Bristol", "Thornbury", "A38", "P1", [
    [-2.5879, 51.4545],
    [-2.5761, 51.5107],
    [-2.5711, 51.5541],
    [-2.521, 51.608],
  ], { via_nodes: ["Filton", "Almondsbury"] }),
  link("core-bristol-portishead-a369", "Bristol", "Portishead", "A369", "P1", [
    [-2.5879, 51.4545],
    [-2.6678, 51.461],
    [-2.6828, 51.481],
    [-2.769, 51.485],
  ], { via_nodes: ["Abbots Leigh", "Pill"] }),
  link("core-bristol-weston-a370", "Bristol", "Weston-super-Mare", "A370", "P1", [
    [-2.5879, 51.4545],
    [-2.6608, 51.4298],
    [-2.7381, 51.4144],
    [-2.8235, 51.3885],
    [-2.977, 51.346],
  ], { via_nodes: ["Long Ashton", "Backwell", "Yatton"] }),
  link("core-bristol-airport-weston-a38", "Bristol", "Weston-super-Mare", "A38", "P1", [
    [-2.5879, 51.4545],
    [-2.6608, 51.4298],
    [-2.7171, 51.3264],
    [-2.8029, 51.3333],
    [-2.8671, 51.3281],
    [-2.977, 51.346],
  ], { via_nodes: ["Bristol Airport", "Churchill", "Banwell"] }),
  link("core-clevedon-nailsea-bristol", "Clevedon", "Bristol", "B3130/A370", "P2", [
    [-2.857, 51.439],
    [-2.7265, 51.4425],
    [-2.7381, 51.4144],
    [-2.6608, 51.4298],
    [-2.5879, 51.4545],
  ], { via_nodes: ["Wraxall", "Nailsea", "Long Ashton"] }),
  link("core-portishead-clevedon-weston", "Portishead", "Weston-super-Mare", "B3124/A370", "P2", [
    [-2.769, 51.485],
    [-2.8034, 51.4469],
    [-2.857, 51.439],
    [-2.8235, 51.3885],
    [-2.977, 51.346],
  ], { via_nodes: ["Tickenham", "Clevedon", "Yatton"] }),
  link("core-keynsham-somer-valley-a39-a37", "Keynsham", "Midsomer Norton", "A39/A37", "P2", [
    [-2.4977, 51.4311],
    [-2.5484, 51.3718],
    [-2.543, 51.3201],
    [-2.4846, 51.2855],
  ], { via_nodes: ["Pensford", "Temple Cloud"] }),
  link("gateway-msn-frome-a362", "Midsomer Norton", "Frome", "A362", "P2", [
    [-2.4846, 51.2855],
    [-2.4381, 51.2698],
    [-2.3215, 51.2308],
  ], { external_gateway: "Frome" }),
  link("gateway-bath-chippenham-a4", "Bath and Batheaston", "Chippenham/Corsham", "A4", "P2", [
    [-2.3591, 51.3811],
    [-2.3009, 51.3976],
    [-2.214, 51.417],
    [-2.115, 51.46],
  ], { external_gateway: "Chippenham/Corsham" }),
  link("gateway-bath-trowbridge-a363", "Bath and Batheaston", "Bradford-on-Avon/Trowbridge", "A363", "P2", [
    [-2.3591, 51.3811],
    [-2.3278, 51.3756],
    [-2.252, 51.346],
    [-2.208, 51.319],
  ], { external_gateway: "Bradford-on-Avon/Trowbridge" }),
  link("gateway-bath-wells-a39", "Bath and Batheaston", "Wells", "A39", "P2", [
    [-2.3591, 51.3811],
    [-2.4415, 51.3829],
    [-2.543, 51.3201],
    [-2.5797, 51.2762],
    [-2.648, 51.209],
  ], { external_gateway: "Wells" }),
  link("gateway-weston-wells-a371", "Weston-super-Mare", "Wells", "A371", "P2", [
    [-2.977, 51.346],
    [-2.8671, 51.3281],
    [-2.8029, 51.3333],
    [-2.7171, 51.3264],
    [-2.648, 51.209],
  ], { external_gateway: "Wells" }),
  link("gateway-bath-warminster-a36", "Bath and Batheaston", "Warminster", "A36", "P3", [
    [-2.3591, 51.3811],
    [-2.3034, 51.3427],
    [-2.252, 51.346],
    [-2.188, 51.204],
  ], { external_gateway: "Warminster" }),
];

const quietLaneOpportunities = [
  opportunity("quiet-chew-valley-reach", "Chew Valley quiet-lane reach", [
    [-2.5484, 51.3718],
    [-2.5753, 51.3676],
    [-2.6108, 51.3676],
    [-2.6306, 51.3533],
    [-2.5945, 51.3355],
  ], { feeder_to_core_link_ids: ["core-bristol-msn-a37", "core-keynsham-somer-valley-a39-a37"] }),
  opportunity("quiet-cam-brook-reach", "Cam Brook villages quiet-lane reach", [
    [-2.4519, 51.291],
    [-2.4537, 51.316],
    [-2.4765, 51.3256],
    [-2.487, 51.3436],
    [-2.4792, 51.3604],
  ], { feeder_to_core_link_ids: ["core-bath-radstock-msn-a367"] }),
  opportunity("quiet-bath-south-villages", "Bath southern villages quiet-lane reach", [
    [-2.3657, 51.3705],
    [-2.3604, 51.3518],
    [-2.3747, 51.3232],
    [-2.4154, 51.3003],
  ], { feeder_to_core_link_ids: ["core-bath-radstock-msn-a367", "gateway-bath-wells-a39"] }),
  opportunity("quiet-north-somerset-villages", "North Somerset villages quiet-lane reach", [
    [-2.7381, 51.4144],
    [-2.7843, 51.3902],
    [-2.8106, 51.3715],
    [-2.8235, 51.3885],
    [-2.8034, 51.4469],
  ], { feeder_to_core_link_ids: ["core-bristol-weston-a370", "core-portishead-clevedon-weston"] }),
  opportunity("quiet-south-glos-villages", "South Gloucestershire villages quiet-lane reach", [
    [-2.4774, 51.4932],
    [-2.4346, 51.4853],
    [-2.4357, 51.5185],
    [-2.416, 51.541],
  ], { feeder_to_core_link_ids: ["core-bristol-yate-a432"] }),
  opportunity("greenway-bristol-bath-railway-path", "Bristol and Bath Railway Path parallel strategic opportunity", [
    [-2.5879, 51.4545],
    [-2.499, 51.4871],
    [-2.4755, 51.4418],
    [-2.4585, 51.4072],
    [-2.3591, 51.3811],
  ], { parallel_to_core_link_ids: ["core-bristol-bath-a4"], treatment_intent: "protect-upgrade-greenway" }),
  opportunity("greenway-two-tunnels-colliers-way", "Two Tunnels and Colliers Way parallel strategic opportunity", [
    [-2.3591, 51.3811],
    [-2.327, 51.3565],
    [-2.3034, 51.3427],
    [-2.4519, 51.291],
    [-2.4846, 51.2855],
  ], { parallel_to_core_link_ids: ["core-bath-radstock-msn-a367"], treatment_intent: "protect-upgrade-greenway" }),
  opportunity("greenway-strawberry-line", "Strawberry Line parallel strategic opportunity", [
    [-2.977, 51.346],
    [-2.8671, 51.3281],
    [-2.8312, 51.3124],
    [-2.8235, 51.3885],
  ], { parallel_to_core_link_ids: ["core-bristol-weston-a370"], treatment_intent: "protect-upgrade-greenway" }),
  opportunity("greenway-festival-way", "Festival Way parallel strategic opportunity", [
    [-2.5879, 51.4545],
    [-2.6608, 51.4298],
    [-2.7381, 51.4144],
    [-2.8235, 51.3885],
  ], { parallel_to_core_link_ids: ["core-bristol-weston-a370"], treatment_intent: "protect-upgrade-greenway" }),
];

const featureCollection = {
  type: "FeatureCollection",
  name: "Core WECA inter-urban active travel network",
  metadata: {
    created_at: new Date().toISOString(),
    status: "satn-style-stage-1-prototype",
    network_scope: "WECA plus strategic external gateways",
    methodology_notes:
      "SATN-style Stage 1 network: prioritised inter-urban links between bounded urban areas and strategic external gateways. Geometry follows named A-road corridors with coarse intermediate control points where possible, but remains corridor/desire-line evidence rather than design alignment.",
  },
  features: [...coreLinks, ...quietLaneOpportunities],
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(featureCollection, null, 2)}\n`);

console.log(
  `Generated ${featureCollection.features.length} WECA strategic network features to ${outputFile.pathname}`,
);

function link(id, fromNode, toNode, corridorRef, priority, coordinates, extra = {}) {
  return {
    type: "Feature",
    id,
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {
      strategic_network_feature_type: "core-interurban-link",
      corridor_name: `${corridorRef} ${fromNode} to ${toNode}`,
      from_node: fromNode,
      to_node: toNode,
      corridor_ref: corridorRef,
      core_network_priority: priority,
      satn_stage: "stage-1-prioritised-corridor",
      alignment_status: "road-corridor-proxy",
      default_treatment_intent: "make-good-a-road-active-travel-corridor",
      urban_complexity_handling:
        "Treat bounded urban areas as LCWIP/interface zones; do not solve detailed urban alignments in this layer.",
      quiet_route_policy:
        "Quiet routes may provide reach or parallel options but do not replace the direct inter-urban A-road corridor unless the route audit shows the A-road is not viable.",
      personal_safety_policy:
        "Direct, legible, overlooked corridors are preferred where a suitable A-road-adjacent facility can be delivered.",
      source_layer: "weca-strategic-network-synthesis",
      status: "prototype-core-network",
      provenance_notes:
        "Prototype link selected from WECA urban areas, major neighbouring gateways and named A-road corridors.",
      uncertainty_notes:
        "Requires route audit, highway boundary review, traffic-speed context and land/constraint checks before any design conclusion.",
      ...extra,
    },
  };
}

function opportunity(id, name, coordinates, extra = {}) {
  return {
    type: "Feature",
    id,
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {
      strategic_network_feature_type: "quiet-lane-opportunity",
      corridor_name: name,
      treatment_intent: "20mph-quiet-lane-priority",
      satn_stage: "stage-1-supporting-opportunity",
      source_layer: "weca-strategic-network-synthesis",
      status: "prototype-supporting-network",
      provenance_notes:
        "Prototype supporting corridor for village reach, parallel greenway logic, walking, wheeling, cycling and equestrian access.",
      uncertainty_notes:
        "Not a substitute for the core inter-urban route unless audited as a viable, attractive and safe strategic alternative.",
      ...extra,
    },
  };
}
