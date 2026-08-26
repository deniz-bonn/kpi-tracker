# Close-API-Discovery (Phase 0) — Show-Rate-Tracking Opener/Setter

**Stand:** 2026-08-25 · **Modus:** read-only (nur GET, ein GET-only-Wrapper: `backend/src/utils/closeClient.js`) · **Key:** `CLOSE_API_KEY` (Railway/`backend/.env`, nie im Repo/Log).
**Zweck:** Feststellen, ob & wie die zwei Show-Rates (Opener: Settings stattgefunden ÷ gelegt; Setter: Sales Calls stattgefunden ÷ gelegt) aus Close berechenbar sind — als Fundament für die Umsetzungsentscheidung. **Keine Umsetzung ohne Go.**

## Kernbefund (TL;DR)

**Close ist grundsätzlich die richtige Quelle — aber die für die Show-Rates nötigen Daten werden heute NICHT in berechenbarer Form gepflegt.** Die passenden Strukturen existieren (Custom-Activity-Typen mit Feldern „Ergebnis des Calls" und „Quelle"), werden aber praktisch nicht genutzt; der einzige aktiv gepflegte Termin-Marker („Setting terminiert") trägt weder Ausgang noch Quelle. Zusätzlich zeigen **alle** Deal↔Close-Links im Tracker auf eine **andere Close-Organisation (Risem)**, die dieser Key nicht sieht.

→ **Phase-0-Verdikt:** Vor jedem Sync steht eine **Prozess-Entscheidung in Close** (welches Objekt markiert Setting/Sales-Call, mit Ausgang + Quelle) und die **Mehr-Org-Frage**. Ohne das würde der Tracker leere/uneindeutige Daten spiegeln. Der Sync selbst ist danach überschaubar.

## 1. Organisationen — mehrere Close-Instanzen bestätigt

- Der Key gehört zu **einer** Org: **fach.digital GmbH** (`orga_J6dLgd…`), API-User `deniz@fach-digital.de`. Ein Close-Key = eine Org.
- **Alle 155** NK-Deals mit Close-Lead-Link im `kommentar` (`app.close.com/lead/…`) gehören laut Tracker zu **Risem** — und **alle** liefern gegen diesen Key **HTTP 404** (Stichprobe DE vs. Risem: 0 auflösbar). Die Links zeigen also auf die **Risem-Close-Org**, nicht auf fach.digital.
- **Folge:** Es gibt ≥ 2 Close-Orgs (fach.digital + Risem; Morawitz offen). Die bestehende Deal↔Close-Verknüpfung im Tracker betrifft nur Risem. Der **deutsche** Funnel liegt in DIESER Org, ist aber aus `deals_nk` nicht verlinkt. Architektur muss **mehrere Keys/Orgs** vorsehen; ein Stichproben-Abgleich Deal↔Termin ist je Org getrennt zu denken.

## 2. Aktivitätslandschaft (repräsentativer August-Ausschnitt, jüngste ~12.000 Aktivitäten)

`_type`-Verteilung: **Call 6.332**, Note 2.217, LeadStatusChange 1.786, Created 756, TaskCompleted 631, OpportunityStatusChange 176, **CustomActivity 47**, SMS 31, Email 19, **Meeting 5**.

- **Meetings sind KEINE Quelle:** nur ~5 im Ausschnitt, 20 über alle Zeit. Settings/Sales-Calls werden nicht als Close-„Meeting"/Kalender-Objekt geführt. Der ursprüngliche Konzept-Ansatz „Meetings via Kalender-Sync" trägt hier nicht.
- **Calls dominieren** (≥ 8.000/Monat, ~85 % outbound = Kaltakquise). Das sind Roh-Dials, nicht die Termine mit Ausgang.

## 3. Custom-Activity-Typen — richtig designt, aber ungenutzt

Es existieren funnel-genaue Typen. Relevant:

| Typ | Feld „Ergebnis des Calls" | Feld „Quelle" | Instanzen (Ausschnitt) |
|---|---|---|---|
| **Setting** | ✅ vorhanden | ✅ vorhanden | **0** |
| **Setter Call** | ✅ vorhanden | ✅ vorhanden | **0** |
| **Closing Call** | ✅ vorhanden | — | **0** |
| **Setting Terminier (NEU)** | — | „Lead Quelle" + „Caller" | 0 |
| **Setting terminiert** | ❌ (nur „Notizen") | ❌ | **39** (von 47 CustomActivity) |

- Der **einzige aktiv genutzte** Termin-Marker ist **„Setting terminiert"** — Objekt trägt `lead_id`, `user_id`/`created_by`, `activity_at`, `date_created`, aber **nur ein leeres Freitext-„Notizen"-Feld**; **kein Ausgang, keine Quelle**. Im Fenster 20.–25.08. nur 3 Instanzen (alle von *Dominik Bous* angelegt) → **niedrige, uneinheitliche Nutzung**.
- Die reichen Typen mit „Ergebnis"+„Quelle" (Setting/Setter Call/Closing Call) sind **schemaseitig perfekt**, aber **nicht befüllt**.

## 4. Berechenbarkeit der Show-Rates HEUTE

| Baustein | Status | Detail |
|---|---|---|
| Opener — Settings **gelegt** (Nenner) | 🟡 teilweise | „Setting terminiert" ist attribuierbar (User) + datiert + Lead-verknüpft, aber sparsam/uneinheitlich |
| Opener — Settings **stattgefunden** (Zähler) | 🔴 fehlt | kein strukturierter Ausgang im genutzten Typ |
| Setter — Sales Calls **gelegt/stattgefunden** | 🔴 fehlt | „Closing Call"-Typ ungenutzt; Sales-Calls nicht als strukturierte Activity im Ausschnitt |
| **Quelle** (Dimension) | 🔴 fehlt | Lead-Feld „Quelle" zu 99,8 % leer (3/1.500), genutzter Aktivitätstyp hat kein Quelle-Feld |

**Fazit:** Beide Show-Rates sind aus dem Ist-Zustand **nicht sauber berechenbar** — v. a. der **Zähler (stattgefunden)** und die **Quelle** fehlen strukturell.

## 5. User-Zuordnung (Close-User ↔ `employees`)

- 19 aktive Close-User; `employees` hat **kein E-Mail-Feld** → **E-Mail-Auto-Match unmöglich**.
- Namens-Match (Ersatz): ~**9/19**; Schreibweisen weichen ab (z. B. Close „Marcel **Murciano**" vs. employees „Marcel **Muciano**"), einige Close-User sind Nicht-Personen („Cold Mail", „Probe Arbeiten2/3", leer).
- → **Explizite Mapping-Tabelle (Close-User-ID ↔ employee) mit Pflege-UI nötig**; unzuordenbare Termine gehören ins Daten-Qualitäts-Panel, nicht zur falschen Person.

## 6. Was wir für `termine` mappen würden — **sobald der Prozess steht**

- **Quelle-Objekt:** je Funnel-Schritt eine Custom-Activity (Setting → Sales Call/Closing Call) mit **gepflegtem** „Ergebnis des Calls" (→ `status`: stattgefunden/no_show/abgesagt/verschoben) und **„Quelle"**.
- **gelegt_von_employee_id:** `user_id`/`created_by` → `employees` via Mapping-Tabelle.
- **lead/kunde:** `lead_id`/`contact_id`. **datum_geplant:** `activity_at`. **synced_at/close_id:** Objekt-`id` + `date_updated` (für inkrementellen Sync).
- Sync-Weg: **`/activity/` mit Datumsfilter org-weit** funktioniert (inkrementell über `date_created`/`date_updated`); Custom-Activities lassen sich org-weit NICHT direkt filtern (Close verlangt dafür `lead_id`) → im Feed clientseitig auf `_type='CustomActivity'` + `custom_activity_type_id` filtern.

## 7. Offene Prozess-/Entscheidungsfragen (an Deniz)

1. **Welches Close-Objekt markiert künftig verbindlich (a) ein Setting und (b) einen Sales-Call — mit Ausgang und Quelle?** Optionen: (i) die reichen Typen „Setting"/„Closing Call" konsequent nutzen (Ergebnis+Quelle Pflicht), (ii) „Setting terminiert" um Ergebnis+Quelle erweitern, oder (iii) falls Termine faktisch in **Call-Dispositions** hängen: prüfen wir das als Quelle. *(Ohne diese Festlegung ist kein sinnvoller Sync möglich.)*
2. **Mehr-Org:** Bekommen wir separate Read-only-Keys für **Risem** (und ggf. **Morawitz**)? Und sollen die Deal↔Close-Links künftig auf die jeweils richtige Org zeigen?
3. **User-Mapping:** OK, eine Mapping-Tabelle Close-User ↔ employee zu pflegen (+ E-Mail-Feld an `employees` ergänzen, um Auto-Match zu ermöglichen)?
4. **Backfill-Grenze** (z. B. ab 01.07.2026) und ob Bonn-`activity_logs` parallel weiterlaufen (erst beweisen, dann umstellen).

## 8. Aufwand (Phase 1, NUR nach Prozess-Fix sinnvoll)

- GET-only-Wrapper: **fertig** (`closeClient.js`, read-only, Backoff, Paginierung).
- Danach: `termine`-Tabelle + Close-User-Mapping-Tabelle + Nightly-Inkrement-Sync (`/activity/` date-gefiltert, je Org-Key) + Auswertungs-Bereich „Show Rates (Close)" + **Daten-Qualitäts-Panel** (Termine ohne User/Quelle/Ausgang). Grobschätzung **mehrere Tage** — aber der Nutzen entsteht **erst**, wenn Close Ausgang + Quelle je Termin trägt. Bis dahin wäre die Show-Rate nahezu leer.

---
*Methodik: 3 read-only Läufe gegen die Close-API (Objektlandschaft, Custom-Activity-Sweep August ~12k, Org-Abgleich der Deal-Links, Feld-Verteilungen). Kein Schreibzugriff. Zahlen sind repräsentative Ausschnitte, keine Monats-Totale.*
