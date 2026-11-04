# Oktober-2026-Analyse: Original-Skripte (Archiv)

Gesichert am 04.11.2026 aus zwei temporären Arbeitsordnern (`/private/tmp/claude-501/…`).
Diese Skripte haben die Transkript-Analyse Oktober 2026 erzeugt
(`exports/oktober-2026/transkript-analyse/`). Sie sind die Referenz für die laufende
Wochenanalyse in `backend/src/analyse/`, die Logik und Prompt von hier übernimmt.

**Nicht lauffähig im Repo, und das ist Absicht:** Die Skripte lesen Rohdaten
(`leads.json`, `raw.json`, `stages.json`, `ff/meta.json`, `run/…`), die Kundendaten
enthalten und deshalb nicht übernommen wurden. Pfade zeigen noch auf die alten Arbeitsordner.

| Ordner | Inhalt |
|---|---|
| `kotaman/` | `engine.js`: Ableitung der Termin-Zeitlinie je Opportunity (gleiche Regeln wie `utils/closeSync.js`), `build.js`: Excel-Listen (Settings geführt, Verbleib, Sales Calls) |
| `transkript/` | `lib.js` (Transkripte holen, nur im Speicher), `code_lib.js` (System-Prompt, JSON-Schema, Kosten), `stages.js` (Stufe laut Zeitlinie), `batch_submit.js`/`batch_collect.js`, `regeln.js` (B3, B4-02/03/07), `stats.js`, `reports.js`/`report_team.js` (Opus-Texte), `leakscan.js` (Namensprüfung) |
| `transkript/ff/` | Fireflies: Metadaten, Klassifikation nach Titel, Zuordnung zu Close (Domain + SC-Termin ±1 Tag) |
| `taxo/taxonomie.json` | Die freigegebene Taxonomie (Quelle für `config/analyse/taxonomie.v1.json`) |

Modelle damals: Codierung `claude-sonnet-5-5` (Aufwand niedrig, Batch), Texte `claude-opus-5-5`.
