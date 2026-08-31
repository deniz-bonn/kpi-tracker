# Close-API-Discovery — Show-Rate-Tracking Opener/Setter

**Stand:** 2026-08-31 (Re-Check) · Erstbefund 2026-08-25 · **Modus:** read-only (nur GET über `backend/src/utils/closeClient.js`) · **Key:** `CLOSE_API_KEY` (Railway/`backend/.env`, nie im Repo/Log).
**Zweck:** Feststellen, ob & wie die zwei Show-Rates (Opener: Settings stattgefunden ÷ gelegt; Setter: Sales Calls stattgefunden ÷ gelegt) aus Close berechenbar sind. **Phase 1 noch nicht umgesetzt.**

## Kernbefund (TL;DR, Stand 31.08.)

**Die Datenstruktur in Close ist für Show-Rates bereits perfekt — sie wird nur nicht benutzt.** Die Custom-Activity-Typen *Setting*, *Setter Call* und *Closing Call* haben „Ergebnis des Calls" als **Pflichtfeld** mit exakt den Auswahlwerten, die eine Show-Rate braucht (No-Show / Abgesagt / Verschoben vs. stattgefunden). Im Re-Check-Fenster **24.08.–31.08.** (10.059 Aktivitäten) gab es aber nur **23 Custom-Activities**: 22× *Setting terminiert* (feldlos) und **1×** *Setting*. Gegenüber dem Erstbefund (25.08.) also **unverändert**.

→ **Verdikt:** Kein Technik-, sondern ein **Nutzungsproblem**. Sobald das Team die reichen Typen verwendet, sind beide Show-Rates ohne Close-Umbau berechenbar. Die eine echte Design-Lücke ist die **Opener-Attribution** (siehe §5).

**Entschieden (31.08., Deniz):** Verbindlicher Marker werden die **reichen Typen** — *Setting* / *Setter Call* / *Closing Call*, mit Ergebnis (+ Quelle) als Pflicht.

## 1. Organisationen — Mehr-Org bestätigt, unverändert

- Der Key gehört zu **einer** Org: **fach.digital GmbH** (`orga_J6dLgd…`), API-User `deniz@fach-digital.de`. Ein Close-Key = eine Org.
- **Alle 155** NK-Deals mit Close-Lead-Link im `kommentar` gehören laut Tracker zu **Risem** — und liefern gegen diesen Key **HTTP 404**. Der **deutsche** Funnel liegt in DIESER Org, ist aber aus `deals_nk` nicht verlinkt.
- **Folge:** Architektur muss **mehrere Keys/Orgs** vorsehen (fach.digital + Risem, Morawitz offen). → offene Frage B.

## 2. Aktivitätslandschaft (Re-Check 24.08.–31.08., 10.059 Aktivitäten)

`Call` 4.678 · `LeadStatusChange` 1.656 · `Email` 1.315 · `Note` 1.145 · `Created` 778 · `TaskCompleted` 358 · `OpportunityStatusChange` 91 · **`CustomActivity` 23** · `SMS` 13 · **`Meeting` 2**

- **Meetings sind keine Quelle** (2 im Fenster) — der Kalender-Sync-Ansatz aus dem Ursprungskonzept trägt nicht. Bestätigt.
- **Call-Dispositions sind zu 99,9 % gefüllt** (4.675/4.678: `answered` 3.062, `no-answer` 1.235, `busy` 115, `error` 104, `vm-answer` 81, `blocked` 50, `vm-left` 28). **Aber:** das sind *Telefonie*-Ergebnisse (wurde abgehoben), **keine Termin-Ausgänge**. Als Show-Rate-Quelle **untauglich**; brauchbar wäre daraus höchstens eine separate KPI „Erreichbarkeitsquote je Opener".

## 3. Custom-Activity-Typen — Schema ist show-rate-fähig

10 Typen existieren. `*` = Pflichtfeld. Instanzen = Re-Check-Fenster.

| Typ | „Ergebnis"-Feld | „Quelle"-Feld | Instanzen |
|---|---|---|--:|
| **Setting** | ✅ *Ergebnis des Calls* | ✅ *Quelle* (nicht Pflicht) | **1** |
| **Setter Call** | ✅ *Ergebnis des Calls* | ✅ *Quelle* **(Pflicht)** | 0 |
| **Closing Call** | ✅ *Ergebnis des Calls* | — kein Quelle-Feld | 0 |
| **Closing Folgetermine** | ✅ *Ergebnis* + *Art* (CC2/Onboarding) | — | 0 |
| **Follow-Up** | ✅ *Ergebnis des Calls* + *Setting oder Closing?* | — | 0 |
| **Setting Terminier (NEU)** | — | ✅ *Lead Quelle* (Pflicht) + ***Caller*** | 0 |
| **Setting terminiert** | ❌ nur *Notizen* | ❌ | **22** (alle von *Dominik Bous*) |
| **Setting terminiert (Marketing)** | ❌ nur *Notiz* | ❌ | 0 |
| Entscheider erreicht / Outreach Setting | (Prozessfelder, kein Termin-Ausgang) | — | 0 |

**Auswahlwerte (die Basis des Status-Mappings):**

- **Setting / Setter Call → *Ergebnis des Calls*:** `Abgesagt` · `CC terminiert` · `No-Show` · `Qualifiziert` · `Unqualifiziert` · `Verschoben`
- **Closing Call → *Ergebnis des Calls*:** `Abgesagt` · `CC2 terminiert` · `Follow-Up` · `Gewonnen` · `No-Show` · `Onboarding terminiert` · `Schriftliches Angebot` · `Verbales Angebot` · `Unqualifiziert` · `Verloren` · `Verschoben`
- **Quelle:** *Setter Call:* `Cold Call` · `Cold Mail` · `Empfehlung` · `Fax` · `Messe` · `Sonstiger Inbound` · `Sonstiger Outbound` — *Setting:* dieselbe Liste **ohne** `Messe`/`Sonstiger Outbound` ⚠️ (inkonsistent, siehe To-Dos)

## 4. Status-Mapping für `termine.status` — implementierungsreif

| Close-Ergebnis | `termine.status` | zählt in Show-Rate |
|---|---|---|
| `Qualifiziert`, `Unqualifiziert`, `CC terminiert` | `stattgefunden` | **Zähler + Nenner** |
| `CC2 terminiert`, `Onboarding terminiert`, `Verbales/Schriftliches Angebot`, `Gewonnen`, `Verloren`, `Follow-Up` (nur Closing Call) | `stattgefunden` | **Zähler + Nenner** |
| `No-Show` | `no_show` | nur Nenner |
| `Abgesagt` | `abgesagt` | nur Nenner |
| `Verschoben` | `verschoben` | nur Nenner (Folge-Termin separat) |

**Show-Rate** = `stattgefunden` ÷ (alle Termine des Zeitraums). Typ **Follow-Up** ist **kein Termin** (Werte: Kein Bedarf / Nicht erreicht / Neuer Meeting-Termin …) → aus den Show-Rates **ausschließen**.

## 5. ⚠️ Die verbleibende echte Lücke: Opener-Attribution

Für den **Setter** ist die Zuordnung gelöst: Der Setter dokumentiert seinen *Setter Call* selbst → `user_id` = Setter. Setter-Show-Rate = *Closing Calls stattgefunden* ÷ *Setter Calls mit Ergebnis `CC terminiert`*.

Für den **Opener** nicht: Die *Setting*-Activity wird von dem dokumentiert, der den Termin **durchführt** (Setter/Closer) — nicht von dem, der ihn **gelegt** hat. Der Typ *Setting* hat **kein** Opener-/Caller-Feld. Nur *Setting Terminier (NEU)* hat ein **`Caller`**-Feld (0 Instanzen).

**Entschieden (31.08., Deniz): Weg (A)** — Feld **„Opener"** am Typ *Setting* ergänzen (Pflicht). Ein Objekt trägt dann Ausgang **und** Opener; die Show-Rate kommt aus einer Quelle, kein Pairing, robust bei Verschiebungen.
*(Verworfen: Weg (B) — *Setting Terminier (NEU)* als Nenner mit *Setting* als Zähler paaren; bräuchte zwei disziplinierte Buchungen je Termin und ist bei Verschiebungen/Mehrfachterminen fehleranfällig.)*

> ### ⚠️ Feldtyp entscheidet über die Datenqualität
> Das bestehende `Caller`-Feld an *Setting Terminier (NEU)* ist **`type=text`** — **Freitext**. So darf das neue Feld **nicht** angelegt werden: Freitext produziert Namensvarianten und Tippfehler (im Account belegt: Close *Murciano* vs. Tracker *Muciano*, Zweitkonto „Drake aus Godesberg") und macht die Opener-Zuordnung genauso kaputt wie die Mitarbeiter-Dublette #55/#70.
>
> **Vorgabe:** Feldtyp **`User`** (liefert eine Close-User-ID → deterministisch über `close_user_map` auflösbar). Falls im Account nicht verfügbar: **`choices`** mit fester Opener-Liste. **Niemals `text`.**
> *(Im Account bisher genutzte Typen: `text`, `choices`, `date`, `richtextarea`, `contact` — ein `User`-Feld gibt es noch nicht; `contact` ist die Lead-Seite und hier falsch.)*

## 6. User-Zuordnung — billiger als gedacht

**Wichtig:** `employees` hat kein E-Mail-Feld, **aber `users` (Login) hat eins** und ist über `users.employee_id` mit `employees` verknüpft. Die Brücke **Close-User-E-Mail → `users.email` → `users.employee_id` → `employees`** existiert also schon — **kein Schema-Umbau an `employees` nötig** (korrigiert den Erstbefund).

Von 20 Close-Usern: **9 exakter Namens-Match**, **6 über `users.email`** auflösbar (Vereinigung ≈ 12). Nicht auflösbar bzw. Datenmüll:

| Close-User | Problem |
|---|---|
| *Drake aus Godesberg* `<c.naekel@hioffice.com>` | **Zweitkonto von Clemens Näkel** → splittet seine Zahlen |
| ⟨ohne Namen⟩ `<mikail.kotaman@fach-digial.de>` | Tippfehler-Domain, **Dublette** zu Mikail Kotaman |
| *Cold Mail*, *Probe Arbeiten2/3* | Funktions-/Sammelkonten, keine Personen |
| Andreas Vasie-Alexandru, Marc Rox, Zachary Churney, Zaid Chouari | reale Personen, **fehlen in `employees`** |
| Marcel *Murciano* vs. employees *Muciano* | Schreibfehler im Tracker (1 Zeichen) |

→ **Explizite Mapping-Tabelle** bleibt nötig (Auto-Vorschlag via E-Mail/Name + manuelle Pflege), plus **Daten-Qualitäts-Panel** für unzuordenbare Termine. Die Close-Dubletten sind derselbe Fehlertyp wie die Tracker-Dublette #55/#70 — Personen-Attribution braucht saubere Identitäten.

## 7. To-Dos in Close — Voraussetzung für Phase 1

Reihenfolge bewusst so: erst Feld anlegen (1), dann den falschen Weg schließen (2), sonst buchen die Leute weiter ins Leere.

| # | To-Do | Warum |
|--:|---|---|
| 1 | **Feld „Opener" am Typ *Setting*** anlegen — **Pflicht**, Typ **`User`** (Fallback `choices`, **nie `text`**) | löst die Attributionslücke §5 |
| 2 | ***Setting terminiert*** + ***Setting terminiert (Marketing)*** **stilllegen** | dorthin laufen heute 22 wertlose Buchungen/Woche |
| 3 | ***Quelle* am Typ *Setting* auf Pflicht** + Liste an *Setter Call* angleichen (`Messe`, `Sonstiger Outbound` fehlen) | Quelle-Dimension der Opener-Show-Rate |
| 4 | *Setting Terminier (NEU)* klären: stilllegen oder in *Setting* aufgehen lassen | sonst zwei konkurrierende Wege |
| 5 | Close-User bereinigen: *Drake aus Godesberg* (= Clemens Näkel) und Tippfehler-Konto `fach-digial.de` (= Mikail Kotaman) deaktivieren, Sammelkonten kennzeichnen | sonst splittet die Personen-Attribution |
| 6 | Team briefen: jeder Termin wird als *Setting* / *Setter Call* / *Closing Call* gebucht | Adoption ist der eigentliche Engpass |

### Readiness-Check — wann Phase 1 startet

Phase 1 beginnt, wenn ein read-only Lauf über **14 zusammenhängende Tage** zeigt:
- *Setting*-Instanzen ≳ Zahl der bisherigen *Setting terminiert*-Buchungen (~20/Woche), *Setting terminiert* nahe **0**
- **Ergebnis** zu ~100 % gefüllt (ist Pflichtfeld → automatisch), **Opener** zu ~100 % gefüllt und auflösbar
- *Closing Call*-Instanzen vorhanden (sonst keine Setter-Show-Rate)
- ≥ 2 unterschiedliche Ersteller je Typ (kein Einzelkämpfer-Artefakt wie heute: 22/22 von einer Person)

## 8. Offene Entscheidungen (Rest)

| | Frage | Status |
|---|---|---|
| ~~A~~ | Verbindlicher Marker | ✅ **entschieden: reiche Typen** (*Setting* / *Setter Call* / *Closing Call*) |
| ~~C~~ | Opener-Attribution | ✅ **entschieden: Weg (A)** — Pflichtfeld „Opener" am Typ *Setting*, Typ `User` |
| ~~B~~ | Mehr-Org-Scope | ✅ **entschieden: Phase 1 = nur Org fach.digital.** Risem/Morawitz später als **zweiter Key** — Sync deshalb von Anfang an **je Org-Key parametrisieren** (kein Hardcoding einer Org), aber nur einen Key betreiben |
| ~~D₁~~ | Parallellauf | ✅ **entschieden: Beta-Board / `activity_logs` bleiben unangetastet** und dienen als **Referenz zum Abgleich**. Keine Umstellung, bevor die Close-Zahlen bewiesen sind |
| **D₂** | **Backfill-Grenze** (z. B. ab 01.07.2026 oder erst ab Close-Umstellung) | offen — **blockiert Phase 1 nicht** (Config-Wert). Hinweis: Ein Backfill *vor* der Umstellung liefert fast nur Leerdaten, weil die reichen Typen bis 31.08. praktisch ungenutzt waren |
| **E** | **UI-Ort:** eigener Bereich vs. Erweiterung des Beta-Boards | **bewusst aufgeschoben bis nach dem Readiness-Check.** Tendenz: **eigener Bereich „Show Rates (Close)"** hinter **Feature-Flag** (`show_rates_close`) mit **Einzelnutzer-Freischaltung** (Infrastruktur steht seit Migration 099, `feature_flag_users`) → kontrollierter Rollout an einzelne Personen, ohne einer ganzen Rolle etwas zu öffnen. Beta-Board bleibt daneben als Parallellauf-Referenz |

## 9. Phase 1 — Umsetzungsplan (**gestartet wird erst nach §7**, Entscheidung 31.08.)

Reihenfolge, sobald der Readiness-Check grün ist:

1. **`termine`-Tabelle** + **`close_user_map`** (Close-User ↔ employee, Auto-Vorschlag via `users.email`, manuelle Pflege-UI).
2. **Nightly Inkrement-Sync**: `/activity/` mit `date_created`/`date_updated`-Filter (org-weit möglich), clientseitig auf `_type='CustomActivity'` + Typ-ID filtern (Close erlaubt org-weites Custom-Activity-Listing nicht). Idempotent über Close-Objekt-`id`. **Von Anfang an je Org-Key parametrisiert**, betrieben zunächst nur mit dem fach.digital-Key (Entscheidung B).
3. **Daten-Qualitäts-Panel**: Termine ohne Ausgang/Quelle/zuordenbaren User, je Person — macht die Lücke sichtbar und **treibt die Umstellung**.
4. **Bereich „Show Rates (Close)"** hinter Feature-Flag `show_rates_close` mit Einzelnutzer-Freischaltung (Entscheidung E): Opener-/Setter-Show-Rate je Monat/Person/Quelle, sobald (1)–(3) Daten liefern. Der endgültige UI-Ort wird erst nach dem Readiness-Check final entschieden.
5. **Abgleich gegen das Beta-Board** (`activity_logs`) als Parallellauf-Referenz — erst wenn die Close-Zahlen plausibel sind, wird über eine Umstellung gesprochen.

**Technisch bereits fertig:** GET-only-Wrapper (`closeClient.js` — Backoff, Paginierung, `Object.freeze`, kein POST/PUT/DELETE vorhanden). Aufwand (1)–(5): mehrere Tage.

## 10. Ablauf & Zuständigkeit (Stand 31.08.)

**Im Code passiert bis auf Weiteres nichts.** Reihenfolge:

1. **Deniz:** Close-To-Dos 1–6 aus §7 umsetzen und Team briefen → meldet, sobald live.
2. **Dann +14 Tage:** read-only **Readiness-Check** (§7) — Skript-Muster: Sweep `/activity/` über das Fenster, Custom-Activities je Typ, Füllquote *Ergebnis*/*Quelle*/*Opener*, Ersteller-Verteilung.
3. **Erst wenn grün:** Phase 1 nach §9 bauen. Ist er rot, wird nachgebrieft statt gebaut — ein Sync auf ungepflegte Daten erzeugt nur ein leeres Dashboard.

---
*Methodik: read-only Läufe gegen die Close-API — Erstbefund 25.08. (Objektlandschaft, August-Sweep ~12k, Org-Abgleich der Deal-Links, Feldverteilungen); Re-Check 31.08. (Sweep 24.08.–31.08. mit 10.059 Aktivitäten, Typ-/Felddefinitionen inkl. Auswahllisten, Dispositions-Gegenprobe, User-Abgleich gegen Prod-Backup). Kein Schreibzugriff.*
