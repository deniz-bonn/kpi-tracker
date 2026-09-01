# Close-Integration — Show-Rate-Tracking Opener/Setter

**Stand:** 2026-09-01 (Revision 3) · Erstbefund 25.08. · Re-Check 31.08. · Pipeline-Umstellung 31.08./01.09.
**Modus:** read-only (nur GET über `backend/src/utils/closeClient.js`) · **Key:** `CLOSE_API_KEY` (Railway/`backend/.env`, nie im Repo/Log).

## ⚠️ Korrektur gegenüber Revision 1

Revision 1 kam zu dem Schluss, Show-Rates seien **nicht** berechenbar und es brauche erst eine Prozessumstellung auf die Custom-Activity-Typen *Setting* / *Setter Call* / *Closing Call*. **Das war falsch.** Die Discovery hatte sich auf Custom Activities fokussiert und die Status-Events (`LeadStatusChange` 1.656, `OpportunityStatusChange` 91 im 8-Tage-Fenster) als Rauschen abgetan.

Ein Loom-Screencast der Vertriebsleitung (31.08.) plus API-Gegenprobe zeigen: **Der Funnel läuft vollständig über Lead-Status und Opportunity-Status.** Custom Activities sind nicht Teil des Prozesses — im gesamten Screencast wird der „Activity"-Button nie geklickt. Deshalb waren die reichen Typen leer: nicht aus Nachlässigkeit, sondern weil sie im Prozess keine Rolle spielen.

**Neues Verdikt: Die Show-Rates sind aus der Status-Historie heute schon rückwirkend berechenbar** — ohne Prozessumstellung und ohne Wartezeit. Es fehlt nur eine strukturelle Ergänzung (§5).

## 1. Wie der Funnel tatsächlich läuft

Belegt durch Screencast (Bild + Ton) und API:

1. **Lead-Status** wird auf einen kanal-spezifischen Wert gesetzt: `Setting terminiert aus MailMarketing` / `… aus FAX Leads` / `… aus Post`, später `Closing terminiert aus …`, am Ende `✅ Closes aus …` bzw. `Kein Interesse aus …`.
2. **Opportunity** (Pipeline „Sales") trägt den Detail-Status: `Setting terminiert` → `Closing-Termin ausstehend` → `Closing terminiert` → Ausgang.
3. **„Assigned to"** der Opportunity wird auf die Person gesetzt, die den Termin gelegt hat (im Video: Wechsel Andreas Buharin → Markus Bauer).
4. Zusätzlich wird eine **Task** angelegt (z. B. „QC", Assignee, Datum/Uhrzeit).

**Pipeline „Sales" — 19 Status (vollständig):**
`Setting terminiert` · `Setting Follow-Up (Kurzfristig)` · `Follow-Up` · `Closing-Termin ausstehend` · `Closing terminiert` · `Closing No-Show / Absagen` · `Angebot verschickt` · `Closing #High Potentials` · `Closing Call #2 terminiert` · `Soft-Close (Onboarding)` · `Closing Follow-Up (Kurzfristig)` · `Closing Follow-Up (Langfristig)` · `Won` *(won)* · `Lost` *(lost)* · `Setting abgesagt` *(lost)* · `Closing abgesagt` *(lost)* · `Setting No-Show` *(lost)* · `Unqualifiziert` *(lost)* · `Blacklist` *(lost)*

Das ist ein vollständiger Show-Rate-Funnel: gelegt, stattgefunden und nicht-stattgefunden sind sauber getrennt.

## 2. Datenquelle & API (verifiziert)

| Endpoint | Ergebnis |
|---|---|
| `GET /activity/status_change/opportunity/` | ✅ **org-weit + Datumsfilter** — liefert `old_status_label`, `new_status_label`, `old/new_status_type`, `user_id`/`user_name`, `opportunity_id`, `lead_id`, `activity_at`, `date_created/updated`, Pipeline-Infos |
| `GET /activity/status_change/lead/` | ✅ org-weit + Datumsfilter — `old/new_status_label`, `user_id`, `lead_id` |
| `GET /activity/?_type=…` | ❌ HTTP 400 („must provide a single lead_id filter") |
| `GET /activity/opportunitystatuschange/` | ❌ HTTP 404 (Pfad existiert nicht) |
| `GET /pipeline/`, `/status/lead/`, `/opportunity/`, `/custom_field/opportunity/` | ✅ |

→ Inkrementeller Sync über die beiden `status_change`-Endpoints mit `date_created__gte`. Kein Sweep des kompletten Aktivitäts-Feeds nötig (1.033 Events für 3 Monate statt ~120.000 Aktivitäten).

## 3. Status-Mapping (implementierungsreif)

**Termin „gelegt"** = Übergang **in** `Setting terminiert` (Opener) bzw. `Closing terminiert` (Setter).
**Ausgang** = der nächste Status danach:

| Folgestatus | Wertung |
|---|---|
| `Setting No-Show`, `Setting abgesagt` / `Closing No-Show / Absagen`, `Closing abgesagt` | **nicht stattgefunden** (nur Nenner) |
| `Closing-Termin ausstehend`, `Closing terminiert`, `Follow-Up`, `Setting Follow-Up (Kurzfristig)`, `Angebot verschickt`, `Closing #High Potentials`, `Closing Call #2 terminiert`, `Soft-Close (Onboarding)`, `Closing Follow-Up (Kurz/Lang)`, `Won`, `Unqualifiziert` | **stattgefunden** (Zähler + Nenner) |
| kein Folgestatus | **offen** — aus der Quote ausschließen, im Datenqualitäts-Panel zeigen |
| `Lost`, `Blacklist` direkt | unklar — nicht werten, separat ausweisen |

**Quelle-Dimension gratis:** steckt im Lead-Status-Suffix (`… aus MailMarketing` / `… aus FAX Leads` / `… aus Post`). Kein zusätzliches Feld nötig.

## 4. Prototyp-Ergebnis (read-only gerechnet, 1.033 Statuswechsel, 719 Opportunities)

| | Juni | Juli | August |
|---|--:|--:|--:|
| **Settings** gelegt → Show-Rate | 15 → 100 % (Basis 3) | 28 → **93,3 %** (Basis 15) | 24 → **72,7 %** (Basis 11) |
| **Closings** gelegt → Show-Rate | 27 → 90 % (Basis 10) | 137 → **83,5 %** (Basis 85) | 94 → **73,5 %** (Basis 49) |

Je Person (Closings, Attribution = wer den Status setzte): Clemens Näkel 89,5 % (77/86) · Andreas Buharin 63,2 % (24/38) · Brian Groten 62,5 % (5/8) · Mikail Kotaman 83,3 % (5/6) · Markus Bauer 100 % (4/4).

## 5. ⚠️ Die strukturelle Lücke: Lead- vs. Opportunity-Ebene

Der Setting-Funnel läuft fast ausschließlich auf **Lead**-Ebene, die Ausgangs-Status existieren aber nur auf **Opportunity**-Ebene.

| August 2026 (distinkte Leads) | Lead-Ebene | Opportunity-Ebene | Überlappung | Abdeckung |
|---|--:|--:|--:|--:|
| Settings | **311** | 23 | 7 | **2,3 %** |
| Closings | 129 | 91 | 43 | 33,3 % |

Lead-Status kennen **kein No-Show/Abgesagt** (nur `Kein Interesse aus …`) → auf Lead-Ebene ist „nicht stattgefunden" nicht von „stattgefunden, aber kein Interesse" unterscheidbar.

**Folge:** Setter-/Closing-Show-Rate ist belastbar. **Opener-/Setting-Show-Rate ist es nicht** (Basis 2,3 %). Fix: Opportunity bereits beim Setting anlegen — oder je Kanal Lead-Status „Setting No-Show/abgesagt aus …" ergänzen.

Zweite Lücke: **hoher Offen-Anteil** (August: Settings 13/24, Closings 41/94 ohne Folgestatus) → gehört ins Datenqualitäts-Panel.

Monatsvolumen Lead-Ebene: `Setting terminiert aus MailMarketing` 310/447/310 (Jun/Jul/Aug), `aus FAX Leads` 71/31/8; `Closing terminiert aus MailMarketing` 77/145/127.

## 6. Personen-Attribution

- **Primär:** `user_id`/`user_name` des Statuswechsel-Events — wer den Status setzte. Funktioniert ohne jede Disziplinänderung und lieferte im Prototyp plausible Werte.
  **Voraussetzung:** jeder setzt seine eigenen Status. Setzt eine Person zentral für alle, kippt die Einzelauswertung (Warnsignal: die 22 Custom-Activities kamen alle von einer Person).
- **Sekundär:** Opportunity `user_id` („Assigned to") — laut Prozess der Termin-Leger; Risiko, dass er über die Stufen überschrieben wird.
- **Opportunity-Custom-Fields:** `Closer` (Typ `user` ✔), `Setter` (Typ **`contact`** ❌ — Lead-seitige Kontaktperson, für Mitarbeiter-Zuordnung unbrauchbar; sollte `user` sein), `Upfront Cash` (number).
- **Mapping Close-User ↔ employee:** Brücke `users.email` → `users.employee_id` → `employees` (kein E-Mail-Feld an `employees` nötig). 9/20 exakter Namensmatch, 6/20 über E-Mail; Rest sind Zweit-/Sammelkonten (*Drake aus Godesberg* = Clemens Näkel; Tippfehler-Domain `fach-digial.de` = Mikail Kotaman; *Cold Mail*, *Probe Arbeiten2/3*) oder Personen, die in `employees` fehlen.

## 7. To-Dos in Close (an die Vertriebsleitung übergeben, v2)

1. **Opportunity beim Setting anlegen** (Status `Setting terminiert`) — löst §5. *(Alternative: Lead-Status für No-Show/Abgesagt je Kanal.)*
2. **Ausgang konsequent nachtragen**, auch No-Show/Abgesagt.
3. Opportunity-Feld **`Setter` auf Typ `user`** umstellen.
4. **Close-Benutzer bereinigen** (Zweit-/Sammelkonten).

**Ausdrücklich NICHT:** Opener-Feld anlegen, Quelle-Feld pflichtig machen, Activity-Typen stilllegen, Team auf Custom Activities briefen. **Und: an Lead-/Opportunity-Status darf nichts deaktiviert oder umbenannt werden** — Verwechslungsgefahr, weil Activity-Typ, Opportunity-Status und Lead-Status ähnlich heißen.

## 8. Verworfen: der Custom-Activity-Weg (Revision 1)

Zur Nachvollziehbarkeit — die Typen existieren und sind schemaseitig gut, werden aber nicht benutzt (24.–31.08.: 22× *Setting terminiert* (feldlos), 1× *Setting*, alle anderen 0):
*Setting* / *Setter Call*: `Ergebnis des Calls` (Pflicht, choices: `Abgesagt` · `CC terminiert` · `No-Show` · `Qualifiziert` · `Unqualifiziert` · `Verschoben`), *Setter Call* zusätzlich `Quelle` (Pflicht). *Closing Call*: `Ergebnis des Calls` (Pflicht, 11 Werte inkl. `No-Show`, `Verschoben`, `Gewonnen`). *Setting Terminier (NEU)*: `Lead Quelle` (Pflicht) + `Caller` (Typ **text** — Freitext, für Attribution untauglich).
Ein Umstieg hierauf wäre Doppelerfassung neben dem gelebten Prozess gewesen.

**Ebenfalls geprüft und ausgeschlossen:** Meetings (2 im 8-Tage-Fenster) und Call-Dispositions (99,9 % gefüllt, aber reine Telefonie-Ergebnisse `answered`/`no-answer`/`busy` — keine Termin-Ausgänge).

## 9. Phase 1 — Umsetzungsplan (Status-basiert)

1. **`termine`-Tabelle** aus der Opportunity-Status-Historie + **`close_user_map`** (Auto-Vorschlag via `users.email`, Pflege-UI).
2. **Backfill** ab Juni 2026 (weiter zurück möglich, Statuswechsel sind historisch vollständig) + **nächtlicher Inkrement-Sync** über `/activity/status_change/opportunity/` und `/lead/` mit `date_created__gte`. Je Org-Key parametrisiert, betrieben zunächst nur mit dem fach.digital-Key.
3. **Datenqualitäts-Panel**: Offen-Quote je Person/Monat, Settings ohne Opportunity, unzuordenbare Close-User.
4. **Bereich „Show Rates (Close)"** hinter Feature-Flag `show_rates_close` mit Einzelnutzer-Freischaltung (`feature_flag_users`, Migration 099). Setter-Rate live; **Opener-Rate bis §5 gelöst ist als „Datenbasis unzureichend" kennzeichnen** statt eine falsche Zahl zu zeigen.
5. Abgleich gegen das Beta-Board (`activity_logs`) als Parallellauf-Referenz.

**Scope:** nur Org fach.digital (Risem/Morawitz später als zweiter Key). Beta-Board bleibt unangetastet.

## 10. Status

- ✅ Prozess verstanden und verifiziert, Datenquelle gesichert, Mapping steht.
- ✅ **Phase 1 gebaut** (Migration 100, `utils/closeSync.js`, `routes/showrates.js`, Seite `ShowRates.jsx`,
  nächtlicher Sync 01:15 Europe/Berlin). Verifiziert gegen echtes Postgres + Prod-Backup + echten
  read-only Close-Sync: 9.780 Events → 325 Termine, Sync idempotent, alle sechs Prototyp-Zahlen
  reproduziert, 325/325 Termine einem Mitarbeiter zugeordnet, Feature-Flag inkl. Einzel-Freischaltung
  greift. SQLite-Pfad liefert identische Ergebnisse.
- **Gefundener und behobener Bug:** Postgres liefert `TIMESTAMPTZ` als JS-`Date`, SQLite als String —
  `String(v).slice(0,10)` ergab in PG „Mon Aug 31". Datumsableitung läuft jetzt über
  `Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' })`; `toISOString()` wäre ebenfalls falsch
  gewesen (ein Termin am 01.08. 01:30 Berliner Zeit wäre in den Juli gerutscht).
- ⏳ To-Dos in Close bei der Vertriebsleitung (Anleitung v2 übergeben).

## 11. Revision 3 — Pipeline-Umstellung der Vertriebsleitung (31.08./01.09.)

Die Vertriebsleitung hat die Sales-Pipeline umbenannt (QC/SC-Schema) und Altstatus mit Suffix
„Inaktiv" versehen. Zwei API-Eigenheiten kamen dabei ans Licht, die Rev. 2 nicht kannte:

**(a) Status-Labels sind NICHT stabil.** Close löst sie dynamisch auf — nach einer Umbenennung
liefern auch historische Events das neue Label (belegt: alle 24 Juni-Events kamen mit neuen Namen
zurück). Eine label-basierte Ableitung bricht dadurch lautlos. → Mapping läuft jetzt über die
stabile `status_id`; jede Umbenennung ist 1:1 belegt, die Historie bleibt lückenlos.

**(b) Beim ANLEGEN einer Opportunity feuert Close kein `status_change`-Event.** Von 40 an einem Tag
angelegten Opportunities hatten **38** keines. → Ein Termin gilt jetzt auch dann als „gelegt", wenn
die Opportunity bereits mit dem Terminiert-Status angelegt wurde (Anfangsstatus = `old_status_id`
des ersten Events, sonst der aktuelle Status).

**Folge — Korrektur von §5:** Die dort berichtete Opportunity-Abdeckung von 2,3 % war ein
**Messfehler** (nur Statuswechsel gezählt). Tatsächlich werden Opportunities längst angelegt:

| | Juni | Juli | August |
|---|--:|--:|--:|
| Settings (QC) gelegt | 279 | 500 | 399 |
| Closings (SC) gelegt | 102 | 211 | 170 |

Damit entfällt To-Do 1 aus §7 (war bereits erfüllt). Der verbleibende Engpass ist allein das
**Nachtragen der Ausgänge**.

**Neues Belastbarkeits-Gate:** Die alte Kennzahl (Opportunity-Abdeckung gegen Lead-Ebene) ist
untauglich geworden — sie überschritt 100 %, seit für nahezu jeden Termin eine Opportunity
existiert. Sie ist ersetzt durch den **Anteil bewerteter Termine** (Ausgang nachgetragen):
Quote wird nur ausgewiesen bei ≥ 50 % bewertet und ≥ 10 bewertbaren Terminen.
Ist-Stand: Juli 59,4 % / 57,8 % → ausgewiesen (Settings 75,1 %, Closings 76,2 %);
Juni und August (41–48 %) → unterdrückt.

**Weitere Härtung:** Termine vor dem Backfill-Start werden verworfen (ihre Statushistorie ist nicht
gespiegelt, der Ausgang sähe fälschlich „offen" aus). Unbekannte `status_id` erscheinen im
Datenqualitäts-Panel, damit künftige Pipeline-Änderungen auffallen statt still zu brechen.

**Offen (an die Vertriebsleitung, Feedback v3):** Wertung von `QC Verschoben`, Bedeutung von
`QC=SC Ausstehend`, sowie ob die Felder `Setter`/`Closer` gepflegt werden (aktuell 4 bzw. 2 von 20).

---
*Methodik: read-only Läufe gegen die Close-API (Rev. 3 zusätzlich: Umbenennungs-Karte alt→neu per status_id, Anlage-vs-Wechsel-Analyse, Prototyp gegen echtes Postgres) (Erstbefund 25.08., Re-Check 31.08. inkl. Feld-/Auswahllisten, Status-Historie 01.06.–31.08. mit 1.033 Opportunity- und 8.744 Lead-Statuswechseln, Overlap-Analyse, Prototyp-Berechnung) sowie Auswertung eines Loom-Screencasts der Vertriebsleitung (32 Frames + Transkript). Kein Schreibzugriff.*
