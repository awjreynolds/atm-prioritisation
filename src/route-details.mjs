const labels = {
  network_status: {
    preferred: "Preferred in simplified layer",
    supporting: "Supporting route",
    "not-preferred": "Not preferred in simplified layer",
    "needs-review": "Needs review",
  },
  network_role: {
    "utility-spine": "Utility spine",
    "settlement-connector": "Settlement connector",
    "school-access-link": "School access link",
    "greenway-strategic-link": "Greenway strategic link",
    "leisure-tourism-link": "Leisure and tourism link",
    "bus-corridor-access": "Bus corridor access",
    "gap-filler": "Gap filler",
    "local-feeder": "Local feeder",
    unknown: "Unknown network role",
  },
  modal_shift_potential: {
    high: "High modal shift potential",
    medium: "Medium modal shift potential",
    low: "Low modal shift potential",
    unknown: "Unknown modal shift potential",
  },
  age12_standard_target: {
    "likely-after-intervention": "Likely after intervention",
    "partial-after-intervention": "Partial after intervention",
    "unlikely-without-major-change": "Unlikely without major change",
    "already-good-enough": "Already good enough",
    unknown: "Unknown age-12 independent travel target",
  },
  school_access_relevance: {
    high: "High school access relevance",
    medium: "Medium school access relevance",
    low: "Low school access relevance",
    unknown: "Unknown school access relevance",
  },
  broad_intervention_need: {
    "existing-route-may-be-sufficient": "Existing route may be sufficient",
    "upgrade-likely-needed": "Upgrade likely needed",
    "new-or-substantially-improved-route-likely-needed":
      "New or substantially improved route likely needed",
    "officer-review-needed": "Officer review needed",
    unknown: "Unknown intervention need",
  },
};

const statusCaveats = {
  preferred:
    "Preferred in this simplified layer means a candidate investment priority for review; it does not mean the route is already safe or usable today.",
  supporting:
    "Supporting route means useful network context or connection; it is separate from a preferred investment status.",
  "not-preferred":
    "Not preferred in this simplified layer means the prototype is not prioritising this route; it does not delete source evidence or make a final route decision.",
  "needs-review":
    "Needs review means the available evidence is not enough to assign a stronger prototype status.",
};

export function formatRouteDetail(route) {
  return {
    summary: {
      title: route.route_name,
      corridor: route.corridor_name,
      networkStatus: labelFor(route, "network_status"),
      networkRole: labelFor(route, "network_role"),
      modalShiftPotential: labelFor(route, "modal_shift_potential"),
      age12Target: labelFor(route, "age12_standard_target"),
      schoolAccessRelevance: labelFor(route, "school_access_relevance"),
      broadInterventionNeed: labelFor(route, "broad_intervention_need"),
    },
    statusCaveat: statusCaveatFor(route),
    whyThisRouteMatters: route.why_this_route_matters,
    whatNeedsReview: route.what_needs_review,
    notes: [
      route.evidence_notes,
      route.provenance_notes,
      route.uncertainty_notes,
    ].filter((note) => typeof note === "string" && note.trim() !== ""),
  };
}

function statusCaveatFor(route) {
  const caveat = statusCaveats[route.network_status];
  if (!caveat) {
    throw new RangeError(
      `Unsupported network_status value "${route.network_status}"`,
    );
  }

  return caveat;
}

function labelFor(route, field) {
  const label = labels[field]?.[route[field]];
  if (!label) {
    throw new RangeError(`Unsupported ${field} value "${route[field]}"`);
  }

  return label;
}
