export function renderRouteMap(routes) {
  const backgroundRoutes = routes.filter(
    (route) => route.route_layer === "atm-background",
  );
  const prototypeRoutes = routes.filter(
    (route) => route.route_layer === "prototype-simplified",
  );

  return [
    "<section class=\"route-map\" aria-label=\"Pilot route map\">",
    "<div class=\"route-layer route-layer-background\" data-route-layer=\"atm-background\">",
    "<h2>Original ATM-style source evidence</h2>",
    ...backgroundRoutes.map(renderRoute),
    "</div>",
    "<div class=\"route-layer route-layer-prototype\" data-route-layer=\"prototype-simplified\">",
    "<h2>Simplified prototype layer</h2>",
    ...prototypeRoutes.map(renderRoute),
    "</div>",
    "<footer class=\"map-attribution\">Route data: checked-in pilot dataset. B&amp;NES Active Travel Masterplan source context retained as background evidence.</footer>",
    "</section>",
  ].join("");
}

function renderRoute(route) {
  return [
    "<article class=\"route-line\" data-route-id=\"",
    escapeHtml(route.route_id),
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
    "</article>",
  ].join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
