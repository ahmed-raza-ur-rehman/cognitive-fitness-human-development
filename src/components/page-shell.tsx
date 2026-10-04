import Link from "next/link";
import { getLeadsForRoute, getRouteById, ROUTE_KIND_LABELS, type SiteRouteId } from "@/lib/routes";

export type Crumb = { label: string; href?: string };

/** Orientation strip: where you are, and how to get back to a wider view. */
export function Breadcrumbs({ items, label = "Breadcrumb" }: { items: Crumb[]; label?: string }) {
  return (
    <nav className="breadcrumbs" aria-label={label}>
      {items.map((crumb, index) => {
        const isLast = index === items.length - 1;
        return (
          <span className="crumb" key={`${crumb.label}-${index}`}>
            {crumb.href && !isLast ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined}>{crumb.label}</span>
            )}
            {isLast ? null : <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

/**
 * Every page opens the same way: what this is for, what it is not, and what you can do here.
 * Keeping the shape identical is deliberate; a reader should never have to relearn the interface.
 */
export function PageIntro({
  routeId,
  eyebrow,
  title,
  titleId,
  lead,
  boundary,
  actions,
}: {
  routeId?: SiteRouteId;
  eyebrow?: string;
  title: string;
  titleId?: string;
  lead: string;
  boundary?: string;
  actions?: { label: string; href: string; hint?: string }[];
}) {
  const route = routeId ? getRouteById(routeId) : undefined;

  return (
    <header className="page-intro">
      <p className="section-kicker">{eyebrow ?? (route ? `${ROUTE_KIND_LABELS[route.kind]} / ${route.label}` : "Cognitive Fitness")}</p>
      <h1 id={titleId}>{title}</h1>
      <p className="page-intro-lead">{lead}</p>
      {route ? (
        <p className="page-intro-purpose">
          <span className="mini-label">What this page is for</span>
          {route.purpose}
          <span className="page-intro-audience">Written for {route.audience}.</span>
        </p>
      ) : null}
      {actions && actions.length > 0 ? (
        <ul className="page-intro-actions" aria-label="What you can do here">
          {actions.map((action) => (
            <li key={`${action.href}-${action.label}`}>
              <Link className="button button-primary" href={action.href}>
                {action.label} <span aria-hidden="true">→</span>
              </Link>
              {action.hint ? <span className="page-intro-hint">{action.hint}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {boundary ? <p className="education-boundary">{boundary}</p> : null}
    </header>
  );
}

/**
 * Where a page leads, resolved through the route registry so each exit says why it exists
 * instead of being a decorative button.
 */
export function RouteOutlook({
  routeId,
  title = "Where this leads",
  note,
}: {
  routeId: SiteRouteId | string;
  title?: string;
  note?: string;
}) {
  const leads = getLeadsForRoute(routeId).filter((entry) => entry.route);
  if (leads.length === 0) return null;

  return (
    <section className="route-outlook" aria-labelledby={`outlook-${routeId}`}>
      <div className="outlook-heading">
        <p className="section-kicker">Deliberate direction</p>
        <h2 id={`outlook-${routeId}`}>{title}</h2>
        <p>{note ?? "Each destination below has one job. Take only the one that matches what you want next."}</p>
      </div>
      <ul className="outlook-list">
        {leads.map(({ href, route }) => (
          <li key={`${route!.id}-${href}`}>
            <Link href={href}>
              <span className="outlook-kind">{ROUTE_KIND_LABELS[route!.kind]}</span>
              <span className="outlook-copy">
                <strong>{route!.label}</strong>
                <span>{route!.purpose}</span>
              </span>
              <span className="related-arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A limit stated beside the action, not after it. */
export function BoundaryNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="boundary-note" aria-labelledby={`boundary-${title.replace(/\W+/g, "-").toLowerCase()}`}>
      <p className="mini-label">Keep this in view</p>
      <h2 id={`boundary-${title.replace(/\W+/g, "-").toLowerCase()}`}>{title}</h2>
      <p>{children}</p>
    </aside>
  );
}
