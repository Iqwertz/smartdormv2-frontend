# Development

## Node

In the usual WSL setup, the `node` on PATH is **v10**, which fails with syntax errors inside
the toolchain. `npx` may also resolve to the Windows install (`/mnt/c/Program Files/nodejs/`)
and fail with `bash\r: No such file or directory`. Put nvm's Node first:

```sh
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
node --version   # v22.x
```

CI builds with Node 20.

## Running

```sh
npm install
npm run dev              # Vite on http://localhost:5173 (also on the LAN: --host)
```

The API URL comes from `VITE_API_BASE_URL`: `.env.development` points to
`http://localhost:8000` (the backend's `run-server.sh`). To work against the test API instead,
set it to the dev API host in a local `.env.development.local` (don't commit it). The backend
already allows `localhost:5173` for CORS and CSRF.

Log in with a real test account. On the test system the login form offers the per-role dev
accounts (`dev-bewohner`, `dev-verwaltung`, `dev-heimrat`, …). Ask the maintainers for their shared password.

## Env vars

| Var | Meaning |
| --- | --- |
| `VITE_API_BASE_URL` | API host without `/api` (the service paths include it) |
| `VITE_DEMO_MODE` | `true` shows the demo login hint |
| `VITE_ATTENDANCE_LINK_CHECKIN_ENABLED` | `false` disables check-in by opening the QR link in a browser |

`VITE_*` values are baked in at build time. CI writes `VITE_API_BASE_URL` per environment.

## Checks

```sh
npm run build        # tsc -b + vite build, what CI's build_check runs on feature branches and MRs
npx tsc --noEmit     # CI's type_check
npm run lint         # ESLint (not in CI)
```

There are no frontend tests. Before handing over a change, run `npm run build`, and click
through the affected page as each role that can see it.

## Deploying

`.gitlab-ci.yml`: on feature branches and MRs, build check + type check + `npm audit`
(allowed to fail). On `develop`: build + deploy to the test system automatically. On `main`:
build + deploy to production after a manual click. The deploy `rsync`s `dist/` to
`/var/www/smartdorm-frontend/html/` behind Nginx (SPA fallback to `index.html`). Server setup:
`../smartdormv2-backend/docs/runbooks/server-setup.md`. Environments and troubleshooting:
`../smartdormv2-backend/docs/operations.md`.
