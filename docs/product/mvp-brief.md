# MVP Brief: ATM Prioritisation Prototype

## Purpose

Build an unofficial interactive proof-of-concept website that explores how the Bath and North East Somerset Active Travel Masterplan could be simplified into a clearer prioritisation layer.

The prototype is intended to help officers and other interested reviewers think through the problem. It is not a council-owned plan, a WECA-owned plan, a formal LCWIP, or a final prioritised network.

## Confirmed Decisions

### Product

- The first deliverable should be an interactive review website.
- The website should be framed as an independent hackathon-style proof of concept.
- The website should make personal ownership clear and avoid implying council or WECA endorsement.
- The website should support discussion and officer feedback rather than claim to be final.
- The first version should avoid over-modelling and should be iterated after feedback.

### Pilot Area

- The proof of concept should start with a small pilot area rather than full B&NES coverage.
- The preferred pilot is the Bath to Somer Valley corridor.
- The pilot should explore the relationship between:
  - the existing/official greenway logic, such as Two Tunnels and Colliers Way connections, and
  - the A367 utility-corridor hypothesis through or near Odd Down, Peasedown St John, Radstock, Midsomer Norton, and Westfield.
- This comparison is a hypothesis to test, not a conclusion that the A367 is automatically preferred.

### Map Purpose

- The main visual should reduce ATM route noise.
- The map should show high-potential everyday active travel corridors.
- The output should distinguish the council's candidate ATM routes from a simplified prototype prioritisation layer.
- Existing ATM routes should be preserved as background evidence, not deleted.
- Original ATM routes can be shown as a pale background layer.
- The simplified layer should be visually cleaner than the current ATM map.

### Route Interpretation

- The ATM's `quiet` and `strategic` route labels should be treated as council source evidence, not as proof that a route is correct.
- The prototype should recognise that different routes may serve different roles.
- The prototype should not force a leisure or greenway route and a main-road utility corridor to compete as if they serve exactly the same purpose.
- Route role should be separate from priority status where that helps simplify interpretation.

### Modal Shift

- Modal shift potential should be a key measure.
- The main map should visually communicate modal shift potential.
- Line width is the preferred visual encoding for modal shift potential.
- Modal shift should be connected to the policy objective of reducing car miles.
- High modal shift potential should focus on realistic everyday journeys between larger settlements, urban areas, schools, employment, healthcare, public transport, and other useful destinations.
- The prototype should not claim quantified car-mile reduction unless data supports it.

### Independent Travel And Schools

- Safe independent travel should be a core lens.
- The headline quality test should be whether a typical 12-year-old could plausibly use the route independently after the right intervention.
- Safe routes to schools should be a priority.
- Travel independence for under-18s should be visible in the prototype.
- The prototype should avoid designing only for confident adult sports cyclists.
- School access should be treated as more than a generic destination score.
- The prototype should not claim a route will reduce school-run traffic unless evidence supports that claim.

### Infrastructure Quality

- LTN 1/20 should inform the quality standard.
- For the prototype, LTN 1/20 should be translated into simple language rather than a detailed engineering audit.
- A corridor can be high priority for investment even if the current route is not good enough today.
- The prototype should distinguish "preferred for investment" from "already safe and usable".
- Existing infrastructure that is good enough should be allowed to remain part of the network without implying that further work is needed.
- Version one should avoid section-level intervention audits.
- Intervention need should be broad and corridor-level only in the MVP.

### Funding And Policy Alignment

- The prototype should help make the case for routes that align with B&NES and WECA climate and transport objectives.
- Funding alignment should be considered, especially where routes support modal shift, reduced car miles, education access, employment access, bus integration, or sustainable transport connectivity.
- Funding alignment should not become a detailed scoring model in the MVP.
- The prototype should avoid claiming formal funding eligibility unless that has been verified.

### User Experience

- The default experience should be map-first.
- Councillors and non-specialist reviewers should be able to understand the main point visually without reading detailed evidence.
- Route details should use progressive disclosure:
  - simple visual map first,
  - one-sentence route rationale second,
  - detailed evidence only if needed later.
- The UI should be colourblind-safe and should not rely on colour alone.
- Recommended visual encodings:
  - colour for route status,
  - line width for modal shift potential,
  - pale grey for original ATM background routes.

### Tone

- The language should be neutral, constructive, and non-adversarial.
- The prototype should not say or imply that current council work is terrible.
- The prototype should not celebrate existing provision uncritically.
- The language should prefer phrases such as:
  - "proposed status"
  - "evidence suggests"
  - "for review"
  - "candidate route"
  - "not preferred in this simplified layer"
- The site must clearly state that it is unofficial independent work.

## MVP Route Fields

These fields are enough for the first prototype. They should not imply more precision than the available data supports.

- `route_id`
- `route_name`
- `corridor_name`
- `source_atm_classification`
- `network_status`
- `network_role`
- `modal_shift_potential`
- `age12_standard_target`
- `school_access_relevance`
- `broad_intervention_need`
- `why_this_route_matters`
- `what_needs_review`
- `evidence_notes`

## Suggested Field Values

### `network_status`

- `preferred`
- `supporting`
- `not-preferred`
- `needs-review`

### `network_role`

- `utility-spine`
- `settlement-connector`
- `school-access-link`
- `greenway-strategic-link`
- `leisure-tourism-link`
- `bus-corridor-access`
- `gap-filler`
- `local-feeder`
- `unknown`

### `modal_shift_potential`

- `high`
- `medium`
- `low`
- `unknown`

### `age12_standard_target`

- `likely-after-intervention`
- `partial-after-intervention`
- `unlikely-without-major-change`
- `already-good-enough`
- `unknown`

### `school_access_relevance`

- `high`
- `medium`
- `low`
- `unknown`

### `broad_intervention_need`

- `existing-route-may-be-sufficient`
- `upgrade-likely-needed`
- `new-or-substantially-improved-route-likely-needed`
- `officer-review-needed`
- `unknown`

## Explicit Non-Goals For MVP

- Do not build a full B&NES-wide prioritisation model in version one.
- Do not produce a formal LCWIP.
- Do not claim to replace council feasibility, consultation, statutory decision-making, or design work.
- Do not produce section-by-section engineering audits.
- Do not make quantified population coverage or car-mile reduction claims without data.
- Do not assume exact bridge, land, crossing, or delivery feasibility.
- Do not treat ATM classifications as final truth.
- Do not treat the A367 as preferred before evidence review.
- Do not create a dense officer workflow before officers have reacted to the prototype.

## Open Questions

These are deliberately unresolved and should not be treated as assumptions.

- What exact ATM route geometry will be used for the pilot?
- Can official B&NES ATM route data be downloaded in a usable geospatial format?
- What exact boundary should define the Bath to Somer Valley pilot?
- Which schools and destinations should be included in the first dataset?
- Which public transport dataset is reliable enough for bus route and frequency evidence?
- Can National Cycle Network status be obtained in a reusable format for the pilot?
- What DfT transport connectivity metric geography is practical for the first map?
- Which routes, if any, already meet the age-12 independent travel standard?
- Which routes should officers consider preferred after reviewing the evidence?
- How much detail do B&NES or WECA officers actually want after seeing the prototype?

## Evidence Sources To Investigate

- B&NES Active Travel Masterplan route map and documents.
- Oxfordshire Strategic Active Travel Network methodology as a reference point, not a template to copy mechanically.
- DfT transport connectivity metric data.
- LTN 1/20 cycle infrastructure design guidance.
- National Cycle Network data, including supported and advisory/former routes where available.
- Public school, healthcare, employment, and public transport datasets.
- OpenStreetMap for advisory context only, especially road classification, path presence, crossings, and route legibility.

## Success Criteria

The MVP succeeds if a reviewer can quickly understand:

- why the current ATM map may be visually noisy,
- which pilot corridors appear to have stronger everyday modal shift potential,
- how safe independent travel for young people changes the route conversation,
- where the greenway route logic and A367 utility-corridor hypothesis differ,
- what needs officer review before any route should be treated as preferred.

The MVP should produce informed feedback, not a final answer.
