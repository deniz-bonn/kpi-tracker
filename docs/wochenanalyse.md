# Wochenanalyse Bonn (Transkript-Codierung, Verbleib-Liste, Freitagsreport)

Dauerbetrieb der Oktober-2026-Analyse (Original-Skripte: `backend/analyse/oktober-2026/`). Code: `backend/src/analyse/`,
Tabellen: Migration 119, Konfiguration: `backend/config/analyse/`.

## Ablauf

| Zeit (Berlin) | Job | Was passiert |
|---|---|---|
| täglich 23:00 | Codierlauf | Close-Delta, Anrufe der acht Personen spiegeln, Aufgaben inkrementell, Fireflies-Meetings klassifizieren und Close zuordnen, Codier-Aufträge anlegen (Close-Aufnahmen ab 60 s, zugeordnete Sales-Call-Meetings), Batch mit Sonnet einreichen |
| alle 10 Min. | Einsammeln | Fertige Batches holen, `call_codings` schreiben (genau einmal je Call), fehlgeschlagene Aufträge für den nächsten Lauf markieren (max. 3 Versuche) |
| täglich 05:30 | Verbleib | Verbleib-Liste neu berechnen, Snapshot in `verbleib_snapshot` (Dashboard `/verbleib`) |
| Fr 17:00 | Zusatz-Codierlauf | damit der Freitag im Report steckt |
| Fr 19:55 | Einsammeln | letzter Stand vor dem Report |
| Fr 20:00 | Report | Modell-IDs prüfen, Zahlen, Texte (Opus), Excel, Mail, Eintrag `weekly_reports` |

Cron läuft auf Railway automatisch (`DATABASE_URL` gesetzt). Lokal aus; mit `ANALYSE_JOBS=an` einschalten, mit `ANALYSE_JOBS=aus` überall abschalten.

## Versand

- **Weg:** `team.json` → `versand.kanal` = `slack` (Standard) oder `mail`. Solange die Slack-App fehlt (`SLACK_BOT_TOKEN` nicht gesetzt), fällt der automatische Lauf auf Mail zurück und meldet das als Warnung.
- **Inhalt:** kompaktes PDF (höchstens 3 A4-Seiten: Seite 1 Team, Seiten 2–3 je Mitarbeiter ein Block) plus Excel „Verbleib“ (Firmen, Werte, Close-Links) und „Codierungen“. Mehr als 3 Seiten wird als Warnung gemeldet.
- **Slack:** eine Nachricht mit drei Kernaussagen und den drei Dateien; live im privaten Kanal `SLACK_KANAL_ID`, Test als Direktnachricht an Deniz. App: `docs/wochenanalyse-slack-app.yml`.
- **Modus** in `analyse_settings.versand_modus`: `test` (Standard; Slack-Direktnachricht an `versand.slack.test_an` bzw. Mail an `versand.empfaenger_test`) oder `live` (Slack-Kanal bzw. Mail an `versand.empfaenger_live`). Umschalten nur durch Superadmin: `PUT /api/admin/analyse/versand-modus {"modus":"live"}` (Audit-Log).
- **Mail (Rückfall):** Resend (`RESEND_API_KEY`) oder SMTP; Resend stellt ohne verifizierte Domain nur an die Konto-Adresse deniz@fach-digital.de zu.
- **Fehler** jedes Laufs: Slack-Direktnachricht an `versand.slack.fehler_an`, ohne Slack per Mail an `versand.fehler_an`.
- Keine Kundennamen im Text; Firmen, Werte und Close-Links nur in der Verbleib-Excel.

## Nachholen / manuell

Admin-Endpoints (Superadmin), antworten mit 202, Fortschritt unter `GET /api/admin/analyse/status`:

| Endpoint | Body |
|---|---|
| `POST /api/admin/analyse/codierung` | `{ "von": "2026-10-31", "bis": "2026-11-06" }` |
| `POST /api/admin/analyse/einsammeln` | – |
| `POST /api/admin/analyse/verbleib` | `{ "stichtag": "2026-11-06" }` |
| `POST /api/admin/analyse/report` | `{ "stichtag": "2026-11-06", "modus": "test", "kanal": "slack" }` (kanal optional: slack/mail) oder `{ "von": "...", "bis": "...", "modus": "ohne_versand" }` |
| `GET /api/admin/analyse/laeufe/:id` | Log eines Laufs |

Kommandozeile (lokal oder `railway run`): `npm --prefix backend run analyse -- <codierung|einsammeln|verbleib|report|oktober-basis|status> [--von --bis --stichtag --modus --warten]`.

## Regeln (Kurzfassung)

- Team: nur die acht Personen aus `team.json`; Fireflies-Sprecher über Nachnamen-Muster (Julius nimmt über Tobias' Konto auf).
- Codierung: Prompt v2 = Oktober-Prompt wörtlich + zwei Felder (Datum und Paraphrase des nächsten Schritts). Kein Transkripttext in der Datenbank; Namen werden aus Einzeilern entfernt.
- Quoten: nur Konfidenz hoch/mittel. Closing erfolgreich = Abschluss im Call oder laut Close gewonnen.
- Woche = Samstag bis Freitag (KW des Freitags), Monat = 1. bis Stichtag, Werktage Mo–Fr ohne Feiertage.
- Opening: ab November alle Calls ab 60 s; Vergleich mit der Oktober-Basis (nur Leads mit späterem Termin) ist „nicht vergleichbar“.
- Oktober-Basis: `config/analyse/oktober-basis.json` (1.059 Codierungen 01.10.–03.11., ohne Namen), wird beim ersten Codierlauf automatisch übernommen und ist gegen `report_team.md` geprüft.
- Pace: Tagesziele je Person aus `board_ziele` (Live-Board). KPIs ohne Tagesziel nur als Ist. Team: `shared/kpiConstants.json` und `monthly_targets_standort`.
- November-Ziele je Stufe: `team.json` → `november_ziele` (Opening Terminfrage 90 %, Setting Closing angeboten 70 %, Closing Abschluss versucht 50 %, Nachfassung Schritt mit Datum 60 %).
- Kosten: aus Token-Zahlen und Listenpreisen (`models.json`), keine Abfrage bei Anthropic.
