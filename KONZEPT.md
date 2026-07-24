# KPI-Tracker — Konzept & Struktur

> Vertriebs-Tracking-System der fach.digital GmbH. Dieses Dokument fasst die gesamte
> Struktur, das Datenmodell, alle KPI-Definitionen und Geschäftsregeln zusammen.
> Stand: 22. Juli 2026.

---

## 1. Überblick & Technik

| | |
|---|---|
| **Zweck** | Tracking von Auftragseingang (AE), Deals und Vertriebs-KPIs über drei Geschäftsbereiche: Neukunden (NK), Bestandskunden (BK), Verlängerungen (VL) |
| **Frontend** | React (Vite), TailwindCSS, React Query, React Router |
| **Backend** | Node.js / Express, REST-API unter `/api/*` |
| **Datenbank** | PostgreSQL auf Railway (Produktion), SQLite lokal — Migrationen doppelt gepflegt (`NNN_name.pg.sql` + `NNN_name.sql`), laufen automatisch beim Deploy |
| **E-Mail** | Resend (bevorzugt) oder SMTP-Fallback |
| **Deployment** | Railway, Auto-Deploy bei Git-Push auf `main` |
| **Standorte** | Bonn, Braunschweig, Österreich, Schweiz |

---

## 2. Bereiche (Navigation)

| Route | Seite | Inhalt |
|---|---|---|
| `/dashboard` | Dashboard | AE-Gesamtübersicht nach Standort/Bereich, Monatsziel, Ziel/Differenz (nur Admin+VL sichtbar) |
| `/neukunden` | Neukunden (NK) | NK-Deals (Angebote), Gesamt-KPIs, Abschlussquote nach Closer / Setter / Opener (aufklappbar) / Standortvergleich (aufklappbar) |
| `/bestandskunden` | Bestandskunden (BK) | BK-Deals, KPIs nach KAM, Daniel-Termine/Win-Rate, Annahmequoten-Ampel |
| `/verlaengerungen` | Verlängerungen (VL) | VL-Deals, KPIs nach KAM (sortiert nach AE), Churn-Rate nach Verlängerungs-Nr. (aufklappbar), Zeitmodus Monat/Zeitraum/Alle |
| `/kuendigungen` | Kündigungen — Up-Sale Potenzial | Gekündigte VL-Kunden mit Up-Sale-Tracking, wegfallender AE |
| `/auswertung` | Auswertung | Übergreifende Auswertungen |
| `/kpi-mitarbeiter` | KPI Mitarbeiter (alt) | Ältere KPI-Ansicht |
| `/kpi-mitarbeiter-beta` | KPI Mitarbeiter Beta | Tägliches Activity-Tracking der Sales-Mitarbeiter: Eingabemaske + Auswertung (Feature-Flag-gesteuert) |
| `/mitarbeiter` | Mitarbeiter | Mitarbeiterverwaltung (employees) |
| `/einstellungen` | Einstellungen | Benutzer, Companies, Monatsziele, Passwort, KPI-Sichtbarkeit, Zugriffssteuerung (Feature-Flags), Online-Users |

---

## 3. Datenmodell (wichtigste Tabellen)

- **companies** — Mandanten (fach.digital u.a.)
- **employees** — Vertriebsmitarbeiter: `name, company_id, rolle, aktiv, standort, show_in_kpi`
  - Rollen: `Opener`, `Setter`, `NKV-Closer`, `KAM`, `Multi`, `Multi BS`, `Closer-KAM`
  - **Regel: eine Person = genau ein Datensatz** (Doppelrollen über `Multi`/`Closer-KAM`, niemals Duplikate anlegen)
- **users** — Login-Benutzer: `email, name, role, employee_id, active, invite_token, reset_token`
  - Rollen: `superadmin`, `admin`, `vertriebsleitung`, `nk_vertrieb`, `bk_vertrieb`, `backoffice`
- **deals_nk** — Neukunden-Angebote: `datum, monat` (Angebotsmonat), `kunde, quelle, closer_id, opener_id, setter_id, angebotswert, ae_wert, status (Offen/Gewonnen/Verloren), gewonnen_datum, gewonnen_monat`
- **deals_bk** — Bestandskunden-Deals: analog, mit `kam_id`, Auto-VL, Abgerechnet, Termine mit Daniel
- **deals_vl** — Verlängerungen: `kam_id, angebotswert (möglicher AE), ae_wert (realisierter AE), laufzeit_monate, wie_vielt_verlaengerung, status` + Kündigungsfelder (`gekuendigt_am, auslaufend_am, weitergeben_an_vertrieb, ansprechpartner, telefon, email_kontakt, upsale_*`)
- **upsale_deals** — Up-Sale-Angebote zu gekündigten VL-Kunden: `angebotsvolumen, status, angenommenes_volumen`
- **activity_logs** — tägliche KPI-Eingaben pro Mitarbeiter (UNIQUE pro `employee_id + datum`), Felder siehe Abschnitt 6
- **inbound_daily** — täglich eingehende Leads: `inbound_mail/fax/ad`, `terminiert_mail/fax/ad` (keine Standort-Dimension)
- **ae_gesamt_monthly** — **autoritative Quelle** für AE pro Monat: `nk_bonn/bs/at/ch (_ae/_anz), nk_gesamt, bk_gesamt, vl_gesamt, gesamt`
- **monthly_targets** — Monatsziel AE gesamt (`ziel_gesamt`)
- **feature_flags** — Zugriffssteuerung (z.B. `kpi_beta`, `backup` pro Benutzer)
- **audit_logs, login_logs** — Protokollierung

---

## 4. Rollen & Sichtbarkeit

| User-Rolle | Rechte |
|---|---|
| `superadmin` | Alles inkl. KPI-Sichtbarkeit, Online-Users, Feature-Flags |
| `admin` | Benutzerverwaltung, alle Bereiche, Ziel/Differenz im Dashboard |
| `vertriebsleitung` | Alle Bereiche, Ziel/Differenz im Dashboard |
| `nk_vertrieb` | **Sieht im NK-Bereich ALLE Deals** (alle Standorte/Mitarbeiter, gleiche Ansicht wie Vertriebsleitung) |
| `bk_vertrieb` | Sieht im NK-Bereich nur eigene Deals (closer_id = eigener Mitarbeiter) |
| `backoffice` | Erweiterte Sicht (canSeeAll) |

Weitere Regeln:
- **Ziel + Differenz** im Dashboard sehen nur `superadmin`, `admin`, `vertriebsleitung`.
- Benutzerverwaltung: Einladung per Link, „PW setzen" (Admin tippt Passwort) und „Reset-Link" (24h gültiger Selbstbedienungs-Link).

---

## 5. KPI-Definitionen (verbindliche Formeln)

| KPI | Formel | Soll |
|---|---|---|
| **Lead-Terminierungsquote** | `terminiert (inbound_daily) / eingegangene Leads (inbound_daily)` | 45 % |
| **Terminierungsquote (E→T)** | `entscheider_terminiert / entscheider_erreicht` | — |
| **Show-Rate Setting** | `settings_stattgefunden / settings_geplant` | 80 % |
| **Durchstellungsquote** | `beratung_vereinbart / settings_stattgefunden` — **NICHT** beratungen_stattgefunden! | 40 % |
| **Show-Rate Closing (Sales)** | `beratungen_stattgefunden / beratungen_geplant` | 80 % |
| **Closing-Rate** | `NK gewonnen / NK Angebote` (deals_nk des Monats) | 50 % |
| **Churn-Rate (VL)** | `(Möglich − Realisiert) / Möglich` — offene zählen als (noch) nicht realisiert | — |

**Begriffsdefinitionen („gelegt"):**
- **Sales Calls gelegt** = `beratung_vereinbart + beratung_vereinbart_direkt` (vereinbarte Beratungsgespräche, Opener-Eingabe — nicht die stattgefundenen!)
- **Settings gelegt/terminiert** = `entscheider_terminiert`

**Ziele:**
- Tagesziele: **12 Sales Calls**, **37 Settings** (terminiert), täglich
- Monatsziele: **fix 276 Sales Calls / 740 Settings** — gelten dauerhaft für jeden Monat, werden NICHT aus Arbeitstagen abgeleitet
- Pace („Soll bis heute") = Tagesziel × vergangene Arbeitstage (Mo–Fr) des Monats
- AE-Monatsziel gesamt: aus `monthly_targets` (Settings-Bereich pflegbar)

**Ampel Annahmequote (BK):** < 25 % rot · 25–33 % gelb · > 33 % grün (0 Angebote = grau)

---

## 6. KPI Mitarbeiter Beta (Herzstück)

### Eingabemaske (pro Mitarbeiter & Tag, activity_logs)

**Block 1 — 📞 Entscheider & Terminierung** (Opener/Setter/Multi):
- `entscheider_erreicht`
- *Terminiert (→ geplantes Setting):* `entscheider_terminiert`, davon `terminiert_cold_calls` / `terminiert_inbound`
- *Direkt gesetzt (Setting sofort):* `settings_direkt`, daraus `beratung_vereinbart_direkt`, `follow_up_direkt`, `unqualifiziert_direkt`

**Block 2 — 📅 Settings (geplant/terminiert)**:
- `settings_geplant`, `settings_stattgefunden`
- Ergebnis: `unqualifiziert`, `follow_up`, `beratung_vereinbart`
- Nicht stattgefunden: `setting_abgesagt`, `setting_verschoben`, `nicht_erreicht`

**Block 3 — 🤝 Beratungsgespräche** (Closer/Multi):
- `beratungen_geplant`, `beratungen_stattgefunden`, `beratungen_verschoben`, `beratungen_no_show`
- `beratungen_direkter_close`, `beratungen_follow_up_cc2`, `beratungen_unqualifiziert`, `beratungen_kein_close`

Zusätzlich: **Inbound-Leads-Erfassung** (inbound_daily, täglich, ohne Standortbezug).

### Auswertung
- **Zeitbasis:** Tagesbasis / Wochenbasis (Mo–So, KW-Anzeige) / Monatsbasis + Standortfilter
- **Dashboard-Tab:** Daily-Pace-Block (SC & Settings terminiert vs. Tagesziel mit Fortschrittsbalken, Show-Rate, Durchstellungsquote), Soll-Abweichungstabelle (Ist vs. Soll in pp, mit Absolutwerten n/d), Sales-Funnel, Übersicht pro Mitarbeiter (Funnel-Gruppen-Header: Entscheider / Settings / Beratungsgespräche, mit Tooltips + Legende)
- **Setting-Tab:** u.a. Beratungen gelegt gesamt / nach geplantem Setting / nach direktem Setting
- **Copy-Text-Funktion** (WhatsApp/Slack-Format): Tagesziel, Monatsziel (fixe Ziele), Pace, Show-Rates & Durchstellungsquote heute + kumuliert **bis zum Stichtag**, Sales-Block. Kumulierte Werte zählen nur bis zum gewählten Datum.
- **CSV-Export** (Excel-kompatibel mit BOM): Opening-, Setting-, Closing-Zahlen

---

## 7. AE-Logik (Auftragseingang)

- **`ae_gesamt_monthly` ist die autoritative Quelle** fürs Dashboard; existiert keine Monatszeile, rechnet das Dashboard live aus den Deals.
- Beim Setzen eines NK-Deals auf „Gewonnen" wird der AE **nach Standort des Closers** in die Spalte `nk_bonn/bs/at/ch` des `gewonnen_monat` gebucht. Kein gültiger Standort → keine Buchung (Fehlerquelle!).
- **Ein Deal zählt im Monat des Gewinns** (`gewonnen_monat`), nicht im Angebotsmonat — Juni-Angebot, im Juli gewonnen → Juli-AE.
- BK-Bereich: Standortfilter fasst **Bonn + Braunschweig zusammen** („Bonn / Braunschweig").

---

## 8. Kündigungen & Up-Sale

- Verlorene VL-Deals mit `weitergeben_an_vertrieb = 'Ja'` erscheinen im Kündigungen-Tab als Up-Sale-Potenzial.
- KPIs: Soll-Potenzial, Terminiert, Angebot, Angenommen (Anzahl + €), **Wegfallender AE** (Summe `ae_wert` der Kündigungen, brutto + netto nach angenommenen Up-Sales).
- Up-Sale-Deals je Kunde mit Angebotsvolumen/Status/angenommenem Volumen.

## 9. VL-Auswertung

- KPIs nach KAM, sortiert nach realisiertem AE (bester oben).
- **Churn-Rate nach Verlängerungs-Nr.** (1./2./3. …): Möglich / Realisiert / Offen / Verloren / Churn / realisierter AE (standardmäßig eingeklappt).
- Zeitmodus: einzelner Monat / **Zeitraum (Von–Bis-Monat)** / alle Monate.

---

## 10. Automatisierung (Cron, Europe/Berlin)

| Zeit | Was |
|---|---|
| **22:00** | Dashboard-Mail (AE nach Standort/Bereich, heutige Abschlüsse, Gesamt + Monatsziel mit Fortschrittsbalken) **und** KPI-Mail |
| **23:00** | Auto-Backup (JSON) + Backup-Mail |

**KPI-Mail (22:00)** — bezieht sich **nur auf Standort Bonn** (per Env `KPI_REPORT_STANDORT` änderbar):
- Betreff mit Tagesstand: `📈 KPI Bonn – DATUM | SC x/12 · Settings y/37`
- 🎯 Tagesziele (SC gelegt, Settings terminiert) mit Fortschrittsbalken
- 📈 Monatsziele & Pace (Ist / Soll bis heute / Abweichung / fixes Monatsziel / Erreicht %)
- ⚖️ Quoten vs. Soll (Monat kumuliert, mit Absolutwerten)
- Tageszahlen + Tabelle pro Mitarbeiter
- Ausnahme: Lead-Terminierungsquote ungefiltert (inbound_daily hat keinen Standort)

Test-Auslösung: `POST /api/admin/test-daily-report` (Admin/VL).

---

## 11. Konventionen & bekannte Fallstricke

1. **Migrationen immer doppelt** anlegen (`.pg.sql` für Railway-Postgres, `.sql` für SQLite lokal); Postgres-Booleans brauchen `TRUE/FALSE`, SQLite `1/0`. Läuft statementweise über den Pool → keine TEMP-Tabellen.
2. **Keine doppelten Mitarbeiter anlegen** — führt zu doppelten Zeilen in Auswertungen und fehlgeleiteten AE-Buchungen (Migration 071/072 hat Altfälle bereinigt).
3. `datum` kommt aus Postgres als ISO-Timestamp → im Frontend immer auf `YYYY-MM-DD` normalisieren (`String(d).slice(0,10)`), bevor verglichen wird.
4. Monatsziele 276/740 sind **fix** — nicht „reparieren" auf Arbeitstage-Basis.
5. Durchstellungsquote **immer** `beratung_vereinbart / settings_stattgefunden`.
6. `wie_vielt_verlaengerung` sollte bei allen VL-Deals gepflegt sein (sonst Zeile „Ohne Angabe" in der Churn-Tabelle); ungültige Werte (< 1) werden ignoriert.
7. E-Mail-Empfänger über Env `REPORT_EMAIL` (kommagetrennt); Versand via `RESEND_API_KEY` oder SMTP-Variablen.
