# Design language

What SmartDorm looks like and how to keep it that way. The maintainers like the current
look, so this describes it rather than reinventing it. New screens should fit in without
anyone noticing they're new.

## The idea

Behind every page is `public/img/Wohnheim.jpg`: an aerial photo of Munich, desaturated to
warm grey, with only the Schollheim in colour (red roofs, green dormers, the roof garden).
The app floats over that photo as **frosted-glass cards**. The one strong colour, a deep
**burgundy**, echoes the roofs. The result is calm, light, and clearly *our* dorm.

## Tokens

The source of truth is `src/theme.ts` (MUI). `src/styles/_variables.scss` mirrors it for the
SCSS files. In components, use the theme (`primary.main`, `text.secondary`, …), not raw values.

| Token | Value | Use |
| --- | --- | --- |
| `primary.main` | `rgb(128, 22, 44)` (#80162C) | title chips, contained buttons, active tab, selected nav item, `theme-color` |
| `primary.light` | `rgb(204, 99, 120)` | hover on selected items |
| `primary.dark` | `rgb(59, 6, 6)` | darkest accent |
| accent (SCSS) | `rgb(197, 133, 146)` | soft burgundy in the sidebar |
| `error.main` | MUI red A400 | errors |
| `background.default` | `#f5f5f5` | page background where the photo isn't visible |
| `background.paper` | `#ffffff` | dialogs, solid surfaces |
| glass card | `rgba(255,255,255,0.85)` + `backdrop-filter: blur(8px)` | `DashboardCard` |
| glass (sidebar, SCSS) | `rgba(255,255,255,0.5)` + blur 8px | sidebar |
| `text.primary` / `text.secondary` | `#212121` / `#757575` | body / muted text |
| chip text | `#f1f1f1` | text on the burgundy title chip |

**Type:** Geist Sans (weights 300/400/600/700, bundled via `@fontsource`). Headings 600–700.
Buttons are **not uppercase** (`textTransform: none`) and weigh 600.

**Shape:** base radius 5px. Cards use `borderRadius: 2` (10px), title chips 5px, buttons 10px
with `8px 24px` padding and no elevation.

## The building blocks

- **`DashboardCard`** (`components/shared/`): the standard card. A glass `Paper`
  (elevation 6) with a **burgundy title chip** overlapping its top-left corner. Optional
  `action` slot at the top right. Use it for anything that stands on its own.
- **`TabbedDashboardCard`**: the admin workhorse. The same chip, followed by a row of tab
  chips (active tab burgundy, others white). The card body is solid white. Tabs can be
  hidden per group with `authGroups`. Every admin page (Verwaltung, Heimrat, Referate,
  Netzwerkreferat, …) is one or more of these.
- **Tables:** MUI X `DataGrid` inside a card. Not hand-built `<Table>`s.
- **Forms:** MUI `TextField` (outlined), date pickers with the German dayjs locale.
- **Feedback:**
  - `showNotification(message, severity)` (snackbar, bottom centre, 6 s) for the result of an action
  - `<Alert>` for a state inside a card ("Noch keine Bewerbungen.", load errors)
  - `CircularProgress` while loading
- **Confirmations:** an MUI `Dialog` with a clear title and two specific buttons. Don't
  use `window.confirm` (a few old places still do).
- **Icons:** `@mui/icons-material` only. Prefer the outlined variants, as most of the sidebar does.

## Layout

- **Sidebar** (`components/shared/Sidebar.tsx` + `styles/Sidebar.scss`): glass panel on the
  left, built from `routesConfig.tsx`, showing only what the user may open. At **≤ 1100 px**
  it collapses into a hamburger button and opens as an overlay.
- **Main area:** scrolls on its own over the fixed photo. Padding grows with the screen
  (`p: { xs: 1, sm: 2, md: 3 }`). Pages wrap themselves in `.page-root`.
- **Dashboards** (resident, subtenant): a two-column grid (`3fr 2fr`, max 1000 px, centred,
  `styles/bento-layout.scss`). At **≤ 768 px** it becomes one column, with a **hand-set order**
  via `nth-child`. If you add, remove or move a dashboard card, renumber the order rules too,
  or the phone layout scrambles.
- **Admin pages:** a stack of `TabbedDashboardCard`s at full width.
- **Projector view** (`ActiveSessionDisplayPage`): the exception. Full screen, a huge QR
  code, no sidebar.

## Mobile

Residents often use SmartDorm on their phones (QR scanning at assemblies, the dashboard).
Check every resident-facing page at phone width. MUI's `sm` breakpoint (`useMediaQuery(
theme.breakpoints.down("sm"))`) switches card internals to their compact form.

## Don'ts

- Don't hard-code `rgb(128, 22, 44)`. Use `primary.main` (some old places still hard-code it).
- Don't add colours, fonts or shadows that aren't in the theme. Change `theme.ts` if the look
  itself should change, and write it down here.
- Don't add new UI libraries. MUI covers it.
- Don't put a page on a plain white background. Everything sits in cards over the photo.
