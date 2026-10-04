#!/usr/bin/env bash
set -euo pipefail

# Run from the project root or any directory. This CI/release helper reinstalls
# the lockfile and writes a production build to .next; stop a local dev server
# first if it is using this checkout.
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

printf '\n== Clean dependency install ==\n'
npm ci

printf '\n== Lint ==\n'
npm run lint

printf '\n== Type check ==\n'
npm run typecheck

printf '\n== Component and logic tests ==\n'
npm test

printf '\n== Reviewed content validation ==\n'
node content/validate.mjs

printf '\n== Workflow validation ==\n'
python3 scripts/agent_flow.py validate

printf '\n== Workflow helper tests ==\n'
python3 -m unittest discover -s tests -p 'test_*.py' -v

printf '\n== Production dependency audit ==\n'
npm audit --omit=dev

printf '\n== Production build ==\n'
npm run build

printf '\nRelease checks passed. Review the full development dependency audit and manual release gates in docs/RELEASE-CHECKLIST.md.
'
