import { renderRouteMap } from "./route-map.mjs";

const routeDatasetUrl = "data/pilot-routes.json";
const destinationDatasetUrl = "data/pilot-destinations.json";
const routeMap = document.querySelector("#route-map");

if (routeMap) {
  const [routeResponse, destinationResponse] = await Promise.all([
    fetch(routeDatasetUrl),
    fetch(destinationDatasetUrl),
  ]);
  const routes = await routeResponse.json();
  const destinations = await destinationResponse.json();
  let selectedRouteId = null;
  let showDestinations = true;

  function renderSelectedRouteMap() {
    routeMap.innerHTML = renderRouteMap(routes, {
      destinations,
      selectedRouteId,
      showDestinations,
    });
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
