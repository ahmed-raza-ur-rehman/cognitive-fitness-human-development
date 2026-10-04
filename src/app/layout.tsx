import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { AccessibilityControls } from "@/components/accessibility-controls";
import { SiteHeader } from "@/components/site-header";
import { PREFERENCE_BOOTSTRAP_SCRIPT } from "@/lib/preferences";
import { getRouteById, ROUTE_KIND_LABELS } from "@/lib/routes";
import "./globals.css";
import "./training.css";

export const metadata: Metadata = {
  title: {
    default: "Cognitive Fitness — Explore cognition and human development",
    template: "%s | Cognitive Fitness",
  },
  description:
    "An evidence-informed learning space for exploring how people think, learn, feel, connect, and develop—with practical pathways and research limits you can inspect.",
  applicationName: "Cognitive Fitness",
};

export const viewport: Viewport = {
  themeColor: "#0b1016",
  width: "device-width",
  initialScale: 1,
};

const footerRoutes = [
  "journeys",
  "explore",
  "develop",
  "train",
  "lab",
  "progress",
  "evidence",
  "coach",
  "search",
  "privacy",
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Applies saved reading options before the first paint so text never jumps. */}
        <script dangerouslySetInnerHTML={{ __html: PREFERENCE_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to the main content of this page
        </a>
        <div className="site-shell">
          <SiteHeader />
          <AccessibilityControls />
          {children}
          <footer className="site-footer">
            <div className="container footer-inner">
              <nav className="footer-index" aria-label="Every area, with what it is for">
                <p className="mini-label">THE WHOLE SPACE</p>
                <ul>
                  {footerRoutes.map((id) => {
                    const route = getRouteById(id);
                    if (!route) return null;
                    return (
                      <li key={route.id}>
                        <Link href={route.path}>
                          <span className="footer-kind">{ROUTE_KIND_LABELS[route.kind]}</span>
                          <strong>{route.label}</strong>
                          <span>{route.purpose}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="footer-boundaries">
                <p>Curiosity, practice, and evidence—without the hype.</p>
                <p className="footer-note">
                  Educational only. Activities are not diagnostic tests or treatment, scores describe one task under one
                  set of conditions, and progress stays on this device unless you copy or share it yourself.
                </p>
                <a href="#main-content" className="footer-top-link">
                  Back to top <span aria-hidden="true">↑</span>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
