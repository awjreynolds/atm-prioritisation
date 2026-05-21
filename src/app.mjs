import { hydrateLeafletRouteMap, renderRouteMap } from "./route-map.mjs";

const routeDatasetUrl = "data/pilot-routes.json";
const destinationDatasetUrl = "data/pilot-destinations.json";
const atmRoutesGeoJsonUrl = "data/atm-routes-bath-somer-valley.geojson";
const banesAtmGeoJsonUrl = "data/banes-atm-full.geojson";
const leafletCssUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const leafletScriptUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const routeMap = document.querySelector("#route-map");

if (routeMap) {
  const [
    routeResponse,
    destinationResponse,
    atmRoutesGeoJsonResponse,
    banesAtmGeoJsonResponse,
  ] = await Promise.all([
    fetch(routeDatasetUrl),
    fetch(destinationDatasetUrl),
    fetch(atmRoutesGeoJsonUrl),
    fetch(banesAtmGeoJsonUrl),
  ]);
  const routes = await routeResponse.json();
  const destinations = await destinationResponse.json();
  const atmRoutesGeoJson = await atmRoutesGeoJsonResponse.json();
  const banesAtmGeoJson = await banesAtmGeoJsonResponse.json();
  const leafletReady = loadLeaflet();
  let selectedRouteId = null;
  let showDestinations = true;

  function renderSelectedRouteMap() {
    routeMap.innerHTML = renderRouteMap(routes, {
      atmRoutesGeoJson,
      banesAtmGeoJson,
      destinations,
      selectedRouteId,
      showDestinations,
    });
    leafletReady
      .then(() => {
        hydrateLeafletRouteMap(routeMap, {
          atmRoutesGeoJson,
          banesAtmGeoJson,
          routes,
          selectedRouteId,
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
