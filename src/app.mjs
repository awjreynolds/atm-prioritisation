import { renderRouteMap } from "./route-map.mjs";

const routeDatasetUrl = "data/pilot-routes.json";
const routeMap = document.querySelector("#route-map");

if (routeMap) {
  const response = await fetch(routeDatasetUrl);
  const routes = await response.json();
  routeMap.innerHTML = renderRouteMap(routes);
}
