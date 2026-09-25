# Open questions

Things the code can't answer. Ask the maintainers, then move the answer into the right doc
and tick the item here (with the date). Domain questions are in
`../smartdormv2-backend/docs/open-questions.md`.

- [x] **Gendered terms:** keep the short forms (Bewohner, Mieter, Untermieter). *(2026-09-25)*
- [x] **"Du" in emails:** as German grammar has it, so lowercase mid-sentence everywhere. The
      templates were changed accordingly. *(2026-09-25)*
- [x] **Point thresholds:** they come from the association's statutes (Vereinsstatuten), which
      are private. Don't copy them into the repo. When the statutes change, the maintainers
      update `utils/extensionLogic.ts`. *(2026-09-25)*
- [ ] Is Umami analytics (`umami.juliushussl.at`) meant to stay, and do residents know about it?
