import { formatRouteDetail } from "./route-details.mjs";
import { styleRouteForMap } from "./route-styles.mjs";

const atmLayerDefinitions = [
  {
    id: "atm-strategic",
    label: "ATM Strategic routes",
    classification: "Strategic",
    visibleOption: "showAtmStrategicLayer",
  },
  {
    id: "atm-quiet",
    label: "ATM Quiet routes",
    classification: "Quiet",
    visibleOption: "showAtmQuietLayer",
  },
  {
    id: "atm-community-connections",
    label: "ATM Community Connections",
    classification: "Community Connections",
    visibleOption: "showAtmCommunityConnectionsLayer",
  },
  {
    id: "atm-missing-pavement",
    label: "ATM Missing Pavement",
    classification: "Missing Pavement",
    visibleOption: "showAtmMissingPavementLayer",
  },
];

export function renderRouteMap(routes, options = {}) {
  const atmRoutesGeoJson = options.atmRoutesGeoJson;
  const banesAtmGeoJson = options.banesAtmGeoJson;
  const wecaLcwipUrbanAreasGeoJson = options.wecaLcwipUrbanAreasGeoJson;
  const wecaSatnCentroidsGeoJson = options.wecaSatnCentroidsGeoJson;
  const wecaStrategicNetworkGeoJson = options.wecaStrategicNetworkGeoJson;
  const nationalCycleNetworkGeoJson = options.nationalCycleNetworkGeoJson;
  const destinations = Array.isArray(options.destinations)
    ? options.destinations
    : [];
  const showDestinations = options.showDestinations !== false;
  const showUrbanEvidenceLayer =
    options.showUrbanEvidenceLayer ??
    (options.showLcwipUrbanAreasLayer !== false &&
      options.showSatnCentroidConnectionsLayer !== false);
  const backgroundRoutes = routes.filter(
    (route) => route.route_layer === "atm-background",
  );
  const prototypeRoutes = routes.filter(
    (route) => route.route_layer === "prototype-simplified",
  );
  const selectedRoute = routes.find(
    (route) => route.route_id === options.selectedRouteId,
  );

  return [
    "<section class=\"route-map\" aria-label=\"Pilot route map\">",
    renderLeafletMap({
      atmRoutesGeoJson: banesAtmGeoJson ?? atmRoutesGeoJson,
      wecaLcwipUrbanAreasGeoJson,
      wecaSatnCentroidsGeoJson,
      wecaStrategicNetworkGeoJson,
      nationalCycleNetworkGeoJson,
      showUrbanEvidenceLayer,
      showWecaStrategicNetworkLayer:
        options.showWecaStrategicNetworkLayer !== false,
      showQuietLaneOpportunitiesLayer:
        options.showQuietLaneOpportunitiesLayer !== false,
      showDeprecatedNcnOpportunitiesLayer:
        options.showDeprecatedNcnOpportunitiesLayer !== false,
      showNationalCycleNetworkLayer:
        options.showNationalCycleNetworkLayer !== false,
      ...atmVisibilityOptions(options),
    }),
    "<div class=\"route-layer route-layer-background\" data-route-layer=\"atm-background\">",
    "<h2>Original ATM-style source evidence</h2>",
    ...backgroundRoutes.map((route) => renderRoute(route, selectedRoute)),
    "</div>",
    "<div class=\"route-layer route-layer-prototype\" data-route-layer=\"prototype-simplified\">",
    "<h2>Simplified prototype layer</h2>",
    ...prototypeRoutes.map((route) => renderRoute(route, selectedRoute)),
    "</div>",
    renderDestinationLayer(destinations, { showDestinations }),
    renderRouteDetail(selectedRoute, destinations),
    "<footer class=\"map-attribution\">Route data: checked-in pilot dataset. B&amp;NES Active Travel Masterplan source context retained as background evidence.</footer>",
    "</section>",
  ].join("");
}

export function hydrateLeafletRouteMap(root, options = {}) {
  const mapElement = root?.querySelector?.("[data-leaflet-route-map]");
  const leaflet = globalThis.window?.L;

  if (!mapElement || !leaflet) {
    return;
  }

  const atmRoutesGeoJson = options.atmRoutesGeoJson;
  const banesAtmGeoJson = options.banesAtmGeoJson;
  const sourceGeoJson = banesAtmGeoJson ?? atmRoutesGeoJson;
  const visibleAtmClassifications = visibleAtmClassificationsForOptions(options);
  const sourceFeatures =
    visibleAtmClassifications.size === 0
      ? []
      : sourceContextFeatures(sourceGeoJson).filter(
          (feature) =>
            !isBanesAtmPortalGeoJson(sourceGeoJson) ||
            visibleAtmClassifications.has(atmClassificationKey(feature)),
        );
  const lcwipUrbanAreaFeatures =
    options.showUrbanEvidenceLayer === false
      ? []
      : lcwipUrbanAreaFeaturesForMap(options.wecaLcwipUrbanAreasGeoJson);
  const satnCentroidFeatures =
    options.showUrbanEvidenceLayer === false
      ? []
      : satnCentroidFeaturesForMap(options.wecaSatnCentroidsGeoJson);
  const nationalCycleNetworkFeatures =
    options.showNationalCycleNetworkLayer === false
      ? []
      : nationalCycleNetworkFeaturesForMap(options.nationalCycleNetworkGeoJson);
  const strategicNetworkFeatures =
    options.showWecaStrategicNetworkLayer === false
      ? []
      : coreInterUrbanNetworkFeaturesForMap(options.wecaStrategicNetworkGeoJson);
  const quietLaneOpportunityFeatures =
    options.showQuietLaneOpportunitiesLayer === false
      ? []
      : quietLaneOpportunityFeaturesForMap(options.wecaStrategicNetworkGeoJson);
  const ncnReviewFeatures =
    options.showDeprecatedNcnOpportunitiesLayer === false
      ? []
      : ncnReviewFeaturesForMap(options.nationalCycleNetworkGeoJson);
  const prototypeFeatures = options.selectedRouteId
    ? prototypePrioritisationFeatures(options.routes ?? [], atmRoutesGeoJson).filter(
        (feature) => feature.properties?.route_id === options.selectedRouteId,
      )
    : [];

  if (
    sourceFeatures.length === 0 &&
    lcwipUrbanAreaFeatures.length === 0 &&
    satnCentroidFeatures.length === 0 &&
    nationalCycleNetworkFeatures.length === 0 &&
    strategicNetworkFeatures.length === 0 &&
    quietLaneOpportunityFeatures.length === 0 &&
    ncnReviewFeatures.length === 0 &&
    prototypeFeatures.length === 0
  ) {
    return;
  }

  const map = leaflet.map(mapElement, {
    scrollWheelZoom: false,
  });

  leaflet
    .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    })
    .addTo(map);

  const lcwipUrbanAreasLayer = leaflet
    .geoJSON(
      {
        type: "FeatureCollection",
        features: lcwipUrbanAreaFeatures,
      },
      {
        onEachFeature(feature, layer) {
          const properties = feature.properties ?? {};
          layer.bindPopup?.(
            [
              "<strong>",
              escapeHtml(properties.area_name ?? "LCWIP urban area"),
              "</strong>",
              "<br>",
              escapeHtml(
                (properties.component_built_up_areas ?? []).join(", "),
              ),
            ].join(""),
          );
        },
        style() {
          return {
            color: "#f47738",
            fillColor: "#f47738",
            fillOpacity: 0.14,
            opacity: 0.85,
            weight: 2,
          };
        },
      },
    )
    .addTo(map);

  const nationalCycleNetworkLayer = leaflet
    .geoJSON(
      {
        type: "FeatureCollection",
        features: nationalCycleNetworkFeatures,
      },
      {
        onEachFeature(feature, layer) {
          const properties = feature.properties ?? {};
          layer.bindPopup?.(
            [
              "<strong>",
              properties.ncn_status === "reclassified"
                ? "Reclassified NCN route"
                : "National Cycle Network",
              "</strong>",
              properties.RouteNo ? `<br>Route ${escapeHtml(properties.RouteNo)}` : "",
              properties.RouteCat ? `<br>${escapeHtml(properties.RouteCat)}` : "",
              properties.Desc_ ? `<br>${escapeHtml(properties.Desc_)}` : "",
            ].join(""),
          );
        },
        style(feature) {
          const reclassified = feature.properties?.ncn_status === "reclassified";
          return {
            color: reclassified ? "#505a5f" : "#00703c",
            dashArray: reclassified ? "3 6" : "8 4",
            opacity: reclassified ? 0.65 : 0.78,
            weight: reclassified ? 3 : 4,
          };
        },
      },
    )
    .addTo(map);

  const satnCentroidLayer = leaflet
    .geoJSON(
      {
        type: "FeatureCollection",
        features: satnCentroidFeatures,
      },
      {
        onEachFeature(feature, layer) {
          const properties = feature.properties ?? {};
          const label =
            properties.satn_feature_type === "centroid-connection"
              ? `${properties.from_area_name} to ${properties.to_area_name}`
              : properties.area_name;
          layer.bindPopup?.(`<strong>${escapeHtml(label ?? "SATN feature")}</strong>`);
        },
        pointToLayer(feature, latLng) {
          return leaflet.circleMarker(latLng, {
            color: "#0b0c0c",
            fillColor: "#ffdd00",
            fillOpacity: 1,
            radius: 4,
            weight: 1.5,
          });
        },
        style(feature) {
          if (feature.geometry?.type === "Point") {
            return undefined;
          }

          return {
            color: "#0b0c0c",
            dashArray: "6 4",
            opacity: 0.85,
            weight: 2,
          };
        },
      },
    )
    .addTo(map);

  const strategicNetworkLayer = leaflet
    .geoJSON(
      {
        type: "FeatureCollection",
        features: strategicNetworkFeatures,
      },
      {
        onEachFeature(feature, layer) {
          const properties = feature.properties ?? {};
          layer.bindPopup?.(
            [
              "<strong>",
              escapeHtml(
                properties.corridor_name ??
                  properties.Desc_ ??
                  "WECA strategic network feature",
              ),
              "</strong>",
              properties.geometry_basis
                ? `<br>${escapeHtml(properties.geometry_basis)}`
                : "",
              properties.treatment_intent
                ? `<br>${escapeHtml(formatKebabLabel(properties.treatment_intent))}`
                : "",
            ].join(""),
          );
        },
        style(feature) {
          return styleStrategicNetworkFeature(feature);
        },
      },
    )
    .addTo(map);

  const quietLaneOpportunityLayer = leaflet
    .geoJSON(
      {
        type: "FeatureCollection",
        features: quietLaneOpportunityFeatures,
      },
      {
        onEachFeature(feature, layer) {
          const properties = feature.properties ?? {};
          layer.bindPopup?.(
            [
              "<strong>",
              escapeHtml(
                properties.corridor_name ??
                  properties.Desc_ ??
                  "Quiet-lane opportunity",
              ),
              "</strong>",
              properties.treatment_intent
                ? `<br>${escapeHtml(formatKebabLabel(properties.treatment_intent))}`
                : "",
            ].join(""),
          );
        },
        style(feature) {
          return styleQuietLaneOpportunityFeature(feature);
        },
      },
    )
    .addTo(map);

  const ncnReviewLayer = leaflet
    .geoJSON(
      {
        type: "FeatureCollection",
        features: ncnReviewFeatures,
      },
      {
        onEachFeature(feature, layer) {
          const properties = feature.properties ?? {};
          layer.bindPopup?.(
            [
              "<strong>",
              escapeHtml(properties.corridor_name ?? "NCN review"),
              "</strong>",
              properties.treatment_intent
                ? `<br>${escapeHtml(formatKebabLabel(properties.treatment_intent))}`
                : "",
            ].join(""),
          );
        },
        style(feature) {
          return styleQuietLaneOpportunityFeature(feature);
        },
      },
    )
    .addTo(map);

  const sourceLayer = leaflet
    .geoJSON(
      {
        type: "FeatureCollection",
        features: sourceFeatures,
      },
      {
        onEachFeature(feature, layer) {
          const properties = feature.properties ?? {};
          layer.bindPopup?.(
            [
              "<strong>",
              escapeHtml(properties.source_atm_classification ?? "ATM route"),
              "</strong>",
              properties.portal_feature_id
                ? `<br>${escapeHtml(properties.portal_feature_id)}`
                : "",
            ].join(""),
          );
        },
        style(feature) {
          return styleSourceFeature(feature);
        },
      },
    )
    .addTo(map);

  const prototypeLayer = leaflet
    .geoJSON(
      {
        type: "FeatureCollection",
        features: prototypeFeatures,
      },
      {
        onEachFeature(feature, layer) {
          const routeId = feature.properties?.route_id;
          if (!routeId) {
            return;
          }

          layer.on("click", () => {
            options.onRouteSelect?.(routeId);
          });
        },
        style(feature) {
          return stylePrototypeFeature(
            feature,
            feature.properties?.route_id === options.selectedRouteId,
          );
        },
      },
    )
    .addTo(map);

  const fitLayers = [
    lcwipUrbanAreasLayer,
    strategicNetworkLayer,
    quietLaneOpportunityLayer,
    ncnReviewLayer,
    nationalCycleNetworkLayer,
    satnCentroidLayer,
    sourceLayer,
    prototypeLayer,
  ].filter((layer) => layer.getLayers?.().length > 0);
  const featureGroup = leaflet.featureGroup(fitLayers);
  map.fitBounds(featureGroup.getBounds(), {
    padding: [18, 18],
  });
}

function renderLeafletMap(options) {
  const atmRoutesGeoJson = options.atmRoutesGeoJson;
  const wecaLcwipUrbanAreasGeoJson = options.wecaLcwipUrbanAreasGeoJson;
  const nationalCycleNetworkGeoJson = options.nationalCycleNetworkGeoJson;
  const wecaStrategicNetworkGeoJson = options.wecaStrategicNetworkGeoJson;
  const satnCentroidsGeoJson = options.wecaSatnCentroidsGeoJson;
  const sourceFeatureCount = sourceContextFeatures(atmRoutesGeoJson).length;
  const lcwipUrbanAreaCount = lcwipUrbanAreaFeaturesForMap(
    wecaLcwipUrbanAreasGeoJson,
  ).length;
  const satnFeatureCount = satnCentroidFeaturesForMap(satnCentroidsGeoJson).length;
  const ncnFeatures = nationalCycleNetworkFeaturesForMap(
    nationalCycleNetworkGeoJson,
  );
  const ncnCurrentCount = ncnFeatures.filter(
    (feature) => feature.properties?.ncn_status === "current",
  ).length;
  const ncnReclassifiedCount = ncnFeatures.filter(
    (feature) => feature.properties?.ncn_status === "reclassified",
  ).length;
  const coreInterUrbanNetworkFeatures = coreInterUrbanNetworkFeaturesForMap(
    wecaStrategicNetworkGeoJson,
  );
  const quietLaneOpportunityCount = quietLaneOpportunityFeaturesForMap(
    wecaStrategicNetworkGeoJson,
  ).length;
  const ncnReviewCount = ncnReviewFeaturesForMap(
    nationalCycleNetworkGeoJson,
  ).length;
  const sourceSummary = isBanesAtmPortalGeoJson(atmRoutesGeoJson)
    ? " full B&amp;NES portal features from the public Active Travel Masterplan layer."
    : " checked-in best-fit lon/lat features from the Bath to Somer Valley ATM extraction.";
  const visibleAtmDefinitions = atmLayerDefinitions.filter(
    (definition) => options[definition.visibleOption] !== false,
  );
  const visibleAtmClassificationKeys = new Set(
    visibleAtmDefinitions.map((definition) =>
      classificationKey(definition.classification),
    ),
  );
  const visibleAtmFeatureCount = sourceContextFeatures(atmRoutesGeoJson).filter(
    (feature) =>
      !isBanesAtmPortalGeoJson(atmRoutesGeoJson) ||
      visibleAtmClassificationKeys.has(atmClassificationKey(feature)),
  ).length;

  return [
    "<div class=\"leaflet-map-shell\" aria-label=\"Bath to Somer Valley interactive map\">",
    "<div class=\"map-layer-controls\" aria-label=\"Map layer controls\">",
    "<div class=\"map-layer-actions\" aria-label=\"Layer selection actions\">",
    "<button type=\"button\" data-map-layer-action=\"select-all\">Select all</button>",
    "<button type=\"button\" data-map-layer-action=\"clear-all\">Deselect all</button>",
    "</div>",
    renderMapLayerToggle(
      "urban-evidence",
      "Phase 1: urban areas and centroids",
      options.showUrbanEvidenceLayer,
    ),
    renderMapLayerToggle(
      "weca-strategic-network",
      "Phase 2: core WECA inter-urban network",
      options.showWecaStrategicNetworkLayer,
    ),
    renderMapLayerToggle(
      "quiet-lane-opportunities",
      "Phase 3: quiet-lane and greenway reach",
      options.showQuietLaneOpportunitiesLayer,
    ),
    renderMapLayerToggle(
      "deprecated-ncn-opportunities",
      "Phase 4: NCN current/deprecated review",
      options.showDeprecatedNcnOpportunitiesLayer,
    ),
    ...atmLayerDefinitions.map((definition) =>
      renderMapLayerToggle(
        definition.id,
        definition.label,
        options[definition.visibleOption] !== false,
      ),
    ),
    renderMapLayerToggle(
      "national-cycle-network",
      "National Cycle Network",
      options.showNationalCycleNetworkLayer,
    ),
    "</div>",
    "<div class=\"leaflet-route-map\" data-leaflet-route-map role=\"application\" aria-label=\"Leaflet map with OpenStreetMap streets basemap\"></div>",
    "<div class=\"leaflet-layer-summary\" aria-label=\"Map layer summary\">",
    ...activeLayerSummaryItems({
      visibleAtmDefinitions,
      visibleAtmFeatureCount,
      sourceFeatureCount,
      sourceSummary,
      lcwipUrbanAreaCount,
      satnFeatureCount,
      coreInterUrbanNetworkCount: coreInterUrbanNetworkFeatures.length,
      quietLaneOpportunityCount,
      ncnReviewCount,
      ncnCurrentCount,
      ncnReclassifiedCount,
      showUrbanEvidenceLayer: options.showUrbanEvidenceLayer,
      showWecaStrategicNetworkLayer: options.showWecaStrategicNetworkLayer,
      showQuietLaneOpportunitiesLayer: options.showQuietLaneOpportunitiesLayer,
      showDeprecatedNcnOpportunitiesLayer:
        options.showDeprecatedNcnOpportunitiesLayer,
      showNationalCycleNetworkLayer: options.showNationalCycleNetworkLayer,
    }),
    "</div>",
    "<p class=\"route-sketch-note\">Leaflet/OpenStreetMap map. Basemap attribution: OpenStreetMap contributors. Geometry is indicative review-map evidence and prototype hypothesis only; lines are not official alignments.</p>",
    "</div>",
  ].join("");
}

function activeLayerSummaryItems({
  visibleAtmDefinitions,
  visibleAtmFeatureCount,
  sourceFeatureCount,
  sourceSummary,
  lcwipUrbanAreaCount,
  satnFeatureCount,
  coreInterUrbanNetworkCount,
  quietLaneOpportunityCount,
  ncnReviewCount,
  ncnCurrentCount,
  ncnReclassifiedCount,
  showUrbanEvidenceLayer,
  showWecaStrategicNetworkLayer,
  showQuietLaneOpportunitiesLayer,
  showDeprecatedNcnOpportunitiesLayer,
  showNationalCycleNetworkLayer,
}) {
  const items = [];

  if (visibleAtmDefinitions.length > 0) {
    const layerNames = visibleAtmDefinitions
      .map((definition) => definition.classification)
      .join(", ");
    items.push(
      [
        "<p data-map-layer=\"source-context\"><strong>Visible ATM/context geometry:</strong> ",
        visibleAtmFeatureCount,
        " of ",
        sourceFeatureCount,
        sourceSummary,
        " Active ATM classes: ",
        escapeHtml(layerNames),
        ".</p>",
      ].join(""),
    );
  }

  if (showUrbanEvidenceLayer !== false) {
    items.push(
      [
        "<p data-map-layer=\"urban-evidence\"><strong>Urban areas and centroids:</strong> ",
        lcwipUrbanAreaCount,
        " bounded LCWIP urban areas plus ",
        satnFeatureCount,
        " community centroid/connector features.</p>",
      ].join(""),
    );
  }

  if (showWecaStrategicNetworkLayer !== false) {
    items.push(
      [
        "<p data-map-layer=\"weca-strategic-network\"><strong>Core WECA inter-urban network:</strong> ",
        coreInterUrbanNetworkCount,
        " prioritised corridor links between urban areas and strategic gateways.</p>",
      ].join(""),
    );
  }

  if (showQuietLaneOpportunitiesLayer !== false) {
    items.push(
      [
        "<p data-map-layer=\"quiet-lane-opportunities\"><strong>Quiet-lane and greenway opportunities:</strong> ",
        quietLaneOpportunityCount,
        " supporting reach or greenway opportunity features.</p>",
      ].join(""),
    );
  }

  if (showDeprecatedNcnOpportunitiesLayer !== false) {
    items.push(
      [
        "<p data-map-layer=\"deprecated-ncn-opportunities\"><strong>NCN current/deprecated review:</strong> ",
        ncnReviewCount,
        " current and reclassified/former NCN features available for backbone, quiet-lane, or greenway review.</p>",
      ].join(""),
    );
  }

  if (showNationalCycleNetworkLayer !== false) {
    items.push(
      [
        "<p data-map-layer=\"national-cycle-network\"><strong>National Cycle Network:</strong> ",
        ncnCurrentCount,
        " current features and ",
        ncnReclassifiedCount,
        " reclassified/former features.</p>",
      ].join(""),
    );
  }

  if (items.length === 0) {
    items.push(
      "<p data-map-layer=\"none\"><strong>No map layers selected:</strong> use the layer controls to add WECA phases or source evidence.</p>",
    );
  }

  return items;
}

function renderMapLayerToggle(layerId, label, checked) {
  return [
    "<label class=\"map-layer-toggle\">",
    "<input type=\"checkbox\" data-map-layer-toggle=\"",
    escapeHtml(layerId),
    "\"",
    checked ? " checked" : "",
    ">",
    "<span>",
    escapeHtml(label),
    "</span>",
    "</label>",
  ].join("");
}

function atmVisibilityOptions(options) {
  return Object.fromEntries(
    atmLayerDefinitions.map((definition) => [
      definition.visibleOption,
      options[definition.visibleOption] !== false,
    ]),
  );
}

function visibleAtmClassificationsForOptions(options) {
  return new Set(
    atmLayerDefinitions
      .filter((definition) => options[definition.visibleOption] !== false)
      .map((definition) => classificationKey(definition.classification)),
  );
}

function isBanesAtmPortalGeoJson(geoJson) {
  return (
    geoJson?.metadata?.source_layer === "bathnes_public:final_february25" ||
    featureCollectionFeatures(geoJson).some(
      (feature) => feature.properties?.source_layer === "banes-atm-portal",
    )
  );
}

function sourceContextFeatures(atmRoutesGeoJson) {
  return featureCollectionFeatures(atmRoutesGeoJson).filter((feature) =>
    feature.geometry &&
    ["atm-route", "context-greenway", "banes-atm-portal"].includes(
      feature.properties?.source_layer,
    ),
  );
}

function atmClassificationKey(feature) {
  return classificationKey(feature.properties?.source_atm_classification);
}

function classificationKey(value) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function lcwipUrbanAreaFeaturesForMap(geoJson) {
  return featureCollectionFeatures(geoJson).filter(
    (feature) =>
      feature.geometry &&
      feature.properties?.area_type === "lcwip-urban-area",
  );
}

function satnCentroidFeaturesForMap(geoJson) {
  return featureCollectionFeatures(geoJson).filter(
    (feature) =>
      feature.geometry &&
      ["community-centroid", "centroid-connection"].includes(
        feature.properties?.satn_feature_type,
      ),
  );
}

function nationalCycleNetworkFeaturesForMap(geoJson) {
  return featureCollectionFeatures(geoJson).filter(
    (feature) =>
      feature.geometry &&
      feature.properties?.source_layer === "national-cycle-network",
  );
}

function coreInterUrbanNetworkFeaturesForMap(strategicNetworkGeoJson) {
  return featureCollectionFeatures(strategicNetworkGeoJson).filter(
    (feature) =>
      feature.geometry &&
      feature.properties?.source_layer === "weca-strategic-network-synthesis",
  ).filter(
    (feature) =>
      feature.properties?.strategic_network_feature_type ===
      "core-interurban-link",
  );
}

function quietLaneOpportunityFeaturesForMap(strategicNetworkGeoJson) {
  return featureCollectionFeatures(strategicNetworkGeoJson)
    .filter(
      (feature) =>
        feature.geometry &&
        feature.properties?.source_layer === "weca-strategic-network-synthesis",
    )
    .filter(
      (feature) =>
        feature.properties?.strategic_network_feature_type ===
        "quiet-lane-opportunity",
    );
}

function ncnReviewFeaturesForMap(nationalCycleNetworkGeoJson) {
  return nationalCycleNetworkFeaturesForMap(nationalCycleNetworkGeoJson).map(
    (feature) => {
      const reclassified = feature.properties?.ncn_status === "reclassified";
      return {
        ...feature,
        properties: {
          ...feature.properties,
          strategic_network_feature_type: reclassified
            ? "deprecated-ncn-quiet-lane-opportunity"
            : "current-ncn-review",
          corridor_name:
            feature.properties?.Desc_ ??
            (reclassified ? "Deprecated NCN opportunity" : "Existing NCN route"),
          treatment_intent: reclassified
            ? "20mph-quiet-lane-or-greenway-review"
            : "protect-upgrade-existing-ncn",
          geometry_basis: reclassified ? "reclassified NCN" : "current NCN",
          source_layer: "weca-strategic-network-synthesis",
        },
      };
    },
  );
}

function featureCollectionFeatures(geoJson) {
  return geoJson?.type === "FeatureCollection" && Array.isArray(geoJson.features)
    ? geoJson.features
    : [];
}

function prototypePrioritisationFeatures(routes, atmRoutesGeoJson) {
  const sourceFeatures = featureCollectionFeatures(atmRoutesGeoJson);
  const sourceById = new Map(
    sourceFeatures.map((feature) => [
      feature.properties?.atm_route_id,
      feature,
    ]),
  );

  return routes
    .filter((route) => route.route_layer === "prototype-simplified")
    .map((route) => prototypeFeature(route, sourceById))
    .filter(Boolean);
}

function prototypeFeature(route, sourceById) {
  const coordinates = prototypeCoordinatesByRouteId(route.route_id, sourceById);

  if (coordinates.length < 2) {
    return null;
  }

  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {
      route_id: route.route_id,
      route_name: route.route_name,
      source_layer: "prototype-prioritisation",
    },
  };
}

function prototypeCoordinatesByRouteId(routeId, sourceById) {
  if (routeId === "prototype-a367-utility-corridor-hypothesis") {
    return compactLineCoordinates([
      ...reverseCoordinates(
        sourceById.get("atm-6-8A-peasedown-bath-strategic"),
      ),
      ...coordinatesWithoutFirst(
        reverseCoordinates(
          sourceById.get("atm-5-6A-a367-bristol-road-strategic"),
        ),
      ),
      ...coordinatesWithoutFirst(
        sourceById.get("atm-5-3A-a362-radstock-midsomer-farrington"),
      ),
    ]);
  }

  if (routeId === "prototype-somer-valley-school-access-review") {
    return compactLineCoordinates([
      ...sourceById.get("context-norton-radstock-greenway-five-arches")?.geometry
        ?.coordinates ?? [],
      ...coordinatesWithoutFirst(
        sourceById.get("atm-5-3A-a362-radstock-midsomer-farrington"),
      ),
    ]);
  }

  if (routeId === "prototype-greenway-utility-comparison") {
    return compactLineCoordinates(
      sourceById.get("context-ncn24-two-tunnels-colliers-way")?.geometry
        ?.coordinates ?? [],
    );
  }

  return [];
}

function reverseCoordinates(feature) {
  return [...(feature?.geometry?.coordinates ?? [])].reverse();
}

function coordinatesWithoutFirst(featureOrCoordinates) {
  const coordinates = Array.isArray(featureOrCoordinates)
    ? featureOrCoordinates
    : featureOrCoordinates?.geometry?.coordinates;

  return coordinates?.slice(1) ?? [];
}

function compactLineCoordinates(coordinates) {
  return coordinates.filter((coordinate, index) => {
    const previous = coordinates[index - 1];
    return (
      Array.isArray(coordinate) &&
      coordinate.length >= 2 &&
      (!previous ||
        previous[0] !== coordinate[0] ||
        previous[1] !== coordinate[1])
    );
  });
}

function styleSourceFeature(feature) {
  if (feature.properties?.source_layer === "banes-atm-portal") {
    return styleBanesAtmFeature(feature);
  }

  const isGreenway = feature.properties?.source_layer === "context-greenway";

  return {
    color: isGreenway ? "#4f7f52" : "#667788",
    dashArray: isGreenway ? "4 6" : "2 4",
    opacity: 0.68,
    weight: isGreenway ? 4 : 5,
  };
}

function styleBanesAtmFeature(feature) {
  const classification = feature.properties?.source_atm_classification;
  const styles = {
    Strategic: {
      color: "#005ea5",
      dashArray: undefined,
      weight: 4,
    },
    Quiet: {
      color: "#00703c",
      dashArray: "6 5",
      weight: 3,
    },
    "Community Connections": {
      color: "#6f72af",
      dashArray: "2 5",
      weight: 3,
    },
    "Missing Pavement": {
      color: "#d4351c",
      dashArray: "1 6",
      weight: 4,
    },
  };

  return {
    ...(styles[classification] ?? {
      color: "#505a5f",
      dashArray: "4 4",
      weight: 3,
    }),
    opacity: 0.78,
  };
}

function stylePrototypeFeature(feature, isSelected) {
  const route = {
    route_layer: "prototype-simplified",
    network_status: isSelected ? "preferred" : "needs-review",
    modal_shift_potential: "unknown",
    route_id: feature.properties?.route_id,
  };
  const style = styleRouteForMap(route);

  return {
    color: style.stroke,
    dashArray: style.strokeDasharray === "none" ? undefined : style.strokeDasharray,
    opacity: isSelected ? 1 : style.strokeOpacity,
    weight: isSelected ? style.strokeWidth + 2 : style.strokeWidth,
  };
}

function styleStrategicNetworkFeature(feature) {
  if (feature.properties?.external_gateway) {
    return {
      color: "#d4351c",
      dashArray: "8 5",
      opacity: 0.92,
      weight: 6,
    };
  }

  return {
    color: "#f47738",
    dashArray: undefined,
    opacity: 0.94,
    weight: 7,
  };
}

function styleQuietLaneOpportunityFeature(feature) {
  if (
    feature.properties?.strategic_network_feature_type ===
    "deprecated-ncn-quiet-lane-opportunity"
  ) {
    return {
      color: "#6f72af",
      dashArray: "2 7",
      opacity: 0.86,
      weight: 4,
    };
  }

  if (feature.properties?.strategic_network_feature_type === "current-ncn-review") {
    return {
      color: "#00703c",
      dashArray: "10 4",
      opacity: 0.78,
      weight: 4,
    };
  }

  if (feature.properties?.treatment_intent === "protect-upgrade-greenway") {
    return {
      color: "#1d7f5d",
      dashArray: "8 5",
      opacity: 0.9,
      weight: 5,
    };
  }

  return {
    color: "#00703c",
    dashArray: "4 7",
    opacity: 0.9,
    weight: 4,
  };
}

function formatKebabLabel(value) {
  return String(value ?? "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderRoute(route, selectedRoute) {
  const style = styleRouteForMap(route);
  const isSelected = selectedRoute?.route_id === route.route_id;

  return [
    "<button class=\"route-line\" type=\"button\" style=\"",
    renderRouteStyle(style),
    "\" data-route-id=\"",
    escapeHtml(route.route_id),
    "\" data-route-status-label=\"",
    escapeHtml(style.statusLabel ?? "Original ATM-style source evidence"),
    "\" data-modal-shift-label=\"",
    escapeHtml(style.modalShiftLabel ?? "Background evidence"),
    "\" aria-controls=\"route-detail\" aria-pressed=\"",
    isSelected ? "true" : "false",
    "\">",
    "<h3>",
    escapeHtml(route.route_name),
    "</h3>",
    "<p>",
    escapeHtml(route.route_geometry_status),
    " from ",
    escapeHtml(route.geometry_source),
    "</p>",
    "<p>",
    escapeHtml(route.route_geometry_notes),
    "</p>",
    "</button>",
  ].join("");
}

function renderDestinationLayer(destinations, options) {
  if (destinations.length === 0) {
    return "";
  }

  return [
    "<div class=\"destination-layer\" data-destination-layer=\"pilot-destinations\">",
    "<label class=\"destination-toggle\">",
    "<input type=\"checkbox\" data-destination-toggle",
    options.showDestinations ? " checked" : "",
    ">",
    "<span>School and key destination context</span>",
    "</label>",
    options.showDestinations
      ? [
          "<div class=\"destination-marker-list\">",
          ...destinations.map(renderDestination),
          "</div>",
        ].join("")
      : "",
    "</div>",
  ].join("");
}

function renderDestination(destination) {
  return [
    "<article class=\"destination-marker\" data-destination-id=\"",
    escapeHtml(destination.destination_id),
    "\" style=\"--destination-x:",
    escapeHtml(destination.display_position?.x ?? 0),
    "%;--destination-y:",
    escapeHtml(destination.display_position?.y ?? 0),
    "%;\">",
    "<p class=\"destination-marker-type\">",
    escapeHtml(destination.destination_type),
    "</p>",
    "<h3>",
    escapeHtml(destination.destination_name),
    "</h3>",
    "<p>",
    escapeHtml(destination.destination_status),
    " / ",
    escapeHtml(destination.location_status),
    "</p>",
    "<p>",
    escapeHtml(destination.provenance_notes),
    "</p>",
    "<p>",
    escapeHtml(destination.uncertainty_notes),
    "</p>",
    "<p>",
    escapeHtml(destination.claim_limits),
    "</p>",
    "</article>",
  ].join("");
}

function renderRouteDetail(route, destinations = []) {
  if (!route) {
    return [
      "<aside class=\"route-detail-panel route-detail-empty\" id=\"route-detail\" aria-label=\"Route detail panel\">",
      "<h2>Route details</h2>",
      "<p>Select a route to review its status, role, evidence notes, and unresolved questions.</p>",
      "</aside>",
    ].join("");
  }

  const detail = formatRouteDetail(route);
  const linkedDestinations = destinations.filter((destination) =>
    destination.related_route_ids?.includes(route.route_id),
  );
  const summaryRows = [
    ["Proposed network status", detail.summary.networkStatus],
    ["Network role", detail.summary.networkRole],
    ["Modal shift potential", detail.summary.modalShiftPotential],
    ["Age-12 independent travel target", detail.summary.age12Target],
    ["School access relevance", detail.summary.schoolAccessRelevance],
    ["Broad intervention need", detail.summary.broadInterventionNeed],
  ];

  return [
    "<aside class=\"route-detail-panel\" id=\"route-detail\" aria-label=\"Route detail panel\">",
    "<p class=\"route-detail-eyebrow\">Route detail</p>",
    "<h2>",
    escapeHtml(detail.summary.title),
    "</h2>",
    "<p class=\"route-detail-corridor\">",
    escapeHtml(detail.summary.corridor),
    "</p>",
    "<dl>",
    ...summaryRows.map(renderSummaryRow),
    "</dl>",
    "<h3>How to read this status</h3>",
    "<p>",
    escapeHtml(detail.statusCaveat),
    "</p>",
    "<h3>Why this route matters</h3>",
    "<p>",
    escapeHtml(detail.whyThisRouteMatters),
    "</p>",
    "<h3>What needs review</h3>",
    "<p>",
    escapeHtml(detail.whatNeedsReview),
    "</p>",
    "<h3>Evidence and provenance</h3>",
    "<ul>",
    ...detail.notes.map((note) => `<li>${escapeHtml(note)}</li>`),
    "</ul>",
    renderLinkedDestinations(linkedDestinations),
    "</aside>",
  ].join("");
}

const schoolAccessLabels = {
  high: "High school access relevance",
  medium: "Medium school access relevance",
  low: "Low school access relevance",
  unknown: "Unknown school access relevance",
};

function renderLinkedDestinations(destinations) {
  if (destinations.length === 0) {
    return "";
  }

  return [
    "<section class=\"route-detail-destinations\">",
    "<h3>Route-linked destination context</h3>",
    "<ul>",
    ...destinations.map(renderLinkedDestination),
    "</ul>",
    "</section>",
  ].join("");
}

function renderLinkedDestination(destination) {
  return [
    "<li>",
    "<strong>",
    escapeHtml(destination.destination_name),
    "</strong>",
    " - ",
    escapeHtml(
      schoolAccessLabels[destination.school_access_relevance] ??
        "Unknown school access relevance",
    ),
    ". ",
    escapeHtml(destination.provenance_notes),
    " ",
    escapeHtml(destination.uncertainty_notes),
    " ",
    escapeHtml(destination.claim_limits),
    "</li>",
  ].join("");
}

function renderSummaryRow([term, description]) {
  return [
    "<div>",
    "<dt>",
    escapeHtml(term),
    "</dt>",
    "<dd>",
    escapeHtml(description),
    "</dd>",
    "</div>",
  ].join("");
}

function renderRouteStyle(style) {
  return [
    "--route-stroke:",
    style.stroke,
    ";--route-stroke-width:",
    style.strokeWidth,
    "px;--route-opacity:",
    style.strokeOpacity,
    ";--route-dasharray:",
    escapeHtml(style.strokeDasharray),
    ";--route-stroke-style:",
    style.strokeDasharray === "none" ? "solid" : "dashed",
    ";--route-layer-order:",
    style.layerOrder,
    ";",
  ].join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
