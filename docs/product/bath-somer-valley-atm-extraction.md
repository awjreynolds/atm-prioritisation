# Bath to Somer Valley ATM extraction

Extraction date: 2026-05-03

## Scope

This batch extracts review-map precision source/context geometry for the Bath to Somer Valley area. It is intended to unblock the first Leaflet prototype map, not to produce official engineering or legal route alignments.

The extracted dataset is `data/atm-routes-bath-somer-valley.geojson`.

## Public sources used

- `Active Travel Masterplan - Appendix B - Active Travel Masterplan Route Map`, public route-map PDF from the 13 February 2025 Cabinet papers.
- `Active Travel Masterplan Feb 2025 - Part 6 of 7`, public B&NES document page download, especially section 8.1 existing infrastructure and route table entries for the Somer Valley / Bath corridor.
- `data/pilot-source-inventory.json`, for existing project source IDs and claim limits.

## Method

- The public ATM route-map graphic was used as the visual route source.
- The Part 6 route table and infrastructure text were used to identify route IDs, route descriptions, and source/context distinctions.
- Coordinates were drafted as best-fit lon/lat lines against public map context at review-map precision.
- Lines follow recognisable corridors where the source text names them, such as A367 / Bristol Road, Peasedown St John to Bath, A362, Old Mills Lane, NCN 24 / Two Tunnels / Colliers Way, and Norton-Radstock / Five Arches Greenway context.
- The output is not official reusable council GeoJSON and must not be treated as exact design, legal, or delivery alignment.

## Extracted features

- `atm-5-6A-a367-bristol-road-strategic`
- `atm-5-6a-bath-old-road-quiet`
- `atm-6-8A-peasedown-bath-strategic`
- `atm-5-3A-a362-radstock-midsomer-farrington`
- `atm-3-4b-old-mills-lane-quiet`
- `context-ncn24-two-tunnels-colliers-way`
- `context-norton-radstock-greenway-five-arches`

## Ambiguities and spot checks

- The public route-map graphic is dense around Radstock, Midsomer Norton, and Peasedown St John, so all features are marked for human spot-check before relying on them for external interpretation.
- `atm-5-6a-bath-old-road-quiet` is low-confidence because the source text identifies the quiet alternative, but the exact visible map line is difficult to distinguish in the dense corridor.
- Greenway context features are included to preserve comparison context. They are not prototype prioritisation decisions and are not official extracted NCN geometry.
- The A367 prototype hypothesis is intentionally excluded from this extracted ATM source dataset unless a matching source route is visible in the public ATM material.

## Validation

Run:

```sh
npm run validate:atm-routes -- data/atm-routes-bath-somer-valley.geojson
```

Validation checks GeoJSON shape, lon/lat coordinate bounds, required provenance properties, geometry confidence, low-confidence spot-check flags, and caveat language.
