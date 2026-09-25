# Architecture

## Startup

`main.tsx` wraps `<App>` in: MUI `ThemeProvider` + `CssBaseline` → `LocalizationProvider`
(dayjs, `de`) → `NotificationProvider` → `AuthProvider`. `AuthProvider` calls
`GET /api/auth/me/` once. Until it answers, `App` shows a loading screen, so every page can
assume the auth state is known.

## Routing and access

**Every route lives in `src/routesConfig.tsx`**, as an `AppRoute` or grouped in an
`AppRouteGroup` (a sidebar section):

```ts
{
  id: "parcels",
  path: "/department/parcels",
  element: <Pages.ParcelPage />,          // lazy, imported in src/pages.tsx
  title: "Pakete",                         // sidebar label
  icon: <Inventory2OutlinedIcon />,        // sidebar icon (needs title + icon to show up)
  requiredGroups: ["VERWALTUNG", "ADMIN"], // empty = every logged-in user
  sidebar: true,
  defaultRedirectOrder: 1,                 // optional: where "/" sends this user after login
}
```

- `App.tsx` turns them into `<Route>`s, each wrapped in `ProtectedRoute`, inside `AppLayout`
  (sidebar + scrolling main area). Login, password reset and the attendance check-in link
  (`/attendance/check-in`) are outside the layout.
- `ProtectedRoute`: not logged in → `/login`. A missing group → `/not-authorized`.
  **Subtenants** get through only on routes with `allowSubtenants: true`, and are sent to
  `/subtenant` otherwise. Their groups overlap with tenants' (wlan, wiki), so group checks
  alone can't keep them out.
- The sidebar shows the routes the user may open (`getSidebarItems`). After login, `/` sends
  the user to the accessible route with the lowest `defaultRedirectOrder`.
- The floor signature pages (`/signatures/h1l3`, …) are generated from `ALL_FLOORS` in `config.ts`.
- Tabs inside a page are restricted with `authGroups` on `TabbedDashboardCard`.

**The frontend only hides things. The backend decides.** Every `requiredGroups` /
`authGroups` list must match the access rule of the endpoints that page calls
(`../smartdormv2-backend/smartdorm/permissions.py`, `manage.py list_api_access`). When they
disagree, users either see buttons that fail with 403, or miss pages they may use. Change both
repos together. Details: `../smartdormv2-backend/docs/permissions.md`.

## Talking to the API

- `services/api.ts` exports `apiClient`: axios with `baseURL = VITE_API_BASE_URL`,
  `withCredentials: true` (the Django session cookie), and an interceptor that copies the
  `csrftoken` cookie into `X-CSRFToken` on POST/PUT/PATCH/DELETE.
- One service module per API area (`parcelService.ts`, `engagementService.ts`,
  `printingService.ts`, …) with small typed functions. Paths include `/api/…`, so the base URL
  is just the host (`http://localhost:8000`, the dev/prod API host).
- Types live in `src/types/`. They mirror the backend serializers by hand, so change them when
  a serializer changes.
- Errors: components catch, then either `showNotification(…, "error")` or set an error state
  rendered as `<Alert>`. Backend messages (`err.response.data.error`) are often shown as they
  come, so backend wording matters (see `voice-and-tone.md`).

## State

No Redux or query library. `AuthContext` holds the user (`username`, `groups`, `user_type`,
`is_subtenant`, …) with `login`, `logout` and `refreshUser`. `NotificationContext` holds one
global snackbar. Everything else is local `useState` + `useEffect` in the page, and lists are
reloaded after mutations.

## Pages by area

| Folder | Who | Pages |
| --- | --- | --- |
| `pages/` (root) | everyone | `TenantPage` (resident dashboard), `DepartmentPage` (Verwaltung tenant list), login, password reset, 403/404 |
| `pages/tenants/` | residents | apply for a Referat, read applications, print & scan |
| `pages/subtenants/` | subtenants | their dashboard |
| `pages/admin/` | Verwaltung | new/edit tenant, subtenants, departures, extensions, parcels, printer admin |
| `pages/engagements/` | Heimrat, Referate, event admins | Heimrat, Referate management, resident overview, Netzwerkreferat, signatures, attendance (manage, projector, report, base attendance, check-in) |
| `pages/shared/` | everyone | HSV page (who holds which Referat) |

The resident dashboard's cards are in `components/tenants/dashboard/content/`: profile,
Referate, points and lease (`PointsStatus` with `utils/extensionLogic.ts`), calendar,
quick links, service status, attendance history, donation note, and the move-out decision popup.

## Things worth knowing

- **Points → extensions display.** `utils/extensionLogic.ts` holds the dorm's point thresholds
  for lease extensions (75, 150, 250, 300, 350, then +50 each) and the deadline for each
  (move-in + sublet months + (n+1) years + 9 months). It is **only shown for orientation**. The
  Zimmerreferat and the Verwaltung decide by hand. The rule comes from the association's
  statutes (Vereinsstatuten, private, don't copy them into the repo). If they change, change it here.
- **External services** on the dashboard are called directly with plain axios, without the
  session cookie: the room booking API (`api-rooms.schollheim.net`, room status in
  `services/externalStatusService.ts`, calendar in `CalendarWidget.tsx`, linking to
  `rooms.schollheim.net`) and the washing machine status (`waschmaschinen.schollheim.net`).
  The backend's `/api/tenants/calendar-proxy/` (Nextcloud) isn't used by the frontend.
- **Attendance link check-in**: the projector's QR code is a link to
  `/attendance/check-in?code=<sessionId>_<token>`. If the user isn't logged in, the code is
  kept in `sessionStorage` and submitted after login. The in-app scanner (`html5-qrcode`)
  accepts the same links. `VITE_ATTENDANCE_LINK_CHECKIN_ENABLED=false` turns the browser
  check-in off.
- **Analytics:** `index.html` loads Umami from `umami.juliushussl.at`. `hooks/useTracking.ts`
  switches it off on localhost and on hosts containing `dev`, `local` or `staging`.
- **Demo mode:** `VITE_DEMO_MODE=true` shows the demo login hint (see the backend's
  `docs/runbooks/demo.md`).
- **Dev accounts:** on the test system, the login form lists the backend's per-role test
  accounts (`/api/auth/dev-accounts/`, only when the backend has `SHOW_DEV_ACCOUNTS`).
