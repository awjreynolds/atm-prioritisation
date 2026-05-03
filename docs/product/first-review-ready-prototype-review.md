# First review-ready prototype pass

Review date: 2026-05-03

## Scope reviewed

- The deployed GitHub Pages prototype responds successfully at `https://awjreynolds.github.io/atm-prioritisation/`.
- The local build and smoke checks pass through `npm test`.
- The app shell, route map rendering, route detail panel, legend, destination layer, checked-in route data, checked-in destination data, and source inventory were reviewed against the MVP brief.

## Ready to share

- Status correction on 2026-05-03: the earlier sign-off was withdrawn because the prototype rendered route records rather than an interactive route map.
- The prototype now includes a clickable indicative route sketch as independent personal proof-of-concept work, but it is pending maintainer re-review before being shared with first reviewers.
- The masthead visibly says the prototype is not a council-owned plan, WECA-owned plan, formal LCWIP, or final prioritised network.
- The README repeats that it is not council endorsed and not WECA endorsed.
- The map keeps original ATM-style source evidence visually separate from the simplified prototype layer.
- Route lines are shown as a geographic sketch with place labels for the Bath to Somer Valley pilot area.
- Route colour explains proposed network status, while line width explains modal shift potential, so the map is simple enough for a non-specialist reviewer to understand without reading every evidence note first.
- Route detail copy uses cautious review language such as "needs review", "for review", and "not a final preferred alignment".
- Route data provenance is discoverable through the route detail panel, the checked-in source inventory, and the route and destination datasets.
- Each route and destination record includes uncertainty notes and claim limits.

## Caveats checked

- The A367 utility-corridor hypothesis is not presented as a settled preferred route.
- The A367 record remains `needs-review`, uses hypothesis data status, and says it is not a final preferred alignment.
- Greenway context is retained as source evidence and supporting context rather than treated as automatically preferred.
- Destination context does not claim school-run impact, catchment coverage, route preference, or quantified modal-shift outcomes.
- The prototype does not claim council endorsement, WECA endorsement, formal funding eligibility, route deliverability, or final network status.

## Unresolved before first-review sign-off

- The current route and destination geometry is indicative and should be replaced if reusable official geometry becomes available.
- The prototype has not resolved exact ATM route geometry, exact pilot boundary, bus-service evidence, current route quality, deliverability, or which routes officers would consider preferred after evidence review.
- The first feedback request should explicitly ask reviewers to challenge the route language, A367 hypothesis framing, data provenance, and whether the visual hierarchy is simple enough.
