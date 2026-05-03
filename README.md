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
npm run build
```

The build output is written to `dist/`.
