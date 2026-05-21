import {
  hydrateLeafletRouteMap,
  renderRouteMap,
} from "./route-map.mjs?v=ncn-review-current-20260521";

const routeDatasetUrl = "data/pilot-routes.json";
const destinationDatasetUrl = "data/pilot-destinations.json";
const atmRoutesGeoJsonUrl = "data/atm-routes-bath-somer-valley.geojson";
const banesAtmGeoJsonUrl = "data/banes-atm-full.geojson";
const wecaLcwipUrbanAreasGeoJsonUrl = "data/weca-lcwip-urban-areas.geojson";
const wecaSatnCentroidsGeoJsonUrl =
  "data/weca-satn-centroids.geojson?v=bath-centre-centroids-20260521";
const wecaStrategicNetworkGeoJsonUrl =
  "data/weca-strategic-network.geojson?v=weca-core-network-20260521";
const nationalCycleNetworkGeoJsonUrl = "data/national-cycle-network.geojson";
const leafletCssUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const leafletScriptUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const routeMap = document.querySelector("#route-map");

if (routeMap) {
  const [
    routeResponse,
    destinationResponse,
    atmRoutesGeoJsonResponse,
    banesAtmGeoJsonResponse,
    wecaLcwipUrbanAreasGeoJsonResponse,
    wecaSatnCentroidsGeoJsonResponse,
    wecaStrategicNetworkGeoJsonResponse,
    nationalCycleNetworkGeoJsonResponse,
  ] = await Promise.all([
    fetch(routeDatasetUrl),
    fetch(destinationDatasetUrl),
    fetch(atmRoutesGeoJsonUrl),
    fetch(banesAtmGeoJsonUrl),
    fetch(wecaLcwipUrbanAreasGeoJsonUrl),
    fetch(wecaSatnCentroidsGeoJsonUrl),
    fetch(wecaStrategicNetworkGeoJsonUrl),
    fetch(nationalCycleNetworkGeoJsonUrl),
  ]);
  const routes = await routeResponse.json();
  const destinations = await destinationResponse.json();
  const atmRoutesGeoJson = await atmRoutesGeoJsonResponse.json();
  const banesAtmGeoJson = await banesAtmGeoJsonResponse.json();
  const wecaLcwipUrbanAreasGeoJson =
    await wecaLcwipUrbanAreasGeoJsonResponse.json();
  const wecaSatnCentroidsGeoJson = await wecaSatnCentroidsGeoJsonResponse.json();
  const wecaStrategicNetworkGeoJson =
    await wecaStrategicNetworkGeoJsonResponse.json();
  const nationalCycleNetworkGeoJson =
    await nationalCycleNetworkGeoJsonResponse.json();
  const leafletReady = loadLeaflet();
  let selectedRouteId = null;
  let showDestinations = true;
  let showAtmStrategicLayer = false;
  let showAtmQuietLayer = false;
  let showAtmCommunityConnectionsLayer = false;
  let showAtmMissingPavementLayer = false;
  let showUrbanEvidenceLayer = false;
  let showWecaStrategicNetworkLayer = true;
  let showQuietLaneOpportunitiesLayer = false;
  let showDeprecatedNcnOpportunitiesLayer = false;
  let showNationalCycleNetworkLayer = false;

  function renderSelectedRouteMap() {
    routeMap.innerHTML = renderRouteMap(routes, {
      atmRoutesGeoJson,
      banesAtmGeoJson,
      wecaLcwipUrbanAreasGeoJson,
      wecaSatnCentroidsGeoJson,
      wecaStrategicNetworkGeoJson,
      nationalCycleNetworkGeoJson,
      destinations,
      selectedRouteId,
      showDestinations,
      showAtmStrategicLayer,
      showAtmQuietLayer,
      showAtmCommunityConnectionsLayer,
      showAtmMissingPavementLayer,
      showUrbanEvidenceLayer,
      showWecaStrategicNetworkLayer,
      showQuietLaneOpportunitiesLayer,
      showDeprecatedNcnOpportunitiesLayer,
      showNationalCycleNetworkLayer,
    });
    leafletReady
      .then(() => {
        hydrateLeafletRouteMap(routeMap, {
          atmRoutesGeoJson,
          banesAtmGeoJson,
          wecaLcwipUrbanAreasGeoJson,
          wecaSatnCentroidsGeoJson,
          wecaStrategicNetworkGeoJson,
          nationalCycleNetworkGeoJson,
          routes,
          selectedRouteId,
          showAtmStrategicLayer,
          showAtmQuietLayer,
          showAtmCommunityConnectionsLayer,
          showAtmMissingPavementLayer,
          showUrbanEvidenceLayer,
          showWecaStrategicNetworkLayer,
          showQuietLaneOpportunitiesLayer,
          showDeprecatedNcnOpportunitiesLayer,
          showNationalCycleNetworkLayer,
          onRouteSelect(routeId) {
            selectedRouteId = routeId;
            renderSelectedRouteMap();
          },
        });
      })
      .catch(() => {});
  }

  routeMap.addEventListener("click", (event) => {
    const destinationToggle = event.target.closest("[data-destination-toggle]");
    if (destinationToggle) {
      showDestinations = destinationToggle.checked;
      renderSelectedRouteMap();
      return;
    }

    const layerAction = event.target.closest("[data-map-layer-action]");
    if (layerAction) {
      const visible = layerAction.dataset.mapLayerAction === "select-all";
      showAtmStrategicLayer = visible;
      showAtmQuietLayer = visible;
      showAtmCommunityConnectionsLayer = visible;
      showAtmMissingPavementLayer = visible;
      showUrbanEvidenceLayer = visible;
      showWecaStrategicNetworkLayer = visible;
      showQuietLaneOpportunitiesLayer = visible;
      showDeprecatedNcnOpportunitiesLayer = visible;
      showNationalCycleNetworkLayer = visible;
      renderSelectedRouteMap();
      return;
    }

    const layerToggle = event.target.closest("[data-map-layer-toggle]");
    if (layerToggle) {
      switch (layerToggle.dataset.mapLayerToggle) {
        case "atm-strategic":
          showAtmStrategicLayer = layerToggle.checked;
          break;
        case "atm-quiet":
          showAtmQuietLayer = layerToggle.checked;
          break;
        case "atm-community-connections":
          showAtmCommunityConnectionsLayer = layerToggle.checked;
          break;
        case "atm-missing-pavement":
          showAtmMissingPavementLayer = layerToggle.checked;
          break;
        case "urban-evidence":
          showUrbanEvidenceLayer = layerToggle.checked;
          break;
        case "weca-strategic-network":
          showWecaStrategicNetworkLayer = layerToggle.checked;
          break;
        case "quiet-lane-opportunities":
          showQuietLaneOpportunitiesLayer = layerToggle.checked;
          break;
        case "deprecated-ncn-opportunities":
          showDeprecatedNcnOpportunitiesLayer = layerToggle.checked;
          break;
        case "national-cycle-network":
          showNationalCycleNetworkLayer = layerToggle.checked;
          break;
      }

      renderSelectedRouteMap();
      return;
    }

    const routeControl = event.target.closest("[data-route-id]");
    if (!routeControl) {
      return;
    }

    selectedRouteId = routeControl.dataset.routeId;
    renderSelectedRouteMap();
  });

  routeMap.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const routeControl = event.target.closest("[data-route-id]");
    if (!routeControl) {
      return;
    }

    event.preventDefault();
    selectedRouteId = routeControl.dataset.routeId;
    renderSelectedRouteMap();
  });

  renderSelectedRouteMap();
}

function loadLeaflet() {
  if (!globalThis.window || globalThis.window.L || !document.createElement) {
    return Promise.resolve();
  }

  if (!document.querySelector(`link[href="${leafletCssUrl}"]`)) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = leafletCssUrl;
    document.head.append(stylesheet);
  }

  if (globalThis.window.__atmLeafletLoading) {
    return globalThis.window.__atmLeafletLoading;
  }

  globalThis.window.__atmLeafletLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = leafletScriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Leaflet"));
    document.head.append(script);
  });

  return globalThis.window.__atmLeafletLoading;
}
