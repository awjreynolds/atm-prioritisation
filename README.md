# ATM Prioritisation Prototype

This repository contains an independent proof of concept for exploring how the
Bath and North East Somerset Active Travel Masterplan could be simplified into
a clearer prioritisation layer.

It is not an official council plan, not produced or endorsed by Bath and North
East Somerset Council or WECA, not a formal LCWIP, and not a final prioritised
network.

## Prototype Aim

The first prototype is intended to be a map-first review tool. It will start
with the Bath to Somer Valley pilot area and test whether a simplified view of
candidate corridors can help reviewers discuss modal shift potential, safe
independent travel, school access, and route roles without treating unresolved
evidence questions as facts.

## Hosting

The prototype is designed to be hosted as a static site on GitHub Pages. The MVP
does not require a backend, database, authentication, or private API keys.

## Prototype Data Assumptions

Any early route or destination data must be treated as prototype data unless its
source and certainty are documented. Indicative or hand-curated data should be
labelled as such in both the source files and the user interface.

The project must not make claims about preferred routes, car-mile reduction,
school-run impact, funding eligibility, or route feasibility unless supporting
evidence has been added.

## Local Development

```sh
npm test
npm run test:smoke
npm run build
npm run validate:sources
npm run validate:destinations
```

The build output is written to `dist/`.

`npm run test:smoke` builds the static site, loads the generated `dist/`
assets through a local static-asset harness, verifies the MVP loads, checks the
caveat, route rendering, route-detail selection, legend wording, narrow/mobile
CSS coverage, and runs focused accessibility assertions over the rendered
prototype surface.

## Route Data Contract

Pilot route records are validated against `data/route-contract.json`. The
contract contains the MVP route fields, allowed values for controlled fields,
and required provenance, evidence, and uncertainty notes.

Validate a route record file locally with:

```sh
npm run validate:routes -- path/to/routes.json
```

Use `unknown`, `needs-review`, and review notes where the MVP brief identifies
unresolved evidence questions. Do not encode final route conclusions unless the
supporting evidence has been added.

## Pilot Route Dataset

The first checked-in Bath to Somer Valley seed dataset lives in
`data/pilot-routes.json`. It is intentionally small enough for manual review and
contains both original ATM-style background records and simplified prototype
review records.

Validate it locally with:

```sh
npm run validate:routes -- data/pilot-routes.json
```

Records include provenance, evidence, uncertainty, source IDs, data status, and
geometry-labelling fields. Prototype or hand-curated geometry must remain marked
as indicative, and the A367 utility-corridor record must remain a hypothesis for
review rather than a preferred alignment.

## Pilot Source Inventory

The reviewed pilot source inventory lives in
`data/pilot-source-inventory.json`. It records candidate evidence sources for
the Bath to Somer Valley pilot, including ATM route evidence, greenway context,
the A367 utility-corridor hypothesis, schools and destinations, NCN context, bus
context, transport connectivity data, design guidance, advisory map context, and
sources that are unavailable or unsuitable for MVP use.

Validate the inventory locally with:

```sh
npm run validate:sources
```

The inventory must distinguish official source evidence from advisory context,
keep hypotheses marked as hypotheses, and identify which sources are safe enough
for the first prototype dataset.

## Pilot Destination Dataset

The pilot destination dataset lives in `data/pilot-destinations.json`. It adds
school and key-destination context for the Bath to Somer Valley pilot without
attempting full catchment modelling.

Validate it locally with:

```sh
npm run validate:destinations
```

Destination records must include source IDs, provenance notes, uncertainty
notes, and claim limits. Indicative destination context must remain labelled as
indicative or unknown, and the dataset must make no school-run impact,
catchment coverage, route preference, or quantified modal-shift claims.
