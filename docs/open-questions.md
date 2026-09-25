# Open questions

Things the code can't answer. Ask the maintainers, then move the answer into the right doc
and tick the item here (with the date). Domain questions are in
`../smartdormv2-backend/docs/open-questions.md`.

- [ ] **Gendered terms:** the UI says "Bewohner", "Mieter", "Untermieter". The dorm's website uses
      colon forms ("Heimrät:innen", "Flursprecher:innen"). Keep the short forms, or switch?
- [ ] **"Du" in emails:** the templates mostly capitalize ("Du", "Dein") but not everywhere. Is
      capitalized the rule for emails (and lowercase in the app)?
- [ ] **Point thresholds** in `utils/extensionLogic.ts` (75/150/250/300/350, +50, deadline
      move-in + n+1 years + 9 months): where is that rule written down, and who tells us when
      it changes?
- [ ] Is Umami analytics (`umami.juliushussl.at`) meant to stay, and do residents know about it?
