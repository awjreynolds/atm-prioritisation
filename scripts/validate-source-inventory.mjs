import { readFile } from "node:fs/promises";

const inventoryPath = "data/pilot-source-inventory.json";

const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));

const requiredSourceFields = [
  "id",
  "title",
  "publisher",
  "url",
  "category",
  "evidence_strength",
  "mvp_dataset_safety",
  "what_it_would_be_used_for",
  "provenance_guidance",
  "uncertainty_guidance",
  "claim_limits",
];

const requiredCategories = [
  "atm-route-evidence",
  "greenway-context",
  "a367-hypothesis",
  "schools-destinations",
  "ncn-context",
  "bus-context",
  "transport-connectivity",
  "design-guidance",
  "advisory-map-context",
  "unavailable-or-unsuitable",
];

const allowedEvidenceStrength = [
  "official-source-evidence",
  "official-guidance",
  "advisory-context",
  "hypothesis-input",
  "unavailable",
  "unsuitable",
];

const allowedDatasetSafety = [
  "safe-for-first-prototype",
  "review-before-use",
  "unavailable-for-mvp",
  "unsuitable-for-mvp",
];

const errors = [];

function addError(message) {
  errors.push(message);
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

if (inventory === null || typeof inventory !== "object" || Array.isArray(inventory)) {
  addError("inventory must be a JSON object");
} else {
  if (inventory.pilot_area !== "Bath to Somer Valley") {
    addError('inventory.pilot_area must be "Bath to Somer Valley"');
  }

  if (inventory.review_status !== "reviewed-for-mvp") {
    addError('inventory.review_status must be "reviewed-for-mvp"');
  }

  if (!Array.isArray(inventory.guardrails) || inventory.guardrails.length === 0) {
    addError("inventory.guardrails must list claim guardrails");
  } else {
    const guardrailText = inventory.guardrails.join(" ").toLowerCase();
    for (const claim of [
      "route",
      "car-mile",
      "school-run",
      "funding",
      "deliverability",
    ]) {
      if (!guardrailText.includes(claim)) {
        addError(`inventory.guardrails must cover ${claim} claims`);
      }
    }
  }

  if (!Array.isArray(inventory.sources) || inventory.sources.length === 0) {
    addError("inventory.sources must contain source records");
  } else {
    const categories = new Set();

    inventory.sources.forEach((source, sourceIndex) => {
      if (source === null || typeof source !== "object" || Array.isArray(source)) {
        addError(`source ${sourceIndex + 1}: must be an object`);
        return;
      }

      const sourceLabel = source.id ?? `source ${sourceIndex + 1}`;

      for (const field of requiredSourceFields) {
        if (!(field in source)) {
          addError(`${sourceLabel}: missing required field "${field}"`);
        } else if (isBlank(source[field])) {
          addError(`${sourceLabel}: required field "${field}" cannot be blank`);
        }
      }

      if ("url" in source && !source.url.startsWith("https://")) {
        addError(`${sourceLabel}: url must use https`);
      }

      if (
        "evidence_strength" in source &&
        !allowedEvidenceStrength.includes(source.evidence_strength)
      ) {
        addError(
          `${sourceLabel}: unsupported evidence_strength "${source.evidence_strength}"`,
        );
      }

      if (
        "mvp_dataset_safety" in source &&
        !allowedDatasetSafety.includes(source.mvp_dataset_safety)
      ) {
        addError(
          `${sourceLabel}: unsupported mvp_dataset_safety "${source.mvp_dataset_safety}"`,
        );
      }

      if ("category" in source) {
        categories.add(source.category);
      }
    });

    for (const category of requiredCategories) {
      if (!categories.has(category)) {
        addError(`inventory missing required category "${category}"`);
      }
    }

    const a367Sources = inventory.sources.filter(
      (source) => source.category === "a367-hypothesis",
    );
    if (
      !a367Sources.some(
        (source) =>
          source.mvp_dataset_safety === "review-before-use" &&
          source.claim_limits.includes("not route preference"),
      )
    ) {
      addError("A367 inventory source must remain a hypothesis, not route preference");
    }

    const greenwaySources = inventory.sources.filter(
      (source) => source.category === "greenway-context",
    );
    if (
      !greenwaySources.some((source) =>
        source.claim_limits.includes("not automatically preferred"),
      )
    ) {
      addError(
        "greenway inventory source must not be treated as automatically preferred",
      );
    }

    if (
      !inventory.sources.some((source) =>
        ["unavailable-for-mvp", "unsuitable-for-mvp"].includes(
          source.mvp_dataset_safety,
        ),
      )
    ) {
      addError("inventory must explicitly mark unavailable or unsuitable data");
    }

    for (const evidenceStrength of [
      "official-source-evidence",
      "advisory-context",
      "hypothesis-input",
    ]) {
      if (!inventory.sources.some((source) => source.evidence_strength === evidenceStrength)) {
        addError(`inventory must include ${evidenceStrength} sources`);
      }
    }

    if (
      !inventory.sources.some(
        (source) => source.mvp_dataset_safety === "safe-for-first-prototype",
      )
    ) {
      addError("inventory must identify sources safe for the first prototype");
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
