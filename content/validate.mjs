import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const graphUrl = new URL("./knowledge-v1.json", import.meta.url);
const graph = JSON.parse(await readFile(graphUrl, "utf8"));
const collections = [
  "concepts",
  "claims",
  "evidenceSources",
  "limitations",
  "measures",
  "activities",
  "relationships",
];
const ids = new Map();

assert.equal(graph.schemaVersion, "1.0.0", "unexpected content schema version");
assert.match(graph.contentVersion, /^\d+\.\d+\.\d+$/, "contentVersion must be semantic versioning");
assert.match(graph.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, "reviewedAt must be an ISO date");

for (const collection of collections) {
  assert.ok(Array.isArray(graph[collection]), `${collection} must be an array`);
  for (const item of graph[collection]) {
    assert.ok(item && typeof item.id === "string", `${collection} entries need a stable id`);
    assert.ok(!ids.has(item.id), `duplicate id: ${item.id}`);
    ids.set(item.id, collection);
  }
}

const conceptIds = new Set(graph.concepts.map(({ id }) => id));
const claimIds = new Set(graph.claims.map(({ id }) => id));
const sourceIds = new Set(graph.evidenceSources.map(({ id }) => id));
const limitationIds = new Set(graph.limitations.map(({ id }) => id));
const measureIds = new Set(graph.measures.map(({ id }) => id));
const activityIds = new Set(graph.activities.map(({ id }) => id));
const endpointIds = new Set([...conceptIds, ...activityIds]);

function requireReferences(ownerId, field, references, validIds) {
  assert.ok(Array.isArray(references), `${ownerId}.${field} must be an array`);
  for (const reference of references) {
    assert.ok(validIds.has(reference), `${ownerId}.${field} references unknown id ${reference}`);
  }
}

for (const concept of graph.concepts) {
  requireReferences(concept.id, "claimIds", concept.claimIds, claimIds);
  assert.ok(concept.slug && concept.title && concept.summary, `${concept.id} needs slug, title, and summary`);
}

for (const claim of graph.claims) {
  requireReferences(claim.id, "sourceIds", claim.sourceIds, sourceIds);
  requireReferences(claim.id, "limitationIds", claim.limitationIds, limitationIds);
  assert.ok(claim.wording && claim.population && claim.outcome && claim.studyDesign, `${claim.id} needs review context`);
  assert.ok(claim.evidenceLabel && claim.surfacePolicy, `${claim.id} needs a label and surface policy`);
}

for (const limitation of graph.limitations) {
  requireReferences(limitation.id, "appliesToClaimIds", limitation.appliesToClaimIds, claimIds);
  assert.ok(limitation.text, `${limitation.id} needs user-readable limitation text`);
}

for (const activity of graph.activities) {
  requireReferences(activity.id, "conceptIds", activity.conceptIds, conceptIds);
  requireReferences(activity.id, "measureIds", activity.measureIds, measureIds);
  requireReferences(activity.id, "contextSourceIds", activity.contextSourceIds, sourceIds);
  requireReferences(activity.id, "efficacyEvidenceIds", activity.efficacyEvidenceIds, sourceIds);
  requireReferences(activity.id, "limitationIds", activity.limitationIds, limitationIds);
  assert.ok(activity.title && activity.status && activity.purpose && activity.procedureSummary, `${activity.id} needs an implementation status and description`);
  assert.match(activity.routePath, /^\/[a-z0-9/-]+$/, `${activity.id} needs a local application route`);
  assert.ok(activity.notMeasures.length > 0, `${activity.id} must state what it does not measure`);
}

for (const relation of graph.relationships) {
  assert.ok(endpointIds.has(relation.fromId), `${relation.id} has unknown fromId ${relation.fromId}`);
  assert.ok(endpointIds.has(relation.toId), `${relation.id} has unknown toId ${relation.toId}`);
  assert.ok(["related_to", "illustrated_by"].includes(relation.type), `${relation.id} has an unreviewed relationship type`);
  requireReferences(relation.id, "claimIds", relation.claimIds, claimIds);
  assert.equal(relation.causalImplication, false, `${relation.id} must not imply causality`);
}

for (const source of graph.evidenceSources) {
  assert.ok(source.title && source.authors.length > 0 && source.doi && source.url, `${source.id} needs complete source metadata`);
  assert.match(source.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, `${source.id} needs a review date`);
}

const routesUrl = new URL("./routes-v1.json", import.meta.url);
const routes = JSON.parse(await readFile(routesUrl, "utf8"));

assert.equal(routes.schemaVersion, "1.0.0", "unexpected routes schema version");
assert.match(routes.contentVersion, /^\d+\.\d+\.\d+$/, "routes contentVersion must be semantic versioning");
assert.match(routes.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, "routes reviewedAt must be an ISO date");
assert.ok(routes.purpose, "the route registry needs a stated purpose");
assert.ok(Array.isArray(routes.routes) && routes.routes.length >= 10, "the route registry needs the current page set");

const routeIds = new Set();
const routePaths = new Map();
const validRouteAnchors = new Map();
const validRouteKinds = new Set([
  "orientation", "learn", "concept", "experiment", "practice", "reflect", "atlas", "research", "coach", "trust", "navigation",
]);

for (const route of routes.routes) {
  assert.ok(route.id && !routeIds.has(route.id), `route needs a unique id: ${route.id}`);
  routeIds.add(route.id);
  assert.ok(route.path && !routePaths.has(route.path), `route needs a unique path: ${route.path}`);
  routePaths.set(route.path, route.id);
  assert.match(route.path, /^\/[a-z0-9/_-]*$/, `${route.id} needs a lowercase local path`);
  assert.ok(route.label && route.purpose && route.audience, `${route.id} needs a label, purpose, and audience`);
  assert.ok(validRouteKinds.has(route.kind), `${route.id} has an unknown route kind ${route.kind}`);
  assert.ok(route.primaryAction && route.primaryAction.label, `${route.id} needs a labelled primary action`);
  assert.ok(Array.isArray(route.leadsTo) && route.leadsTo.length > 0, `${route.id} must state where it leads`);
  validRouteAnchors.set(route.path, new Set(route.anchors ?? []));
}

const atlasUrl = new URL("./development-atlas-v1.json", import.meta.url);
const atlas = JSON.parse(await readFile(atlasUrl, "utf8"));
const atlasCollections = ["clusters", "references", "pathways"];
const atlasIds = new Map();

assert.equal(atlas.schemaVersion, "1.0.0", "unexpected atlas schema version");
assert.match(atlas.contentVersion, /^\d+\.\d+\.\d+$/, "atlas contentVersion must be semantic versioning");
assert.match(atlas.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, "atlas reviewedAt must be an ISO date");
assert.ok(atlas.title && atlas.intro && atlas.careNotice && atlas.planNotice, "atlas needs title and user-facing boundaries");

for (const collection of atlasCollections) {
  assert.ok(Array.isArray(atlas[collection]), `atlas.${collection} must be an array`);
  for (const item of atlas[collection]) {
    assert.ok(item && typeof item.id === "string", `atlas.${collection} entries need a stable id`);
    assert.ok(!atlasIds.has(item.id), `duplicate atlas id: ${item.id}`);
    atlasIds.set(item.id, collection);
  }
}

const atlasClusterIds = new Set(atlas.clusters.map(({ id }) => id));
const atlasReferenceIds = new Set(atlas.references.map(({ id }) => id));
const atlasPathwayIds = new Set(atlas.pathways.map(({ id }) => id));
const validPathwayTypes = new Set(["task-practice", "everyday-practice", "support-context", "learn-reflect"]);
const validAppRoutes = new Set(routePaths.keys());
for (const concept of graph.concepts) {
  assert.ok(validAppRoutes.has(`/explore/${concept.slug}`), `concept ${concept.id} has no registered route /explore/${concept.slug}`);
}
for (const activity of graph.activities) {
  assert.ok(validAppRoutes.has(activity.routePath), `activity ${activity.id} links to unregistered route ${activity.routePath}`);
}
validRouteAnchors.set("/develop", new Set([...(validRouteAnchors.get("/develop") ?? []), ...atlas.clusters.map(({ id }) => id), ...atlas.pathways.map(({ id }) => `pathway-${id}`)]));
const validAtlasAnchors = new Set([
  ...(validRouteAnchors.get("/develop") ?? new Set()),
  ...atlas.pathways.map(({ id }) => `pathway-${id}`),
]);

for (const cluster of atlas.clusters) {
  assert.ok(cluster.title && cluster.summary, `${cluster.id} needs a title and summary`);
}

for (const reference of atlas.references) {
  assert.ok(reference.title && reference.publisher && reference.sourceType, `${reference.id} needs source metadata`);
  assert.ok(reference.scope && reference.supports && reference.limitation, `${reference.id} needs scope, support, and limits`);
  const sourceUrl = new URL(reference.url);
  assert.equal(sourceUrl.protocol, "https:", `${reference.id} must use HTTPS`);
}

assert.equal(atlas.pathways.length, 14, "the atlas should include the reviewed 14-pathway scope");
const requiredPathways = [
  "memory-learning", "attention-executive", "reasoning-decisions", "metacognition",
  "creativity-curiosity", "emotional-skills", "stress-resilience", "social-connection",
  "sleep-recovery", "movement-sensory-health", "nutrition-hydration",
  "habits-motivation-environment", "brain-perception-consciousness", "lifespan-differences-aging",
];
for (const id of requiredPathways) {
  assert.ok(atlasPathwayIds.has(id), `atlas is missing required pathway ${id}`);
}

function requireAtlasReferences(ownerId, field, references, validIds) {
  assert.ok(Array.isArray(references), `${ownerId}.${field} must be an array`);
  for (const reference of references) {
    assert.ok(validIds.has(reference), `${ownerId}.${field} references unknown id ${reference}`);
  }
}

for (const pathway of atlas.pathways) {
  assert.ok(atlasClusterIds.has(pathway.clusterId), `${pathway.id} has unknown cluster ${pathway.clusterId}`);
  assert.ok(validPathwayTypes.has(pathway.type), `${pathway.id} has an unknown practice type`);
  assert.ok(pathway.title && pathway.typeLabel && pathway.summary && pathway.offer, `${pathway.id} needs a summary and product offer`);
  assert.ok(Array.isArray(pathway.topics) && pathway.topics.length >= 3, `${pathway.id} needs at least three topic labels`);
  assert.ok(pathway.starter?.title && pathway.starter?.timeHint, `${pathway.id} needs a named, optional starter`);
  assert.ok(Array.isArray(pathway.starter.steps) && pathway.starter.steps.length >= 2, `${pathway.id} needs actionable starter steps`);
  assert.ok(pathway.apply && pathway.notice && pathway.boundary && pathway.evidenceNote, `${pathway.id} needs application, reflection, evidence note, and limit`);
  assert.ok(Array.isArray(pathway.links) && pathway.links.length > 0, `${pathway.id} needs a next step or support link`);
  for (const link of pathway.links) {
    assert.ok(link.label && link.href, `${pathway.id} has an incomplete link`);
    if (link.href.startsWith("#")) {
      assert.ok(validAtlasAnchors.has(link.href.slice(1)), `${pathway.id} links to unknown atlas anchor ${link.href}`);
      continue;
    }
    const linkUrl = new URL(link.href, "https://cognitive-fitness.example");
    if (linkUrl.origin === "https://cognitive-fitness.example") {
      assert.ok(validAppRoutes.has(linkUrl.pathname), `${pathway.id} links to unknown application route ${linkUrl.pathname}`);
    } else {
      assert.equal(linkUrl.protocol, "https:", `${pathway.id} external link must use HTTPS`);
    }
  }
  requireAtlasReferences(pathway.id, "referenceIds", pathway.referenceIds, atlasReferenceIds);
}

for (const cluster of atlas.clusters) {
  assert.ok(atlas.pathways.some((pathway) => pathway.clusterId === cluster.id), `${cluster.id} needs at least one pathway`);
}

console.log(
  `Validated knowledge graph ${graph.contentVersion}: ${graph.concepts.length} concepts, ${graph.claims.length} claims, ${graph.evidenceSources.length} sources, ${graph.limitations.length} limitations, ${graph.activities.length} activities, ${graph.relationships.length} relationships.`,
);
console.log(
  `Validated development atlas ${atlas.contentVersion}: ${atlas.clusters.length} clusters, ${atlas.pathways.length} pathways, ${atlas.references.length} contextual sources.`,
);

for (const route of routes.routes) {
  const [actionPath, actionHash] = route.primaryAction.href.split("#");
  assert.ok(routePaths.has(actionPath), `${route.id} primary action links to unregistered page ${actionPath}`);
  assert.ok(actionHash === undefined || (validRouteAnchors.get(actionPath) ?? new Set()).has(actionHash), `${route.id} primary action uses an unknown anchor`);
  for (const target of route.leadsTo) {
    const [pathname, hash] = target.split("#");
    assert.ok(routePaths.has(pathname), `${route.id} leads to unregistered page ${pathname}`);
    assert.ok(hash === undefined || (validRouteAnchors.get(pathname) ?? new Set()).has(hash), `${route.id} leads to unknown anchor ${target}`);
  }
}

const journeysUrl = new URL("./journeys-v1.json", import.meta.url);
const journeys = JSON.parse(await readFile(journeysUrl, "utf8"));
const validStepKinds = new Set(["understand", "experience", "inspect", "practice", "apply", "reflect"]);

assert.equal(journeys.schemaVersion, "1.0.0", "unexpected journeys schema version");
assert.match(journeys.contentVersion, /^\d+\.\d+\.\d+$/, "journeys contentVersion must be semantic versioning");
assert.match(journeys.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, "journeys reviewedAt must be an ISO date");
assert.ok(journeys.title && journeys.intro && journeys.outcomeNotice && journeys.boundaryNotice, "journeys need an intro plus outcome and safety notices");
assert.ok(Array.isArray(journeys.journeys) && journeys.journeys.length >= 4, "journeys need at least four paths");

const journeySlugs = new Set();
for (const journey of journeys.journeys) {
  assert.ok(journey.id && !journeySlugs.has(journey.slug), `${journey.id} needs a unique id and slug`);
  journeySlugs.add(journey.slug);
  assert.match(journey.slug, /^[a-z0-9-]+$/, `${journey.id} needs a lowercase slug`);
  assert.ok(journey.title && journey.question && journey.summary && journey.audience, `${journey.id} needs a title, question, audience, and summary`);
  assert.ok(Number.isInteger(journey.minutes) && journey.minutes >= 5 && journey.minutes <= 60, `${journey.id} needs an honest minute estimate between 5 and 60`);
  assert.ok(journey.outcome && journey.boundary, `${journey.id} needs a stated outcome and boundary`);
  assert.ok(Array.isArray(journey.steps) && journey.steps.length >= 3 && journey.steps.length <= 7, `${journey.id} needs three to seven steps`);

  const stepIds = new Set();
  for (const step of journey.steps) {
    assert.ok(step.id && !stepIds.has(step.id), `${journey.id} needs unique step ids`);
    stepIds.add(step.id);
    assert.ok(validStepKinds.has(step.kind), `${step.id} has an unknown step kind ${step.kind}`);
    assert.ok(step.title && step.purpose && step.action && step.takeaway, `${step.id} needs a title, purpose, action, and takeaway`);
    assert.ok(step.linkLabel, `${step.id} needs a link that says what opening it does`);
    const [pathname, hash] = String(step.href ?? "").split("#");
    assert.ok(routePaths.has(pathname), `${step.id} links to unregistered page ${pathname}`);
    const anchors = validRouteAnchors.get(pathname) ?? new Set();
    assert.ok(hash === undefined || anchors.has(hash), `${step.id} links to unknown anchor ${step.href}`);
  }

  assert.ok(journey.steps.some((step) => step.kind === "inspect" || step.href.startsWith("/evidence")), `${journey.id} must include evidence context`);

  for (const conceptId of journey.relatedConceptIds) {
    assert.ok(conceptIds.has(conceptId), `${journey.id} references unknown concept ${conceptId}`);
  }
  for (const pathwayId of journey.relatedPathwayIds) {
    assert.ok(atlasPathwayIds.has(pathwayId), `${journey.id} references unknown atlas pathway ${pathwayId}`);
  }
}

console.log(
  `Validated route registry ${routes.contentVersion}: ${routes.routes.length} pages with stated purposes, ${validRouteAnchors.size} anchor sets.`,
);
console.log(
  `Validated guided paths ${journeys.contentVersion}: ${journeys.journeys.length} journeys, ${journeys.journeys.reduce((total, journey) => total + journey.steps.length, 0)} linked steps.`,
);
