-- Migration 113: dritter VL-Ausgang "Umgestellt" (Dauer-RaaS) + Verknuepfung zum BK-Upsell-Deal.
-- Fachliche Begruendung: siehe 113_vl_umgestellt.pg.sql.
--
-- SQLite kann CHECK-Constraints nicht per ALTER aendern -> Tabelle neu anlegen. Spaltenstand
-- nach allen Migrationen bis 112: 38 Spalten, hier um umstellung_deal_bk_id auf 39 erweitert.
--
-- ZWINGEND "PRAGMA foreign_keys = OFF": upsale_deals.deals_vl_id zeigt mit ON DELETE CASCADE auf
-- deals_vl (Migration 023). Bei eingeschalteten Fremdschluesseln fuehrt SQLite vor dem DROP ein
-- implizites DELETE aus und feuert damit die Kaskade — ALLE Up-Sale-Zeilen waeren still weg.
-- Das ist der Unterschied zu Migration 112 (termine), wo nichts auf die Tabelle zeigt.
--
-- Ebenfalls mitzunehmen und leicht zu verlieren:
--   * die vier Indizes (idx_deals_vl_monat / _company / _gewonnen_monat / idx_vl_dauervertrag)
--   * die NOT-NULL-DEFAULTs (upsale_angesprochen, upsale_angenommen, terminiert,
--     dauervertrag_umgestellt) — ein Rebuild ohne sie macht aus 0 still NULL
--   * die bewusste Typwahl INTEGER statt BOOLEAN bei den Flags (siehe 102_vl_dauervertrag.sql:8-12)
PRAGMA foreign_keys = OFF;

CREATE TABLE deals_vl_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datum TEXT NOT NULL,
  monat TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  kam_id INTEGER REFERENCES employees(id),
  kunde TEXT NOT NULL,
  dienstleistung TEXT,
  angebotswert REAL,
  ae_wert REAL,
  laufzeit_monate INTEGER,
  status TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren', 'Umgestellt')),
  wie_vielt_verlaengerung INTEGER,
  kommentar TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  gewonnen_datum TEXT,
  gewonnen_monat TEXT,
  abgerechnet TEXT,
  kundennummer TEXT,
  gekuendigt_am TEXT,
  auslaufend_am TEXT,
  ansprechpartner TEXT,
  telefon TEXT,
  email_kontakt TEXT,
  upsale_angesprochen INTEGER NOT NULL DEFAULT 0,
  upsale_summe REAL,
  upsale_angenommen INTEGER NOT NULL DEFAULT 0,
  upsale_angenommen_summe REAL,
  weitergeben_an_vertrieb TEXT,
  terminiert INTEGER NOT NULL DEFAULT 0,
  neuer_ap_intern TEXT,
  vertragsnummer TEXT,
  vertragsbeginn TEXT,
  ende_laufzeit TEXT,
  ende_kuendigungsfrist TEXT,
  dauervertrag_umgestellt INTEGER NOT NULL DEFAULT 0,
  dauervertrag_ae_wert NUMERIC,
  dauervertrag_datum DATE,
  umstellung_deal_bk_id INTEGER REFERENCES deals_bk(id) ON DELETE SET NULL
);

INSERT INTO deals_vl_new
  SELECT id, datum, monat, company_id, kam_id, kunde, dienstleistung, angebotswert, ae_wert,
         laufzeit_monate, status, wie_vielt_verlaengerung, kommentar, created_at, updated_at,
         gewonnen_datum, gewonnen_monat, abgerechnet, kundennummer,
         gekuendigt_am, auslaufend_am, ansprechpartner, telefon, email_kontakt,
         upsale_angesprochen, upsale_summe, upsale_angenommen, upsale_angenommen_summe,
         weitergeben_an_vertrieb, terminiert, neuer_ap_intern,
         vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist,
         dauervertrag_umgestellt, dauervertrag_ae_wert, dauervertrag_datum,
         NULL
    FROM deals_vl;

DROP TABLE deals_vl;
ALTER TABLE deals_vl_new RENAME TO deals_vl;

CREATE INDEX IF NOT EXISTS idx_deals_vl_monat ON deals_vl(monat);
CREATE INDEX IF NOT EXISTS idx_deals_vl_company ON deals_vl(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_vl_gewonnen_monat ON deals_vl(gewonnen_monat);
CREATE INDEX IF NOT EXISTS idx_vl_dauervertrag ON deals_vl (dauervertrag_umgestellt);
CREATE INDEX IF NOT EXISTS idx_vl_umstellung_deal ON deals_vl (umstellung_deal_bk_id);

-- ── Wording: der Jahres-Typ im Willkommensmeetings-Bereich heisst ebenfalls Dauer-RaaS ──────
-- Der Wert steht als Text in den Daten, nicht nur in einer Anzeigeliste. Ohne diese Zeile fiele
-- ein bereits erfasstes Meeting aus JAHRES_TYPEN und damit still aus der Haupt-KPI des Bereichs.
-- Im Prod-Stand vom 18.09.2026 betrifft das genau eine Zeile.
UPDATE willkommensmeetings SET angebots_typ = 'Dauer-RaaS' WHERE angebots_typ = 'Jahresbetreuung';

PRAGMA foreign_keys = ON;
