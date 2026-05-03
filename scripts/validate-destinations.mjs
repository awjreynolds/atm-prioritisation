import { readFile } from "node:fs/promises";

const destinationPath = process.argv[2] ?? "data/pilot-destinations.json";
const destinations = JSON.parse(await readFile(destinationPath, "utf8"));
const sourceInventory = JSON.parse(
  await readFile("data/pilot-source-inventory.json", "utf8"),
);
const sourceInventoryById = new Map(
  Array.isArray(sourceInventory.sources)
    ? sourceInventory.sources.map((source) => [source.id, source])
    : [],
);

const requiredFields = [
  "destination_id",
  "destination_name",
  "destination_type",
  "pilot_area",
  "destination_status",
  "location_status",
  "display_position",
  "source_ids",
  "related_route_ids",
  "school_access_relevance",
  "provenance_notes",
  "uncertainty_notes",
  "claim_limits",
];

const allowedDestinationTypes = [
  "school-cluster",
  "settlement-centre",
  "transport-access",
  "healthcare",
  "employment",
  "other-key-destination",
];

const allowedDestinationStatuses = [
  "documented-source-context",
  "indicative-source-context",
  "unknown",
];

const allowedLocationStatuses = ["documented", "indicative", "unknown"];

const allowedSchoolAccessRelevance = ["high", "medium", "low", "unknown"];

const errors = [];

function addError(message) {
  errors.push(message);
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

if (!Array.isArray(destinations) || destinations.length === 0) {
  addError("destination dataset must be a non-empty JSON array");
} else {
  destinations.forEach((destination, index) => {
    if (
      destination === null ||
      typeof destination !== "object" ||
      Array.isArray(destination)
    ) {
      addError(`destination ${index + 1}: must be an object`);
      return;
    }

    const destinationLabel = destination.destination_id ?? `destination ${index + 1}`;

    for (const field of requiredFields) {
      if (!(field in destination)) {
        addError(`${destinationLabel}: missing required field "${field}"`);
      } else if (
        field !== "display_position" &&
        field !== "source_ids" &&
        field !== "related_route_ids" &&
        isBlank(destination[field])
      ) {
        addError(`${destinationLabel}: required field "${field}" cannot be blank`);
      }
    }

    if (
      "destination_type" in destination &&
      !allowedDestinationTypes.includes(destination.destination_type)
    ) {
      addError(
        `${destinationLabel}: unsupported destination_type "${destination.destination_type}"`,
      );
    }

    if (
      "destination_status" in destination &&
      !allowedDestinationStatuses.includes(destination.destination_status)
    ) {
      addError(
        `${destinationLabel}: unsupported destination_status "${destination.destination_status}"`,
      );
    }

    if (
      "location_status" in destination &&
      !allowedLocationStatuses.includes(destination.location_status)
    ) {
      addError(
        `${destinationLabel}: unsupported location_status "${destination.location_status}"`,
      );
    }

    if (
      "school_access_relevance" in destination &&
      !allowedSchoolAccessRelevance.includes(destination.school_access_relevance)
    ) {
      addError(
        `${destinationLabel}: unsupported school_access_relevance "${destination.school_access_relevance}"`,
      );
    }

    if (destination.pilot_area !== "Bath to Somer Valley") {
      addError(`${destinationLabel}: pilot_area must be "Bath to Somer Valley"`);
    }

    if (
      !Array.isArray(destination.source_ids) ||
      destination.source_ids.length === 0 ||
      destination.source_ids.some(isBlank)
    ) {
      addError(`${destinationLabel}: source_ids must list documented sources`);
    } else {
      for (const sourceId of destination.source_ids) {
        const source = sourceInventoryById.get(sourceId);
        if (!source) {
          addError(`${destinationLabel}: source_id "${sourceId}" is not in the source inventory`);
        } else if (source.mvp_dataset_safety !== "safe-for-first-prototype") {
          addError(
            `${destinationLabel}: source_id "${sourceId}" must be safe-for-first-prototype`,
          );
        }
      }
    }

    if (
      !Array.isArray(destination.related_route_ids) ||
      destination.related_route_ids.some(isBlank)
    ) {
      addError(`${destinationLabel}: related_route_ids must be an array`);
    }

    if (
      destination.display_position === null ||
      typeof destination.display_position !== "object" ||
      Array.isArray(destination.display_position) ||
      typeof destination.display_position.x !== "number" ||
      typeof destination.display_position.y !== "number"
    ) {
      addError(`${destinationLabel}: display_position must include numeric x and y`);
    }

    const claimLimits = String(destination.claim_limits ?? "").toLowerCase();
    for (const bannedClaim of [
      "no school-run impact",
      "no catchment coverage",
      "no route preference",
      "no quantified modal-shift claims",
    ]) {
      if (!claimLimits.includes(bannedClaim)) {
        addError(`${destinationLabel}: claim_limits must include ${bannedClaim}`);
      }
    }
  });
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
