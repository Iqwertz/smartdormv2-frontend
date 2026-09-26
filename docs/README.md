# SmartDorm frontend knowledge base

Read this before working on the frontend. Everything here was checked against the code in
September 2026. Where the code and a doc disagree, trust the code and fix the doc.

| File | Read it when you need… |
| --- | --- |
| [voice-and-tone.md](voice-and-tone.md) | to write any text a user sees: labels, messages, dialogs, emails |
| [design-language.md](design-language.md) | to build or change a screen: colours, cards, layout, mobile |
| [architecture.md](architecture.md) | routing and access, the API client, state, where pages live, external services |
| [development.md](development.md) | Node setup (the WSL trap), running against a backend, env vars, checks, deploys |
| [decisions.md](decisions.md) | why things are the way they are |
| [todo.md](todo.md) | open bugs, cleanups and projects |
| [open-questions.md](open-questions.md) | things we don't know yet |

**The dorm itself** (tenants, Referate, points, move-outs, subtenants, LDAP, access rules) is
documented in the backend: [`../smartdormv2-backend/docs/README.md`](../../smartdormv2-backend/docs/README.md).
Start with its `domain/selbstverwaltung.md` and `domain/glossary.md` if you're new.

## Keeping this current

- Change the docs in the same commit as the code they describe.
- New topic? Create a file and add a row above. Domain knowledge goes into the backend docs.
- When the maintainers say how something should look or sound, write it into
  `design-language.md` or `voice-and-tone.md` right away.
