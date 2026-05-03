import { formatRouteDetail } from "./route-details.mjs";
import { styleRouteForMap } from "./route-styles.mjs";

export function renderRouteMap(routes, options = {}) {
  const destinations = Array.isArray(options.destinations)
    ? options.destinations
    : [];
  const showDestinations = options.showDestinations !== false;
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
    renderSketchMap(routes, selectedRoute),
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

function renderSketchMap(routes, selectedRoute) {
  const routesWithGeometry = routes.filter((route) =>
    Array.isArray(route.map_geometry?.points),
  );

  if (routesWithGeometry.length === 0) {
    return "";
  }

  return [
    "<div class=\"route-sketch\" aria-label=\"Indicative route map sketch\">",
    "<svg class=\"route-sketch-map\" viewBox=\"0 0 100 100\" role=\"img\" aria-labelledby=\"route-sketch-title route-sketch-description\">",
    "<title id=\"route-sketch-title\">Bath to Somer Valley indicative route sketch</title>",
    "<desc id=\"route-sketch-description\">Clickable indicative route lines showing original ATM-style source evidence and simplified prototype corridors. Lines are sketch geometry, not official route alignments.</desc>",
    renderSketchBackground(),
    ...routesWithGeometry.map((route) =>
      renderSketchRoute(route, selectedRoute),
    ),
    renderSketchLabel("Bath", 12, 86),
    renderSketchLabel("Odd Down", 29, 64),
    renderSketchLabel("Peasedown St John", 45, 45),
    renderSketchLabel("Radstock", 67, 62),
    renderSketchLabel("Midsomer Norton", 73, 88),
    "</svg>",
    "<p class=\"route-sketch-note\">Indicative sketch only: original ATM-style source evidence is shown as pale background context and prototype routes are shown above it. These lines are not official alignments.</p>",
    "</div>",
  ].join("");
}

function renderSketchBackground() {
  return [
    "<rect class=\"route-sketch-base\" x=\"0\" y=\"0\" width=\"100\" height=\"100\"></rect>",
    "<path class=\"route-sketch-context route-sketch-context-a\" d=\"M8 30 C22 24 33 24 45 33 S68 44 91 36\"></path>",
    "<path class=\"route-sketch-context route-sketch-context-b\" d=\"M11 82 C25 75 36 70 49 73 S72 86 90 79\"></path>",
    "<path class=\"route-sketch-road\" d=\"M17 80 C31 62 47 49 62 38 S78 28 87 22\"></path>",
  ].join("");
}

function renderSketchRoute(route, selectedRoute) {
  const style = styleRouteForMap(route);
  const isSelected = selectedRoute?.route_id === route.route_id;

  return [
    "<path class=\"route-sketch-line",
    route.route_layer === "atm-background"
      ? " route-sketch-line-background"
      : " route-sketch-line-prototype",
    isSelected ? " route-sketch-line-selected" : "",
    "\" d=\"",
    renderSketchPath(route.map_geometry.points),
    "\" style=\"",
    renderRouteStyle(style),
    "\" data-route-id=\"",
    escapeHtml(route.route_id),
    "\" data-route-layer=\"",
    escapeHtml(route.route_layer),
    "\" tabindex=\"0\" role=\"button\" aria-controls=\"route-detail\" aria-pressed=\"",
    isSelected ? "true" : "false",
    "\" aria-label=\"Review ",
    escapeHtml(route.route_name),
    "\"></path>",
  ].join("");
}

function renderSketchPath(points) {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
}

function renderSketchLabel(label, x, y) {
  return [
    "<text class=\"route-sketch-label\" x=\"",
    x,
    "\" y=\"",
    y,
    "\">",
    escapeHtml(label),
    "</text>",
  ].join("");
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
