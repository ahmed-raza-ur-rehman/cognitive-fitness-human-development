import registry from "../../content/routes-v1.json";

/**
 * One source of truth for what every page in the product is for.
 *
 * Navigation, breadcrumbs, search, and the guided paths all read this registry, so a
 * destination cannot be linked without a stated purpose and an audience. The content
 * validator (`content/validate.mjs`) fails when a route, anchor, or journey step drifts
 * from what actually renders.
 */
export const SITE_ROUTES = registry.routes;
export type SiteRoute = (typeof SITE_ROUTES)[number];
export type SiteRouteKind = SiteRoute["kind"];

const routesById = new Map(SITE_ROUTES.map((route) => [route.id, route]));
const routesByPath = new Map(SITE_ROUTES.map((route) => [route.path, route]));

export type SiteRouteId = (typeof SITE_ROUTES)[number]["id"];

export function getRouteById(id: string): SiteRoute | undefined {
  return routesById.get(id);
}

/** Resolve `/develop#pathways` or `/explore/memory` to its registered page. */
export function getRouteByHref(href: string): SiteRoute | undefined {
  const [pathname] = href.split("#");
  return routesByPath.get(pathname || "/");
}

export function isKnownHref(href: string): boolean {
  return getRouteByHref(href) !== undefined;
}

/** Every registered destination of a page, each carrying its own purpose. */
export function getLeadsForRoute(id: SiteRouteId | string): { route: SiteRoute | undefined; href: string }[] {
  const route = routesById.get(id);
  if (!route) return [];
  return route.leadsTo.map((href) => ({ href, route: getRouteByHref(href) }));
}

export const ROUTE_KIND_LABELS: Record<SiteRouteKind, string> = {
  orientation: "Start here",
  learn: "Guided path",
  concept: "Concept",
  experiment: "Demonstration",
  practice: "Practice",
  reflect: "Reflection",
  atlas: "Development map",
  research: "Evidence",
  coach: "Optional guide",
  trust: "Trust",
  navigation: "Find",
};
