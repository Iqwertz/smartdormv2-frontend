# SmartDorm frontend

The React app of SmartDorm, the tenant management software of the Schollheim. The API is
[`smartdormv2-backend`](../smartdormv2-backend).

- **New here?** Start with [`docs/README.md`](docs/README.md), and for the dorm itself with the
  backend's [`docs/README.md`](../smartdormv2-backend/docs/README.md).
- **Working with an AI agent?** Agents read [`AGENTS.md`](AGENTS.md) (Claude via `CLAUDE.md`).
- **How it should look and sound:** [`docs/design-language.md`](docs/design-language.md),
  [`docs/voice-and-tone.md`](docs/voice-and-tone.md).
- **Open bugs and ideas:** [`docs/todo.md`](docs/todo.md).

```sh
npm install
npm run dev      # http://localhost:5173, API from VITE_API_BASE_URL (.env.development)
```

Needs Node 20+. Details and the WSL Node trap: [`docs/development.md`](docs/development.md).
