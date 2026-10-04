"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * One primary navigation set, mirrored by the mobile menu and the footer. Each item is a real
 * area of the product with a distinct job, so a label alone should be enough to decide.
 */
const navigationItems = [
  { label: "Explore", href: "/explore", note: "Read one reviewed concept and its connections." },
  { label: "Develop", href: "/develop", note: "Browse whole-person areas and what each can offer." },
  { label: "Train", href: "/train", note: "Practise a defined task with visible rules." },
  { label: "Lab", href: "/lab", note: "Try one short demonstration and read its limits." },
  { label: "Evidence", href: "/evidence", note: "See claims, sources, and what they stop short of." },
  { label: "Coach", href: "/coach", note: "Optional guide; the local tools work without it." },
] as const;

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Cognitive Fitness home">
          <svg
            aria-hidden="true"
            className="brand-mark"
            viewBox="0 0 40 40"
            fill="none"
          >
            <path d="M9 12.5 20 7l11 5.5v14L20 33l-11-6.5v-14Z" />
            <path d="m9.5 13 10.5 6 10.5-6M20 19v13" />
            <circle cx="9" cy="12.5" r="2.2" />
            <circle cx="20" cy="7" r="2.2" />
            <circle cx="31" cy="12.5" r="2.2" />
            <circle cx="20" cy="19" r="2.2" />
            <circle cx="20" cy="33" r="2.2" />
          </svg>
          <span className="brand-copy">
            <span className="brand-overline">COGNITIVE</span>
            <span className="brand-name">Fitness Lab</span>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-toggle-label">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span className="menu-toggle-icon" aria-hidden="true"><span /><span /></span>
        </button>

        <nav className={`primary-nav${menuOpen ? " is-open" : ""}`} id="primary-navigation" aria-label="Primary navigation">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={isActive ? "is-current" : undefined}
                aria-current={isActive ? "page" : undefined}
                title={item.note}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <Link className="header-search" href="/search" aria-label="Find a page by word">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="search-icon">
              <circle cx="8.6" cy="8.6" r="5.4" />
              <path d="m12.8 12.8 3.6 3.6" />
            </svg>
            <span aria-hidden="true">Find</span>
          </Link>
          <Link className="header-note" href="/journeys" onClick={closeMenu}>
            <span className="status-dot" aria-hidden="true" />
            <span>Not sure where to start? Begin with a path</span>
          </Link>
        </div>
      </div>

      {menuOpen ? (
        <nav className="mobile-nav-notes" aria-label="What each section is for">
          {navigationItems.map((item) => (
            <p key={`${item.label}-note`}>
              <strong>{item.label}</strong>
              <span>{item.note}</span>
            </p>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
