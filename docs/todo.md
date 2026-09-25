# Todo

Open bugs, cleanups, projects and ideas for the frontend. Backend items live in
`../smartdormv2-backend/docs/todo.md`.

**How to use this file:** add an item when you find something you're not fixing right now.
Say where it is, what goes wrong, and what the fix should be if that's already decided.
Tick items off instead of deleting them, and add the date and commit.

## Bugs

- [ ] **`getSidebarItems()` changes the route config it reads.** In `routesConfig.tsx` it does
  `item.routes = visibleRoutes` on the shared `appRoutes` groups. `App.tsx` builds the router
  from the same array, so after someone logs out and another account logs in *in the same
  tab* (no reload), grouped routes the first user couldn't see are missing: from the sidebar
  and from the router (404). Fix: filter into a new object instead of assigning.
- [ ] `index.html` has `lang="en"`. It should be `de`, or browsers offer to translate the page.

## Projects

- [ ] **German API messages.** Only about 17 of about 213 `{"error"/"message": …}` texts in the
  backend views are German, and the frontend shows many of them as they are (in 26 files). Either
  translate them in the backend, following `voice-and-tone.md`, or map them to German texts in
  the frontend.

## Cleanup

- [ ] Remove unused dependencies: `lucide-react`, `boxicons`, `react-calendar`,
  `react-big-calendar`, `react-mui-sidebar`, `date-fns`, and the stale type packages
  `@types/axios`, `@types/react-router-dom` (v5 types for router v7), `@types/react-calendar`,
  `@types/sass`.
- [ ] Delete the dead dashboard widgets `Announcements.tsx` and `PaymentStatus.tsx` (English
  placeholder text, rendered nowhere) and `PlaceholderPage` in `pages.tsx`.
- [ ] Replace the hard-coded `rgb(128, 22, 44)` in six components with `primary.main`
  (`TenantStatisticsTab`, `DashboardCard`, `TabbedDashboardCard`, `AttendanceResultPopup`,
  `DonationNote`, `ActiveSessionDisplayPage`). Also drop the stray `;` inside the colour strings
  in `theme.ts` (`"rgb(128, 22, 44);"`). MUI only parses them by luck.
- [ ] Replace the four `window.confirm()` calls with MUI dialogs (see `design-language.md`).
- [ ] Remove the `console.log`s in `routesConfig.tsx` (they run on every load and every sidebar render).
- [ ] `index.html` loads Roboto and Material Icons from Google Fonts. The app uses Geist and SVG
  icons, so both are probably unused requests. Check, then remove.
- [ ] `global.scss` sets `font-family: "Arial, sans-serif"` (one quoted name, so invalid). The
  MUI baseline overrides it anyway. Delete the line.

## Ideas

(none yet)
