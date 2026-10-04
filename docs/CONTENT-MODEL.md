# Content model — version 1

**Status:** reviewed prototype seed for the S5 memory-learning slice. This is not a clinically validated knowledge base or a public evidence library.  
**Content file:** [`../content/knowledge-v1.json`](../content/knowledge-v1.json)  
**Version:** schema `1.0.0`; seed content `1.1.0`; reviewed `2026-10-04`. Content `1.1.0` records the S6 demo implementation and its `/lab` route; it makes no evidence or efficacy upgrade.

## Design goals

- Keep concepts, claims, evidence sources, limitations, measures, activities, and relationships as separate records.
- Give each record a stable identifier. Presentation labels and URLs may change; IDs should not be derived from display text or translated slugs.
- Record the precise population, outcome, design, transfer scope, evidence rationale, and review date beside each claim.
- Keep source findings distinct from product interpretation. A research source may contextualize an activity without validating that activity.
- Bundle small, reviewed public content at build time. No user data is part of this graph.

## Entity model

| Entity | Required meaning | Primary links |
|---|---|---|
| **Concept** | Stable topic node with a plain-language summary. | `claimIds` and typed relationships. |
| **Claim** | A precise, reviewable statement with population, outcome, design, transfer level, evidence label, grade, and display policy. | `sourceIds` and `limitationIds`. |
| **Evidence source** | Bibliographic metadata, DOI/stable URL, source type, review date, and a note about what was checked. | Referenced by claims; activity context is separately labeled. |
| **Limitation** | Plain-language boundary on inference, population, method, generalizability, or product measurement. | `appliesToClaimIds`; activities may also reference it directly. |
| **Measure** | A deterministic description of an observable task result, including unit and interpretation boundary. | Referenced by an activity. |
| **Activity** | A demonstration/practice definition with implementation status and route, purpose, procedure, concepts, measures, contextual sources, direct efficacy sources, limitations, and explicit non-measures. | Stable concept, measure, source, and limitation IDs. |
| **Relationship** | An explicitly typed, labeled link between concepts or between a concept and an activity. | Stable endpoint IDs and optional claim IDs. |

### Relationship vocabulary

- `related_to`: an associative/conceptual connection. `causalImplication` must be `false`; do not render the line as evidence of cause or direction.
- `illustrated_by`: an example activity that lets a person encounter an idea. It does **not** claim that the activity is an effective intervention or validated measure.

New edge types require review before use. Prefer the relationship label shown to the user over an unexplained arrow. If future content supports a causal statement, that causal statement belongs in a separately reviewed claim with its own source—not in a decorative graph edge.

## Versioning and validation

- `schemaVersion` changes when entity shape or interpretation changes incompatibly.
- `contentVersion` uses semantic versioning for reviewed content updates. Corrected claims, new entities, or changes to their meaning require a content-version increment and review note. The S6 status and route addition is recorded as content version `1.1.0`; it does not change any claim.
- Never recycle a retired ID for a different concept, claim, source, limitation, measure, activity, or edge. Keep a redirect/deprecation record if an ID must be replaced.
- Run the dependency-free reference/ID check from the application root:

```bash
node content/validate.mjs
```

The validator checks the knowledge graph's IDs/references/edges and the atlas's 14 pathway IDs, cluster and source references, allowed practice types, required actions/boundaries, HTTPS sources, and known in-app routes. It cannot establish citation accuracy, appropriate certainty, or good plain language; those require human review. The atlas's `referenceIds` attach source context to a pathway but are not evidence grades or claims that this application is effective.

## Rendering guidance

- The reviewed knowledge graph currently has six concept nodes. Do not render it as a dense full-screen network or require panning/zooming. The separate Development Atlas groups 14 starter pathways into four readable sections; it does not claim to expand the evidence graph or replace claim-level review.
- Make the concept list the primary navigation. For each selected concept, show only its short explanation and a short, text-labeled list of related concepts. The map is optional and must have an equivalent text path.
- Progressive disclosure: beginner summary first; claim/source/population/outcome/limitation details on demand. The three-to-five-item Cowan estimate is marked `research-detail-only` and must never become a personal capacity result or headline.
- The word-recall activity is labeled `implemented-in-s6` and routed at `/lab`. Its `efficacyEvidenceIds` is intentionally empty. Source-context links provide research background, not validation of this specific demo.
- Render the demo's raw count only as “correct listed words in this round.” Do not turn it into a percentile, grade, capacity estimate, health claim, or learning-gain score.
- Keep source cards useful on narrow screens: stack citation metadata, put the limitation next to the claim, and avoid a horizontal graph/table as the only route.

## Review boundary

The source-to-claim review in S5 is a single-agent prototype review. The publisher/PMC/library source and bibliographic metadata were checked on 2026-10-04 and are recorded in `docs/EVIDENCE-LEDGER.md`; a subject-matter reviewer should recheck the source-to-copy fit, populations, and current evidence before public launch. S6 renders this seed and implements the activity only as an unvalidated demonstration; it does not broaden the claims or validate the activity as an assessment.
