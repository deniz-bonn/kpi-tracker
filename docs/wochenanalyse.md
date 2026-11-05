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

- Modus steht in `analyse_settings.versand_modus`: `test` (Standard, nur d.akpinar@hioffice.com) oder `live` (die drei Empfänger aus `team.json`).
- Umschalten nur durch Superadmin: `PUT /api/admin/analyse/versand-modus {"modus":"live"}` (Audit-Log).
- Betreff `Vertriebsanalyse Bonn KW xx`; Mailtext ohne Kundennamen; Anhänge `Verbleib_Bonn_KWxx.xlsx` (mit Firma) und `Codierungen_Bonn_KWxx.xlsx`.
- Mailanbieter wie der Rest der App: `RESEND_API_KEY` (bevorzugt) oder `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`, Absender `SMTP_FROM`. Fehlt beides, bricht der Report mit Fehlermail ab statt still „gesendet“ zu melden.
- Fehler jedes Laufs: kurze Mail nur an `versand.fehler_an` (team.json).

## Nachholen / manuell

Admin-Endpoints (Superadmin), antworten mit 202, Fortschritt unter `GET /api/admin/analyse/status`:

| Endpoint | Body |
|---|---|
| `POST /api/admin/analyse/codierung` | `{ "von": "2026-10-31", "bis": "2026-11-06" }` |
| `POST /api/admin/analyse/einsammeln` | – |
| `POST /api/admin/analyse/verbleib` | `{ "stichtag": "2026-11-06" }` |
| `POST /api/admin/analyse/report` | `{ "stichtag": "2026-11-06", "modus": "test" }` oder `{ "von": "...", "bis": "...", "modus": "ohne_versand" }` |
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
