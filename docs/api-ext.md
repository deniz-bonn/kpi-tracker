# Externe API: Verlängerungen (v1)

Mit dieser Schnittstelle können Skripte Verlängerungen im KPI-Tracker suchen, auf Dubletten prüfen, anlegen und ändern. Ein Beispiel ist der HubSpot-Sync.

Geschrieben wird über dieselbe Logik wie im Formular des Trackers. Es gelten dieselben Pflichtfelder, dieselbe Sperre für Datumsangaben in der Zukunft und dieselbe Buchung von Auftragseingang und Provision. Im Änderungsprotokoll steht als Akteur `API: <Token-Name>`.

## Zugang

- **Basis-URL:** `https://kpi-tracker-production-8cd5.up.railway.app/api/ext/v1`
- **Token:** Bei jedem Aufruf im Header mitschicken: `Authorization: Bearer kpt_…`
  - Ein Superadmin legt das Token an unter *Einstellungen → API-Tokens*.
  - Das Token wird nur einmal angezeigt. Bewahre es auf wie ein Passwort.
  - Wird ein Token widerrufen, gibt es ab sofort 401.
- **Rechte (Scopes):**
  - `vl:read` erlaubt das Lesen.
  - `vl:write` erlaubt Anlegen und Ändern.
- **Standort-Scope:** Ein Token kann auf Standorte beschränkt sein. Der Standort einer Verlängerung ist der ihres KAM.
  - Deals außerhalb des Scopes sind unsichtbar und antworten mit 404.
  - Ein Token ohne Beschränkung sieht alle Standorte.
- **Rate-Limit:** 60 Anfragen pro Minute je Token. Danach kommt `429` mit dem Header `Retry-After` (Sekunden).
- **Format:** JSON in UTF-8. Datumsangaben als `YYYY-MM-DD`, Monate als `YYYY-MM`.

Die folgenden Beispiele setzen voraus:

```bash
export KPI="https://kpi-tracker-production-8cd5.up.railway.app/api/ext/v1"
export TOKEN="kpt_…"
```

## Fachliche Regeln, die das Skript kennen muss

- **VL-Monat:** Eine Verlängerung gehört in den Monat ihres *spätesten Kündigungsdatums*.
  - Fehlt `monat`, leitet die API ihn aus `ende_kuendigungsfrist` ab.
  - Weicht ein mitgeschickter Monat davon ab, kommt ein Hinweis, aber kein Fehler.
- **`kundennummer` ist die HubSpot Company ID.** Bitte immer mitschicken. Nur so ist der Dublettenabgleich exakt.
- **`kam_id` ist Pflicht.** Ohne KAM fällt ein Deal aus jeder Standort-Auswertung. Die IDs liefert `GET /kams`, mit E-Mail zum Abgleich mit dem HubSpot-Owner.
- **`company_id` kommt aus `GET /companies`.** In Braunschweig gibt es zwei: HiOffice Works und HiOffice Care.
- **Erlaubte Status:** `Offen`, `Gewonnen`, `Verloren`.
  - „Umgestellt“, also Dauer-RaaS, bleibt ein Schritt im Formular.
  - Löschen geht über die API nicht.
- **`gewonnen_datum`** ist höchstens heute. Es ist der Tag der Zusage bzw. der Tag, an dem die Kündigungsfrist verstrichen ist.

### Pflichtfelder (wie im Formular)

| Status | Pflicht |
|---|---|
| immer | `datum`, `monat`, `company_id`, `kunde`, `angebotswert` (möglicher AE), `status`, zusätzlich über die API: `kam_id` |
| Gewonnen | zusätzlich `dienstleistung`, `ae_wert`, `laufzeit_monate`, `wie_vielt_verlaengerung`, `gewonnen_datum` |
| Verloren | zusätzlich `weitergeben_an_vertrieb` (`Ja`/`Nein`), `gekuendigt_am`, `auslaufend_am`; bei `Ja` auch `ansprechpartner`, `telefon`, `email_kontakt` |

**Weitere erlaubte Felder:** `kundennummer`, `vertragsnummer`, `vertragsbeginn`, `ende_laufzeit`, `ende_kuendigungsfrist`, `abgerechnet`, `kommentar`. Unbekannte Felder lehnt die API mit 400 ab. So fallen Tippfehler sofort auf.

## Endpoints

### `GET /vl`: Verlängerungen suchen

**Filter (alle optional):**
- `kundennummer`
- `kunde`: Der Name wird tolerant verglichen. Groß- und Kleinschreibung, Umlaute, Satzzeichen und Rechtsformen wie GmbH oder & Co. KG werden ignoriert.
- `vertragsnummer`
- `monat`
- `von` und `bis`: Zeitraum für das Feld `datum`
- `status`
- `kam_id`
- `limit` (Standard 50, höchstens 200) und `offset` für die Seitenaufteilung

```bash
curl -s "$KPI/vl?kundennummer=436079277266" -H "Authorization: Bearer $TOKEN"
```

**Antwort:** `{ "gesamt": 1, "limit": 50, "offset": 0, "daten": [ { "id": 3425, "kunde": "…", "monat": "2026-10", "status": "Offen", "kam_id": 33, "kam_name": "…", "kam_standort": "Braunschweig", "company_name": "HiOffice Care", "ae_wert": null, "herkunft": null, "erstellt_am": "…", … } ] }`

### `GET /vl/:id`: einzelne Verlängerung

### `GET /vl/match`: Dubletten-Prüfung vor dem Schreiben

**Parameter:**
- `kundennummer` oder `kunde`: eins von beiden ist Pflicht, besser beide.
- `monat`, oder `ende_kuendigungsfrist`, aus der der Monat abgeleitet wird.
- optional: `vertragsnummer`, `datum`, `ende_kuendigungsfrist`, `toleranz_tage` (Standard 14)

| `ergebnis` | Bedeutung |
|---|---|
| `exact` | gleiche Kundennummer und gleicher VL-Monat, **oder** gleiche Vertragsnummer, gleicher Name und gleicher Monat. Diese Verlängerung existiert bereits. |
| `nahe` | gleiche Kundennummer oder gleicher bzw. sehr ähnlicher Name, **und** gleicher Monat, Nachbarmonat oder Datum/Kündigungsfrist innerhalb der Toleranz. Möglicherweise dieselbe Verlängerung. |
| `keine` | Kein Kandidat gefunden. |

**Kein Treffer, auch wenn der Name passt,** wenn eine der beiden Bedingungen gilt:
- Die Kündigungsfristen beider Seiten liegen mehr als `toleranz_tage` auseinander.
- Beide haben eine Vertragsnummer, und sie ist verschieden.

So bleiben Mehrmonats-Verträge getrennte Ereignisse.

```bash
curl -s "$KPI/vl/match?kundennummer=436079277266&monat=2026-11" -H "Authorization: Bearer $TOKEN"
# { "ergebnis": "nahe", "exact": [], "nahe": [ { "gruende": ["kundennummer_gleich","monat_benachbart"], "deal": { … } } ], "hinweise": [] }
```

### `POST /vl`: anlegen

**Optionen**, als Query-Parameter oder im Body:
- `dry_run=true`: prüft alles, einschließlich Pflichtfeldern und Dubletten, legt aber nichts an.
- `force=true`: legt trotz eines `nahe`-Treffers an. Im Protokoll steht dann „trotz Nähe-Treffer angelegt“. Gegen einen `exact`-Treffer hilft `force` nicht.
- Header `Idempotency-Key: <beliebig>`:
  - Wiederholst du die Anfrage mit demselben Key und demselben Inhalt, kommt dieselbe Antwort, ohne zweite Anlage. Das ist sicher bei Netzwerkfehlern.
  - Derselbe Key mit anderem Inhalt ergibt `422`.

| Antwort | Bedeutung |
|---|---|
| `201` | angelegt: `{ "deal": { …, "herkunft": "api" }, "hinweise": [] }` |
| `200` | nur bei `dry_run`: `{ "dry_run": true, "wuerde_anlegen": true, "match": "keine", "hinweise": [] }` |
| `409` | Dublette: `error.ergebnis` ist `exact` oder `nahe`, `error.deals` enthält die Kandidaten |
| `400` | Eingabe ungültig: `error.felder` listet die Fehler |

Im Tracker tragen API-Anlagen das Badge **„per API“**, damit die KAMs sie nachpflegen können.

### `PATCH /vl/:id`: ändern

Du schickst nur die Felder, die sich ändern. Alles andere bleibt, wie es ist. Es gelten dieselben Pflichtfelder auf dem Endzustand und dieselbe Sperre für Zukunftsdaten. Eine umgestellte Verlängerung lässt sich über die API nicht ändern.

### `GET /kams` und `GET /companies`: Stammdaten im Scope

- `GET /kams` liefert `[ { "id", "name", "standort", "rolle", "aktiv", "company_id", "company_name", "email" } ]`. Mit `?alle=true` kommen auch inaktive KAMs.
- `GET /companies` liefert `[ { "id", "name", "currency" } ]`.

## Fehlerformat

```json
{ "error": { "code": "validation", "message": "Pflichtfelder fehlen: Realisierter AE",
             "felder": [ { "feld": "ae_wert", "grund": "fehlt" } ] } }
```

| HTTP | `code` | Wann |
|---|---|---|
| 400 | `validation` | Pflichtfeld fehlt, Feld unbekannt, Status nicht erlaubt, Datum in der Zukunft, KAM oder Company unbekannt |
| 401 | `unauthorized` | Token fehlt, ist falsch oder widerrufen |
| 403 | `scope` | Dem Token fehlt das Recht, zum Beispiel `vl:write` |
| 404 | `not_found` | Verlängerung existiert nicht oder liegt außerhalb des Standort-Scopes |
| 409 | `duplicate` | Dublette (`exact`) oder Nähe-Treffer ohne `force` |
| 422 | `idempotency_conflict` | Idempotency-Key wurde schon mit anderem Inhalt benutzt |
| 429 | `rate_limit` | mehr als 60 Anfragen pro Minute |

Werte für `felder[].grund`: `fehlt`, `unbekannt`, `unbekanntes_feld`, `nicht_erlaubt`, `zukunft`, `format_yyyy_mm`, `umgestellt_nur_im_formular`.

## Vollständiger Ablauf: aus HubSpot eine Verlängerung eintragen und später gewinnen

```bash
# 0) Einmalig: KAM- und Company-IDs holen (KAM über die E-Mail des HubSpot-Owners zuordnen)
curl -s "$KPI/kams"      -H "Authorization: Bearer $TOKEN"
curl -s "$KPI/companies" -H "Authorization: Bearer $TOKEN"

# 1) Gibt es die Verlängerung schon?
curl -s "$KPI/vl/match?kundennummer=436079277266&kunde=Muster%20GmbH&ende_kuendigungsfrist=2026-12-15" \
  -H "Authorization: Bearer $TOKEN"
#  ergebnis "exact" -> nichts tun, die vorhandene deal.id merken (für Schritt 4)
#  ergebnis "nahe"  -> NICHT automatisch anlegen, Kandidaten einem Menschen vorlegen
#  ergebnis "keine" -> weiter mit 2)

# 2) Probelauf: Pflichtfelder und Dubletten prüfen, ohne anzulegen
curl -s -X POST "$KPI/vl?dry_run=true" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "datum": "2026-11-04", "ende_kuendigungsfrist": "2026-12-15",
  "company_id": 2, "kam_id": 33,
  "kunde": "Muster GmbH", "kundennummer": "436079277266", "vertragsnummer": "V-1234",
  "angebotswert": 6000, "status": "Offen"
}'
#  -> 200 { "dry_run": true, "wuerde_anlegen": true, "hinweise": ["monat aus ende_kuendigungsfrist abgeleitet: 2026-12"] }

# 3) Echt anlegen, mit Idempotency-Key, damit ein Netzwerk-Retry keine Dublette erzeugt
curl -s -X POST "$KPI/vl" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -H "Idempotency-Key: hubspot-436079277266-2026-12" -d '{
  "datum": "2026-11-04", "ende_kuendigungsfrist": "2026-12-15",
  "company_id": 2, "kam_id": 33,
  "kunde": "Muster GmbH", "kundennummer": "436079277266", "vertragsnummer": "V-1234",
  "angebotswert": 6000, "status": "Offen"
}'
#  -> 201 { "deal": { "id": 5012, "monat": "2026-12", "herkunft": "api", … } }

# 4) Später: Verlängerung realisiert -> gewonnen setzen (gewonnen_datum höchstens heute)
curl -s -X PATCH "$KPI/vl/5012" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "status": "Gewonnen", "gewonnen_datum": "2026-12-15",
  "dienstleistung": "RaaS", "ae_wert": 6000, "laufzeit_monate": 12, "wie_vielt_verlaengerung": 2
}'
#  -> 200 { "deal": { "status": "Gewonnen", "gewonnen_monat": "2026-12", … } }
#  Auftragseingang und 2 % Verlängerungsprovision des KAM bucht der Tracker dabei automatisch.

# Kündigung statt Verlängerung:
curl -s -X PATCH "$KPI/vl/5012" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "status": "Verloren", "weitergeben_an_vertrieb": "Nein",
  "gekuendigt_am": "2026-11-20", "auslaufend_am": "2026-12-31"
}'
```
