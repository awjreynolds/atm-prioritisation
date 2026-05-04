# Full B&NES ATM route extraction plan

## Purpose

Issue #20 should prepare the full B&NES ATM route extraction without trying to complete every geography in one change. The parent dataset remains a GeoJSON FeatureCollection, and every batch must validate against `data/atm-route-extraction-schema.json` before it is used by the prototype.

## Dataset contract

Each geographic batch is a standalone GeoJSON FeatureCollection with collection-level `metadata` and per-feature properties. The metadata records the batch identity, area, extraction status, geometry precision, whether the geometry is official, source summary, and caveats.

Every route or context feature must include:

- `source_layer`
- `source_atm_classification`
- `geometry_status`
- `geometry_confidence`
- `needs_human_spot_check`
- `source_ids`
- `provenance_notes`
- `uncertainty_notes`

The extraction is not official reusable council GeoJSON. Public map context can support best-fit review geometry, but not engineering/legal alignment.

## Batch plan

Use geographic batch slices so each future PR is reviewable:

- Bath to Somer Valley: existing pilot batch.
- Bath core: central Bath ATM routes and dense junction context.
- Bath north and east: Larkhall, Batheaston, Bathampton, and eastern links.
- Keynsham and Saltford: routes around Keynsham, Saltford, and Bristol-facing links.
- Somer Valley: Radstock, Midsomer Norton, Paulton, and surrounding route context beyond the pilot slice.
- Rural connections: remaining villages, inter-settlement links, and cross-boundary context.

Future batches may split these further when the public map is too dense for a single reviewable PR.

## Ambiguity handling

Ambiguous or unextractable features must be recorded rather than guessed. Use `geometry_status: "ambiguous-or-unextractable"` and `geometry_confidence: "unextractable"` when the source map or documents identify a route but the visible alignment is not safe to draw. Keep `needs_human_spot_check` set to `true`, preserve source IDs, and explain the uncertainty in `uncertainty_notes`.

## Validation expectations

Before a batch is merged:

- Run `npm run validate:atm-routes -- data/<batch>.geojson`.
- Confirm all `source_ids` point at reviewed source inventory records.
- Confirm collection metadata identifies the geographic batch.
- Confirm no notes imply official reusable council GeoJSON.
- Confirm low-confidence or unextractable features are marked for human spot-check.

Do not extract new geometries inside parent-preparation PRs. Geometry extraction belongs in later geographic batch PRs.
