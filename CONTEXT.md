# ATM Prioritisation

This context covers the independent proof-of-concept product for interpreting B&NES Active Travel Masterplan source evidence, reviewing routes, and presenting a separate prototype prioritisation layer.

## Language

**Fully Implemented Solution**:
A decision-support product that combines extracted ATM source data, evidence/context layers, route review, and a separate prototype prioritisation layer.
_Avoid_: Full extraction, final network, official plan

**ATM Source Layer**:
A map layer showing extracted B&NES Active Travel Masterplan routes as source evidence, with provenance, confidence, and uncertainty preserved.
_Avoid_: ATM prioritisation layer, cleaned-up ATM layer, recommended network

**Review Corridor Layer**:
A map layer showing Evidence-Backed Corridors and prototype judgement separately from ATM source evidence.
_Avoid_: ATM source layer, final network

**Destination Context Layer**:
A map layer showing schools, settlement centres, employment, healthcare, public transport, and other destination context used to understand corridor usefulness.
_Avoid_: Destination score, catchment proof, school-run impact claim

**Uncertainty Layer**:
A map layer or visual treatment that makes low-confidence, draft, ambiguous, or unextractable evidence visible.
_Avoid_: Error layer, hidden caveat, quality approval

**Review Corridor**:
A practical movement problem for review, grouping relevant ATM source features, context features, destinations, and prototype judgement.
_Avoid_: Route fragment, source route, connector

**Evidence-Backed Corridor**:
A Review Corridor with linked source evidence, destinations, route role, independent-travel lens, intervention need, unresolved questions, provenance, and uncertainty.
_Avoid_: Line-only corridor, centre connector

**Explicit Unknown**:
A deliberate value showing that a product field is present but unresolved because supporting evidence is weak, missing, or awaiting review.
_Avoid_: Blank field, hidden corridor, assumed value

**Source/Prototype Conflict**:
A visible difference between ATM source evidence and prototype corridor judgement that must be explained with caveats.
_Avoid_: Hidden disagreement, final rejection, anti-council framing

**Read-Only Decision-Support Map**:
A public map experience where review evidence is displayed in the app and changed through checked-in data, issues, and pull requests.
_Avoid_: In-app editor, live official consultation tool

**ATM Dataset Manifest**:
An app-facing index of validated Extraction Batches that lets the product present the ATM Source Layer without merging every feature into one mega-file.
_Avoid_: Mega-file, final network, official GeoJSON

**Product Index**:
A manifest that carries enough metadata for the product to label, filter, load, and caveat source-data batches.
_Avoid_: File list, build-only manifest

**Extraction Batch**:
A reviewable geographic slice of agent-led ATM source extraction that can be validated before it is referenced by the ATM Dataset Manifest.
_Avoid_: App layer, final dataset, manual sketch

**Agent-Led Extraction Pipeline**:
A repeatable workflow that lets agents derive, validate, caveat, and publish Extraction Batches from public ATM map graphics and documents.
_Avoid_: Manual tracing, ad hoc GeoJSON editing

**Agent-Proposed Georeferencing**:
An extraction step where agents propose control points and coordinate fits from public ATM map graphics to public map context, with confidence and review flags.
_Avoid_: Human-drawn georeferencing, official survey alignment

**B&NES-Wide Full Product Pass**:
An authority-wide implementation pass that includes ATM source extraction, Evidence-Backed Corridors, destinations, route roles, modal-shift judgement, independent-travel lens, and intervention need.
_Avoid_: Broad source-only pass, pilot-only tracer, line-only coverage

**Review-Safe Extraction Batch**:
An Extraction Batch whose status, confidence, and caveats make it safe to show by default in the public proof-of-concept.
_Avoid_: Complete batch, official batch, approved route data

## Relationships

- A **Fully Implemented Solution** contains an **ATM Source Layer** and a separate prototype prioritisation layer.
- A **Fully Implemented Solution** exposes an **ATM Source Layer**, **Review Corridor Layer**, **Destination Context Layer**, and **Uncertainty Layer**.
- A **Fully Implemented Solution** is a **Read-Only Decision-Support Map**; changes to review evidence happen through checked-in data, GitHub issues, and pull requests.
- An **ATM Source Layer** records what the source evidence appears to show; a prototype prioritisation layer records what this proof of concept recommends for review.
- A **Review Corridor Layer** contains Evidence-Backed Corridors, not raw ATM source features.
- A **Destination Context Layer** supports corridor interpretation but does not prove catchment coverage, school-run impact, or route preference.
- An **Uncertainty Layer** makes confidence and ambiguity visible rather than burying caveats only in text.
- An **ATM Source Layer** is drawn from the **ATM Dataset Manifest** and its referenced **Extraction Batches**.
- The **ATM Dataset Manifest** indexes ATM source evidence; it does not contain prototype prioritisation decisions.
- The **ATM Dataset Manifest** is a **Product Index** with batch status, bounds, confidence summary, feature counts, labels, and default-visibility safety.
- An **Extraction Batch** is reviewed and validated independently before it is referenced by the **ATM Dataset Manifest**.
- An **Agent-Led Extraction Pipeline** produces and validates **Extraction Batches**.
- An **Agent-Led Extraction Pipeline** links extracted geometry to source inventory records, confidence, provenance, and uncertainty.
- An **Agent-Led Extraction Pipeline** uses **Agent-Proposed Georeferencing** for map graphics and escalates ambiguous or high-impact cases for human spot-check.
- A **B&NES-Wide Full Product Pass** should deliver both broad ATM Source Layer coverage and full Evidence-Backed Corridor depth across B&NES.
- Only a **Review-Safe Extraction Batch** appears in the ATM Source Layer by default.
- Draft or uncertain **Extraction Batches** can be shown only through an explicit opt-in control.
- A **Review Corridor** can reference one or more ATM source features.
- A **Review Corridor** can reference destinations, context features, and unresolved questions.
- A **Review Corridor** can contain a **Source/Prototype Conflict** where prototype judgement differs from or reframes ATM source evidence.
- A **Source/Prototype Conflict** should be explicit, neutral, and caveated as “for review” rather than final rejection or approval.
- Every product-facing **Review Corridor** should be an **Evidence-Backed Corridor**.
- Every **Evidence-Backed Corridor** uses the same field shape across B&NES, with **Explicit Unknown** values where evidence is not strong enough.
- A prototype prioritisation layer is made of **Review Corridors**, not raw ATM source features.
- A **Fully Implemented Solution** supports review and discussion; it is not an official council plan or final prioritised network.

## Example dialogue

> **Dev:** "Does the fully implemented solution finish when every ATM route has been extracted?"
> **Domain expert:** "No — extraction is only one layer. The product also needs the review and prioritisation experience around that source evidence."
>
> **Dev:** "Can we simplify ATM routes before putting them in the ATM layer?"
> **Domain expert:** "No — keep the ATM Source Layer as evidence. Simplification belongs in the prototype prioritisation layer."
>
> **Dev:** "Should reviewers prioritise every individual ATM source line?"
> **Domain expert:** "No — reviewers should work with Review Corridors that collect the source lines, destinations, and judgement into a practical movement problem."
>
> **Dev:** "Should the app load one combined ATM source mega-file?"
> **Domain expert:** "No — one mega-file is bad and complicates things. Use an ATM Dataset Manifest that references validated Extraction Batches."
>
> **Dev:** "Should agents edit an app-facing merged source dataset directly?"
> **Domain expert:** "No — agents should work in Extraction Batches, and the app should load those through the ATM Dataset Manifest."
>
> **Dev:** "Can the ATM Dataset Manifest just be a list of file paths?"
> **Domain expert:** "No — it needs product metadata so the app can label incomplete or low-confidence source evidence correctly."
>
> **Dev:** "Should incomplete ATM extraction batches appear by default?"
> **Domain expert:** "No — only Review-Safe Extraction Batches should show by default; uncertain batches need an explicit opt-in."
>
> **Dev:** "Can a Review Corridor be just a drawn line between settlements?"
> **Domain expert:** "No — it needs linked source evidence, destinations, route role, unresolved questions, provenance, and uncertainty."
>
> **Dev:** "Is checked-in GeoJSON enough for full extraction?"
> **Domain expert:** "No — the full solution needs an Agent-Led Extraction Pipeline so extraction is repeatable and auditable."
>
> **Dev:** "Who should georeference the original ATM graphics?"
> **Domain expert:** "Agents should propose the georeferencing and confidence flags; humans should spot-check exceptions or sign off."
>
> **Dev:** "Does B&NES-wide mean source coverage first, with corridor depth later?"
> **Domain expert:** "No — the target is a B&NES-Wide Full Product Pass with source extraction and corridor-review depth across the authority area."
>
> **Dev:** "Should incomplete corridors be hidden until evidence is complete?"
> **Domain expert:** "No — keep the same field shape everywhere and use Explicit Unknown values where evidence is weak or unresolved."
>
> **Dev:** "Can uncertainty and destinations live only in the detail panel?"
> **Domain expert:** "No — destination context and uncertainty need visible map layers or treatments so reviewers do not read the map as settled route status only."
>
> **Dev:** "Should we hide disagreements between ATM evidence and prototype judgement to keep the tone neutral?"
> **Domain expert:** "No — show Source/Prototype Conflicts explicitly, but use careful caveated language."
>
> **Dev:** "Should reviewers edit statuses and sign-off inside the app?"
> **Domain expert:** "No — the app is read-only. Review changes should happen through checked-in data and GitHub workflow."

## Flagged ambiguities

- "fully implemented solution" was used ambiguously to mean either complete source extraction or a complete decision-support product — resolved: it means the complete decision-support product.
- "ATM layer" was used ambiguously to mean either source evidence or interpreted prioritisation — resolved: use **ATM Source Layer** for extracted source evidence only.
- "route" was used ambiguously to mean source geometry, interpreted corridor, and final alignment — resolved: use **ATM Source Layer** for source geometry and **Review Corridor** for the review unit.
- "full extraction" was used ambiguously to mean either a single mega-file or batch-indexed source evidence — resolved: use **ATM Dataset Manifest** plus validated **Extraction Batches**.
- "batch" was clarified as an **Extraction Batch**: a reviewable source-data unit referenced by the **ATM Dataset Manifest**.
- "manifest" was clarified as a **Product Index**, not a build-only file list.
- "safe to show" was clarified as **Review-Safe Extraction Batch**, not official approval or complete extraction.
- "corridor" was clarified as an **Evidence-Backed Corridor**, not a line-only connector between centres.
- "agent-led extraction" was clarified as an **Agent-Led Extraction Pipeline**, not manually edited GeoJSON.
- "georeferencing" was clarified as **Agent-Proposed Georeferencing** with confidence flags, not human-led drawing or official survey alignment.
- "B&NES-wide immediately" was clarified as a **B&NES-Wide Full Product Pass**, not source-only coverage followed by later corridor deepening.
- "unknown" was clarified as **Explicit Unknown**, a deliberate honest value rather than missing data or hidden product coverage.
- "map layer" was clarified into four required families: **ATM Source Layer**, **Review Corridor Layer**, **Destination Context Layer**, and **Uncertainty Layer**.
- "conflict" was clarified as **Source/Prototype Conflict**, an explicit caveated difference rather than adversarial disagreement or hidden interpretation.
- "review workflow" was clarified as a **Read-Only Decision-Support Map** backed by checked-in data and GitHub workflow, not an in-app editor.
