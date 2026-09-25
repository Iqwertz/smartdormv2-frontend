# Decisions

Why the frontend is the way it is. Newest first. Decisions about the domain, data and
access live in `../smartdormv2-backend/docs/decisions.md`.

## 2026-09-25: German only, "du" everywhere

All user-facing text is German and uses "du", including for the Verwaltung and externals.
No i18n setup. It's a student dorm, and the voice is friendly and short. Guide:
[voice-and-tone.md](voice-and-tone.md).

## 2026-09-25: Keep the current look

The maintainers like the design as it is (dorm photo, glass cards, burgundy chips, Geist, MUI).
New work follows it instead of redesigning. It is documented in
[design-language.md](design-language.md).

## 2026-09: Subtenants are denied by default in the router

Subtenant accounts share groups with tenants (wlan, wiki), so group checks can't keep them out.
`ProtectedRoute` only lets them through on routes with `allowSubtenants: true`, which mirrors the
backend's default-deny middleware.

## Point thresholds are shown, not enforced

`utils/extensionLogic.ts` shows residents how far they are from the next extension. The
decision stays with the Zimmerreferat and the Verwaltung.

## Routes and access in one config file

`routesConfig.tsx` defines path, page, sidebar entry and required groups together, so the
sidebar, the router and the access check can't drift apart.
