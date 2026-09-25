# Voice and tone

How SmartDorm sounds, in the app, in API messages the app shows, and in emails. The
reference is the email templates in `../smartdormv2-backend/smartdorm/templates/email/`,
written by the maintainers.

## The voice in one paragraph

SmartDorm talks like a fellow resident who happens to do the Netzwerkreferat: friendly,
direct, a bit casual, never an office. It's a student dorm, so it doesn't need to sound
serious. It says what happened and what to do next, and then stops. It doesn't explain
how the system works unless you need that to act.

## Rules

1. **German, always.** Every label, message, dialog, email and error the user can see.
   Code, comments, logs and `console` output stay English.
2. **"du", always**: residents, the Verwaltung, externals. Write it as German grammar
   has it: **lowercase** (du, dich, dir, dein), in the app and in emails alike ("Falls du
   Fragen hast …"). Capitalized only at the start of a sentence or line ("Deine Wohnzeit
   läuft bald aus", "Dein Netzwerkreferat").
3. **Short.** One sentence beats two. Cut filler like "Hinweis:", "Bitte beachten Sie",
   "Hier können Sie …", "Diese Funktion ermöglicht …". If the screen is self-explanatory,
   add no text at all.
4. **Say what happened, then what to do.** "Das hat nicht geklappt. Versuch's gleich
   nochmal." is better than "Ein Fehler ist aufgetreten." on its own.
5. **No tech talk to users.** No "CSRF", "Session-ID", "Server-Error 500", "LDAP".
   (Admin pages for the Netzwerkreferat may use them. They know what LDAP is.)
6. **Use the words residents use**, in their short form (no ":innen"): Bewohner, Mieter, Untermieter, Referat, Amt, Auszug, Wohnzeit,
   Verlängerung, Punkte, Entlastung, Flursprecher. See the glossary in
   `../smartdormv2-backend/docs/domain/glossary.md`. English words are fine only where
   residents use them too (Dashboard, Login, Quick Links, Scan).
7. **Humour is allowed, not required.** A light touch fits empty states and success
   messages ("Alles erledigt, keine offenen Pakete."). Never in errors, money, move-outs or
   terminations.
8. **Formats:** dates `31.03.2027`, times `10:00 Uhr`, money `12,50 €`, German quotes „…“.

## Patterns

| Situation | Pattern | Example |
| --- | --- | --- |
| Button | verb, or object + verb | „Speichern“, „Bewerbung löschen“, „QR-Code scannen“ |
| Page / card title | noun, no article | „Deine Referate“, „Pakete“, „Auszüge“ |
| Success (snackbar) | what happened, past tense | „Paket eingetragen.“, „Bewerbung zurückgezogen.“ |
| Error (snackbar/Alert) | what failed + what to do | „Deine Referate konnten nicht geladen werden. Lad die Seite neu.“ |
| Validation | what's missing, directly | „Gib Kontoinhaber und IBAN an.“ |
| Confirmation dialog | question as title/text, consequence once, specific buttons | „Untermieter löschen?“ / „Das lässt sich nicht rückgängig machen.“ / „Löschen“ · „Abbrechen“ |
| Empty state | plain fact, maybe a wink | „Noch keine Bewerbungen.“ |
| Loading | nothing, or one word | spinner; „Lädt …“ |

## Before and after (real strings from the app)

| Before | After |
| --- | --- |
| Möchten Sie den Untermieter wirklich löschen? | Untermieter wirklich löschen? |
| Failed to load engagements. | Deine Referate konnten nicht geladen werden. |
| Login failed. Could not connect to the server. | Der Server ist gerade nicht erreichbar. Versuch's gleich nochmal. |
| Permission denied. CSRF check might have failed. | Anmeldung fehlgeschlagen. Lad die Seite neu und versuch's nochmal. |
| Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen ein neues Passwort zu. | Gib deine E-Mail-Adresse ein, dann schicken wir dir ein neues Passwort. |
| Legen Sie das Dokument auf den Scanner und klicken Sie auf "Scan starten". | Leg dein Dokument auf den Scanner und tipp auf „Scan starten“. |
| Achtung: Führt diese Aktion nur aus wenn alle neuen Referate eingetragen sind. Sie entfernt die Berechtigungn für alle Ämter des aktuellen Semesters und fügt sie für alle Ämter des neuen Semesters hinzu. | Erst ausführen, wenn alle Referate fürs neue Semester eingetragen sind. Die Ämter des alten Semesters verlieren dann ihre Rechte, die neuen bekommen sie. |

## Emails

The templates share one layout (`template.html`) and one shape:

```text
Betreff: short and concrete ("Dein Auszug aus dem Schollheim", "Benachrichtigung: Post für dich")

Hallo {Vorname},

1–3 sentences: what happened, what the resident has to do and by when.

Bitte antworte nicht auf diese Mail, da sie von einer automatischen Mailbox versendet wurde.

Viele Grüße,
Dein Netzwerkreferat
```

- Greet with the first name only.
- If the resident has to act, name the action and the date. Link to SmartDorm with the button.
- Point to a real contact for questions (info@, netzwerk@, the Verwaltung), not "contact support".

## API messages

Messages from the backend that the frontend shows (`{"error": …}`, `{"message": …}`) follow
the same rules. Many are still English. See `docs/todo.md`.
