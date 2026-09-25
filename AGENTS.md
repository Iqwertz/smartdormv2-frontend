# SmartDorm frontend

SmartDorm is the tenant management software of the Schollheim, a self-governed student dorm
in Munich. The students run the dorm themselves through elected *Referate*, and they earn
points for it. Two full-time employees, the *Verwaltung*, handle leases, money and legal
matters. This repo is the React single-page app that residents, Referate and the
Verwaltung use. The API is the sibling repo `../smartdormv2-backend`.

**Before doing anything, read [`docs/README.md`](docs/README.md).** For anything about the
dorm itself (tenants, Referate, points, move-outs, LDAP), the knowledge base lives in the
backend: [`../smartdormv2-backend/docs/README.md`](../smartdormv2-backend/docs/README.md).

## Stack

- React 19 + TypeScript + Vite 6, React Router 7.
- MUI 7 (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`, `@mui/x-date-pickers`
  with dayjs, German locale). Styling with `sx` and a few SCSS files.
- axios with the session cookie and CSRF header (`src/services/api.ts`).
- No global state library. React context for auth and notifications, local state everywhere else.

## Commands

The `node` on PATH in this WSL setup is v10 and breaks everything. Use nvm's Node 22 first.

```sh
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
npm install
npm run dev          # http://localhost:5173, talks to VITE_API_BASE_URL (.env.development)
npm run build        # tsc -b && vite build, the same check CI runs
npx tsc --noEmit     # type check only
npm run lint
```

More in [`docs/development.md`](docs/development.md).

## Where things are

```
src/routesConfig.tsx   every route: path, page, sidebar title/icon, requiredGroups
src/pages.tsx          lazy page imports
src/pages/             one file per page (admin/, engagements/, tenants/, subtenants/, shared/)
src/components/        building blocks, grouped the same way; shared/ = DashboardCard, TabbedDashboardCard, Sidebar
src/services/          one module per API area; all HTTP goes through services/api.ts
src/context/           AuthContext (user + groups), NotificationContext (snackbar)
src/types/             API types
src/theme.ts, src/styles/   MUI theme and SCSS (see docs/design-language.md)
```

## Rules

- **All user-facing text is German and uses "du".** Short and friendly, like a fellow resident
  writing, not an office. Don't add explanatory text nobody asked for. Follow
  [`docs/voice-and-tone.md`](docs/voice-and-tone.md). Code, comments and console output stay English.
- **Keep the look.** Glass cards on the dorm photo, the burgundy title chip, and MUI with the
  theme's colours. Build new screens from `DashboardCard` / `TabbedDashboardCard` and the
  existing patterns. See [`docs/design-language.md`](docs/design-language.md). No new UI
  libraries or icon sets.
- **Access in the frontend only hides things. The backend decides.** A route's
  `requiredGroups` (and a tab's `authGroups`) must match the backend access rule of the
  endpoints it calls (`../smartdormv2-backend/smartdorm/permissions.py`). Change both together.
- **HTTP only through a service function** in `src/services/` using `apiClient`. Never call
  axios with a hand-built URL in a component.
- **Feedback:** `showNotification()` for results of actions, `<Alert>` for states inside a
  card, and an MUI `Dialog` for confirmations (not `window.confirm`).
- Mobile matters: residents often use SmartDorm on their phones. Check resident pages at phone width.

## Keeping the docs alive

- **Update the docs in the same change as the code.** If no doc fits, create one and add it to
  `docs/README.md`. Domain knowledge goes into the backend docs.
- **Record lasting instructions.** When the user gives an instruction that should outlive
  this task ("always…", "never…", "this should sound like…"), add it to the Rules above,
  `voice-and-tone.md` or `design-language.md`. Say in your reply that you did.
- **Decisions** → [`docs/decisions.md`](docs/decisions.md), **bugs and ideas** →
  [`docs/todo.md`](docs/todo.md), **unknowns** → [`docs/open-questions.md`](docs/open-questions.md).

## Git

- `develop` deploys to the test system automatically on every push, and `main` deploys to
  production after a manual click. Work on a feature branch and merge through a merge
  request. **Ask before pushing** to `develop` or `main`. (The backend's branch is called
  `development`.)
- Commit messages: English, imperative mood, short.
- **No AI attribution:** no `Co-Authored-By` lines and no mention of agents or assistants in
  commit messages or merge requests.
