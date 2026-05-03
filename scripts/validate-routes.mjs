import { readFile } from "node:fs/promises";

const [routeFile] = process.argv.slice(2);

if (!routeFile) {
  console.error("Usage: node scripts/validate-routes.mjs <route-records.json>");
  process.exit(1);
}

const routes = JSON.parse(await readFile(routeFile, "utf8"));
const routeContract = JSON.parse(
  await readFile("data/route-contract.json", "utf8"),
);

if (!Array.isArray(routes)) {
  console.error("Route records must be a JSON array.");
  process.exit(1);
}

const errors = [];

routes.forEach((route, routeIndex) => {
  if (route === null || typeof route !== "object" || Array.isArray(route)) {
    errors.push(`record ${routeIndex + 1}: route record must be an object`);
    return;
  }

  const routeLabel = route.route_id ?? `record ${routeIndex + 1}`;

  for (const field of routeContract.requiredFields) {
    if (!(field in route)) {
      errors.push(`${routeLabel}: missing required field "${field}"`);
    } else if (typeof route[field] === "string" && route[field].trim() === "") {
      errors.push(`${routeLabel}: required field "${field}" cannot be blank`);
    }
  }

  for (const [field, allowedValues] of Object.entries(
    routeContract.allowedValues,
  )) {
    if (field in route && !allowedValues.includes(route[field])) {
      errors.push(
        `${routeLabel}: unsupported ${field} value "${route[field]}"`,
      );
    }
  }
});

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
