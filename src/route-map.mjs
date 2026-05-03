import { formatRouteDetail } from "./route-details.mjs";
import { styleRouteForMap } from "./route-styles.mjs";

export function renderRouteMap(routes, options = {}) {
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
    "<div class=\"route-layer route-layer-background\" data-route-layer=\"atm-background\">",
    "<h2>Original ATM-style source evidence</h2>",
    ...backgroundRoutes.map((route) => renderRoute(route, selectedRoute)),
    "</div>",
    "<div class=\"route-layer route-layer-prototype\" data-route-layer=\"prototype-simplified\">",
    "<h2>Simplified prototype layer</h2>",
    ...prototypeRoutes.map((route) => renderRoute(route, selectedRoute)),
    "</div>",
    renderRouteDetail(selectedRoute),
    "<footer class=\"map-attribution\">Route data: checked-in pilot dataset. B&amp;NES Active Travel Masterplan source context retained as background evidence.</footer>",
    "</section>",
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

function renderRouteDetail(route) {
  if (!route) {
    return [
      "<aside class=\"route-detail-panel route-detail-empty\" id=\"route-detail\" aria-label=\"Route detail panel\">",
      "<h2>Route details</h2>",
      "<p>Select a route to review its status, role, evidence notes, and unresolved questions.</p>",
      "</aside>",
    ].join("");
  }

  const detail = formatRouteDetail(route);
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
    "</aside>",
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
