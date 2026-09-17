-- Migration 111: Bereich "Willkommensmeetings" (WM) — Postgres
--
-- Account/Key Account Manager fuehren Willkommensmeetings und platzieren dort idealerweise ein
-- Angebot. Gemessen wird der Trichter: Meetings -> Angebote -> Abschluesse -> AE.
--
-- REFERENZ STATT KOPIE: Das Angebot existiert genau EINMAL, naemlich als regulaerer deals_bk-Deal.
-- Das Meeting haelt nur die Verknuepfung. Es gibt bewusst KEINE eigene Angebots-/Wert-/Status-Spalte
-- hier — sonst entstuenden zwei Staende desselben Angebots, die auseinanderlaufen koennen.
--
-- WARUM EIGENE TABELLE UND NICHT `termine`: Die Tabelle termine (Migration 100) ist aus Close
-- abgeleitet — close_event_id ist NOT NULL UNIQUE und traegt die Idempotenz des Sync, und
-- art hat einen CHECK auf ('setting','closing'). Ein manuell erfasstes Willkommensmeeting hat
-- kein Close-Event; es dort einzuhaengen hiesse, genau die Zusicherung aufzuweichen, die den
-- Show-Rate-Sync traegt.

CREATE TABLE IF NOT EXISTS willkommensmeetings (
  id                SERIAL PRIMARY KEY,
  datum             DATE NOT NULL,
  -- Kohorten-Achse: das Meeting gehoert in SEINEN Monat. Die daraus entstandenen Angebote und
  -- Abschluesse werden dieser Kohorte zugerechnet, auch wenn der Deal erst spaeter gewonnen wird.
  -- Die AE-Zaehlung des Deals selbst folgt unveraendert gewonnen_monat — das ist eine ANDERE Achse
  -- und bleibt am Deal. deals_bk traegt damit weiterhin genau zwei Monatsachsen, nicht drei.
  monat             CHAR(7) NOT NULL,
  kunde             TEXT NOT NULL,
  -- Der Meeting-Fuehrer. NOT NULL: eine Quote ohne zurechenbare Person ist wertlos.
  gefuehrt_von      INTEGER NOT NULL REFERENCES employees(id),
  -- Angebots-Typ am MEETING, nicht am Deal. Begruendung: deals_bk.dienstleistung kennt weder
  -- "Jahresbetreuung" noch "Jahresvertrag" (haeufigste Werte: RaaS Kontingente, Kontingente,
  -- Kontingenterweiterung) und ist zudem verschmutzt — "Kontingente " mit Leerzeichen steht neben
  -- "Kontingente" und "Kontingentvertrag". Die Haupt-KPI daraus abzuleiten waere ab Tag eins unsicher.
  angebots_typ      TEXT,
  aufzeichnung_url  TEXT,
  notiz             TEXT,
  -- Die Verknuepfung. UNIQUE: ein Deal haengt an hoechstens EINEM Meeting, sonst zaehlte derselbe
  -- Abschluss in zwei Kohorten. ON DELETE SET NULL: wird der Deal in BK geloescht, bleibt das
  -- Meeting als Faktum bestehen (es hat ja stattgefunden) und verliert nur seinen Angebotsbezug.
  deal_bk_id        INTEGER UNIQUE REFERENCES deals_bk(id) ON DELETE SET NULL,
  -- Merkt sich, DASS hier einmal ein Angebot hing. Ohne dieses Flag waere nach einem Deal-Loeschen
  -- nicht mehr unterscheidbar, ob nie eines platziert wurde (zaehlt gegen die Quote) oder ob es
  -- nachtraeglich entfernt wurde (soll sichtbar bleiben). Die Route setzt es vor dem Loeschen.
  deal_entfernt     INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wm_monat   ON willkommensmeetings (monat);
CREATE INDEX IF NOT EXISTS idx_wm_person  ON willkommensmeetings (gefuehrt_von);
CREATE INDEX IF NOT EXISTS idx_wm_deal    ON willkommensmeetings (deal_bk_id);

-- Herkunfts-Kennzeichen am Deal. NULL = wie bisher, damit der gesamte Bestand unveraendert bleibt
-- und keine Auswertung anders rechnet. Gesetzt wird ausschliesslich 'willkommensmeeting'.
ALTER TABLE deals_bk ADD COLUMN IF NOT EXISTS herkunft TEXT;
CREATE INDEX IF NOT EXISTS idx_bk_herkunft ON deals_bk (herkunft) WHERE herkunft IS NOT NULL;
