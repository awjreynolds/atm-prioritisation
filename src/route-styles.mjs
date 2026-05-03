const statusStyles = {
  preferred: {
    stroke: "#0072b2",
    strokeDasharray: "none",
    statusLabel: "Preferred in simplified layer",
  },
  supporting: {
    stroke: "#009e73",
    strokeDasharray: "8 4",
    statusLabel: "Supporting route",
  },
  "not-preferred": {
    stroke: "#d55e00",
    strokeDasharray: "2 5",
    statusLabel: "Not preferred in simplified layer",
  },
  "needs-review": {
    stroke: "#cc79a7",
    strokeDasharray: "10 3 2 3",
    statusLabel: "Needs review",
  },
};

const modalShiftStyles = {
  high: {
    strokeWidth: 8,
    modalShiftLabel: "High modal shift potential",
  },
  medium: {
    strokeWidth: 5,
    modalShiftLabel: "Medium modal shift potential",
  },
  low: {
    strokeWidth: 3,
    modalShiftLabel: "Low modal shift potential",
  },
  unknown: {
    strokeWidth: 4,
    modalShiftLabel: "Unknown modal shift potential",
  },
};

export function styleRouteForMap(route) {
  const statusStyle = statusStyles[route.network_status];
  if (!statusStyle) {
    throw new RangeError(
      `Unsupported network_status value "${route.network_status}"`,
    );
  }

  const modalShiftStyle = modalShiftStyles[route.modal_shift_potential];
  if (!modalShiftStyle) {
    throw new RangeError(
      `Unsupported modal_shift_potential value "${route.modal_shift_potential}"`,
    );
  }

  if (route.route_layer === "atm-background") {
    return {
      stroke: "#b8c2cc",
      strokeWidth: 2,
      strokeOpacity: 0.45,
      strokeDasharray: "2 7",
      layerOrder: 0,
    };
  }

  return {
    stroke: statusStyle.stroke,
    strokeWidth: modalShiftStyle.strokeWidth,
    strokeOpacity: 0.9,
    strokeDasharray: statusStyle.strokeDasharray,
    layerOrder: 1,
    statusLabel: statusStyle.statusLabel,
    modalShiftLabel: modalShiftStyle.modalShiftLabel,
  };
}
