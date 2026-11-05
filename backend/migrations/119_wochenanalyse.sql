-- Migration 119: Woechentliche Vertriebsanalyse Bonn (Transkript-Codierung, Verbleib-Liste, Report).
--
-- Fortsetzung der Oktober-2026-Analyse als Dauerbetrieb (backend/analyse/oktober-2026/, src/analyse/).
-- Rein additiv. Grundsatz: KEIN Transkripttext in der Datenbank — Transkripte werden nur im
-- Speicher verarbeitet. Gespeichert werden Codierung, Paraphrasen ohne Namen und Metadaten.

-- ── Close-Spiegel: Anrufe, Aufgaben, Lead-Domains (nur Metadaten) ──────────────────────────
CREATE TABLE IF NOT EXISTS close_calls (
  id           TEXT PRIMARY KEY,                   -- Close-Activity-ID des Anrufs
  lead_id      TEXT,
  user_id      TEXT,
  user_name    TEXT,
  dauer_sek    INTEGER NOT NULL DEFAULT 0,
  richtung     TEXT,                               -- inbound | outbound
  beginn       TEXT NOT NULL,               -- activity_at, sonst date_created
  datum        DATE NOT NULL,                      -- Berlin
  hat_aufnahme INTEGER NOT NULL DEFAULT 0,
  synced_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ccalls_lead  ON close_calls (lead_id);
CREATE INDEX IF NOT EXISTS idx_ccalls_datum ON close_calls (datum);
CREATE INDEX IF NOT EXISTS idx_ccalls_user  ON close_calls (user_id, datum);

CREATE TABLE IF NOT EXISTS close_tasks (
  id            TEXT PRIMARY KEY,
  lead_id       TEXT,
  text          TEXT,
  faellig_datum DATE,                              -- Berlin; NULL = Aufgabe ohne Datum
  erledigt      INTEGER NOT NULL DEFAULT 0,
  assigned_to   TEXT,
  synced_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ctasks_lead ON close_tasks (lead_id);

CREATE TABLE IF NOT EXISTS close_leads (
  id           TEXT PRIMARY KEY,
  display_name TEXT,
  domains      TEXT,                               -- kommagetrennt, ohne Freemail (fuer Fireflies-Zuordnung)
  abgerufen_am TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE close_opportunities ADD COLUMN lead_name      TEXT;
ALTER TABLE close_opportunities ADD COLUMN value          NUMERIC(14,2);   -- in Waehrungseinheiten (Close liefert Cent)
ALTER TABLE close_opportunities ADD COLUMN value_currency TEXT;
ALTER TABLE close_opportunities ADD COLUMN value_period   TEXT;

-- ── Fireflies-Meetings (Metadaten + Zuordnung, kein Titel, kein Transkript) ───────────────
CREATE TABLE IF NOT EXISTS ff_meetings (
  id             TEXT PRIMARY KEY,
  beginn         TEXT,
  datum          DATE,
  dauer_min      NUMERIC(8,2),
  host           TEXT,                             -- Teil vor dem @
  klasse         TEXT NOT NULL,                    -- SC | intern | Zweifel | Zweifel_SC
  zuordnung      TEXT,                             -- sicher | wahrscheinlich | mehrdeutig | keine
  close_lead_id  TEXT,
  mitarbeiter    TEXT,                             -- interner Sprecher mit der groessten Redezeit
  employee_id    INTEGER REFERENCES employees(id),
  abgerufen_am   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ffm_datum ON ff_meetings (datum);
CREATE INDEX IF NOT EXISTS idx_ffm_lead  ON ff_meetings (close_lead_id);

-- ── Codier-Warteschlange: jeder Call genau einmal, Wiederholung bei Fehlern ───────────────
CREATE TABLE IF NOT EXISTS codier_auftraege (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  quelle                TEXT NOT NULL CHECK (quelle IN ('close','fireflies')),
  quell_id              TEXT NOT NULL,
  close_lead_id         TEXT,
  employee_id           INTEGER REFERENCES employees(id),
  mitarbeiter           TEXT,
  call_am               TEXT,
  dauer_sek             INTEGER,
  richtung              TEXT,
  stufe_zeitlinie       TEXT,
  stufe_zeitlinie_grund TEXT,
  status                TEXT NOT NULL DEFAULT 'offen'
                        CHECK (status IN ('offen','eingereicht','fertig','ohne_transkript','fehler','aufgegeben')),
  versuche              INTEGER NOT NULL DEFAULT 0,
  batch_id              TEXT,
  custom_id             TEXT,
  letzter_fehler        TEXT,
  namen_tmp             TEXT,                -- Namenstokens fuer die Bereinigung der Einzeiler; nach dem Einsammeln geleert
  angelegt_am           TEXT NOT NULL DEFAULT (datetime('now')),
  aktualisiert_am       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (quelle, quell_id)
);
CREATE INDEX IF NOT EXISTS idx_cauf_status ON codier_auftraege (status);
CREATE INDEX IF NOT EXISTS idx_cauf_batch  ON codier_auftraege (batch_id);

CREATE TABLE IF NOT EXISTS analyse_batches (
  batch_id         TEXT PRIMARY KEY,               -- Anthropic Message-Batch-ID
  run_id           INTEGER,
  modell           TEXT,
  anzahl           INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'laeuft' CHECK (status IN ('laeuft','eingesammelt','fehler')),
  erfolgreich      INTEGER,
  fehlgeschlagen   INTEGER,
  kosten_usd       NUMERIC(10,4),
  eingereicht_am   TEXT NOT NULL DEFAULT (datetime('now')),
  eingesammelt_am  TEXT
);

-- ── Codierung: eine Zeile je Aufnahme ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_codings (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  quelle                      TEXT NOT NULL CHECK (quelle IN ('close','fireflies')),
  quell_id                    TEXT NOT NULL,       -- Close-Call-ID bzw. Fireflies-Meeting-ID
  basis                       TEXT NOT NULL DEFAULT 'laufend' CHECK (basis IN ('laufend','oktober')),
  close_lead_id               TEXT,
  close_opportunity_id        TEXT,
  employee_id                 INTEGER REFERENCES employees(id),
  mitarbeiter                 TEXT,
  mitsprecher                 TEXT,                -- Fireflies: weitere interne Sprecher (JSON)
  call_am                     TEXT,
  call_datum                  DATE NOT NULL,       -- Berlin
  dauer_sek                   INTEGER,
  redeanteil_ma               NUMERIC(5,1),
  richtung                    TEXT,
  stufe_zeitlinie             TEXT,
  stufe_zeitlinie_grund       TEXT,
  stufe                       TEXT NOT NULL,       -- Opening | Setting | Closing | Nachfassung | Sonstiges_*
  ergebnis                    TEXT,
  erfolg                      TEXT,                -- ja | nein | n.a.
  konfidenz                   TEXT,                -- hoch | mittel | niedrig
  in_hauptquote               INTEGER NOT NULL DEFAULT 1,
  grund1_id                   TEXT,
  grund1_konfidenz            TEXT,
  grund2_id                   TEXT,
  grund2_konfidenz            TEXT,
  grund_freitext              TEXT,                -- nur bei SONSTIG, ohne Namen
  entscheider_im_gespraech    TEXT,                -- ja | nein | unklar
  bedarf_bestaetigt           TEXT,                -- ja | nein | unklar
  naechster_schritt_mit_datum TEXT,                -- ja | nein
  ma_fragte_aktiv_nach_termin TEXT,                -- ja | nein
  abschlussfrage_gestellt     TEXT,                -- ja | nein | n.a.
  closing_aktiv_angeboten     TEXT,
  termin_verbindlich_fixiert  TEXT,
  abschluss_aktiv_versucht    TEXT,
  warnsignale_b4              TEXT,                -- kommagetrennt
  widerspruch_zusammenfassung TEXT,
  naechster_schritt_datum     DATE,                -- ab Prompt v2
  naechster_schritt_text      TEXT,                -- ab Prompt v2, Paraphrase ohne Namen
  einzeiler                   TEXT,                -- Paraphrase ohne Namen, kein Zitat
  modell                      TEXT,
  prompt_version              TEXT,
  taxonomie_version           TEXT,
  batch_id                    TEXT,
  input_tokens                INTEGER,
  output_tokens               INTEGER,
  cache_read_tokens           INTEGER,
  cache_write_tokens          INTEGER,
  kosten_usd                  NUMERIC(10,5),
  codiert_am                  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (quelle, quell_id)
);
CREATE INDEX IF NOT EXISTS idx_cc_datum ON call_codings (call_datum);
CREATE INDEX IF NOT EXISTS idx_cc_emp   ON call_codings (employee_id, call_datum);
CREATE INDEX IF NOT EXISTS idx_cc_opp   ON call_codings (close_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_cc_lead  ON call_codings (close_lead_id);

-- ── Verbleib-Liste: taeglicher Stand, Freitag als Wochenstand markiert ────────────────────
CREATE TABLE IF NOT EXISTS verbleib_snapshot (
  id                                 INTEGER PRIMARY KEY AUTOINCREMENT,
  stand_datum                        DATE NOT NULL,
  ist_wochenstand                    INTEGER NOT NULL DEFAULT 0,
  close_opportunity_id               TEXT NOT NULL,
  close_lead_id                      TEXT,
  firma                              TEXT,
  stufe                              TEXT NOT NULL,          -- Setting | Closing
  termin_datum                       DATE,
  opener_id                          INTEGER REFERENCES employees(id),
  setter_id                          INTEGER REFERENCES employees(id),
  closer_id                          INTEGER REFERENCES employees(id),
  opener                             TEXT,
  setter                             TEXT,
  closer                             TEXT,
  status_id                          TEXT,
  status_label                       TEXT,
  status_seit                        DATE,
  tage_im_status                     INTEGER,                -- Werktage Mo–Fr
  bedingung                          TEXT NOT NULL CHECK (bedingung IN ('a','b','c','d')),
  follow_up_statt_termin             INTEGER NOT NULL DEFAULT 0,
  naechster_schritt_close            TEXT,
  naechster_schritt_close_datum      DATE,
  naechster_schritt_transkript       TEXT,
  naechster_schritt_transkript_datum DATE,
  grund_id                           TEXT,
  grund                              TEXT,
  opportunity_wert                   NUMERIC(14,2),
  waehrung                           TEXT,
  close_link                         TEXT,
  erstellt_am                        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (stand_datum, close_opportunity_id, bedingung)
);
CREATE INDEX IF NOT EXISTS idx_vs_stand ON verbleib_snapshot (stand_datum);

-- ── Wochenreports und Lauf-Log ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_reports (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  jahr                   INTEGER NOT NULL,
  kw                     INTEGER NOT NULL,
  woche_von              DATE NOT NULL,
  woche_bis              DATE NOT NULL,
  monat_von              DATE NOT NULL,
  monat_bis              DATE NOT NULL,
  modus                  TEXT NOT NULL CHECK (modus IN ('test','live','ohne_versand')),
  empfaenger             TEXT,
  anzahl_codiert_woche   INTEGER,
  anzahl_codiert_monat   INTEGER,
  nicht_vollstaendig     INTEGER NOT NULL DEFAULT 0,
  offen_ungecodiert      INTEGER,
  abdeckung              TEXT,                    -- JSON
  kennzahlen             TEXT,                    -- JSON, ohne Kundennamen
  texte                  TEXT,                    -- JSON, ohne Kundennamen
  kosten_codierung_usd   NUMERIC(10,4),
  kosten_texte_usd       NUMERIC(10,4),
  kosten_gesamt_usd      NUMERIC(10,4),
  versand_status         TEXT NOT NULL DEFAULT 'ausstehend' CHECK (versand_status IN ('ausstehend','gesendet','fehler','ohne_versand')),
  versendet_am           TEXT,
  fehler                 TEXT,
  run_id                 INTEGER,
  erstellt_am            TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wr_woche ON weekly_reports (woche_bis DESC);

CREATE TABLE IF NOT EXISTS analyse_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  typ             TEXT NOT NULL,                  -- codierung | einsammeln | verbleib | report | oktober_basis
  ausgeloest_von  TEXT NOT NULL,                  -- cron | manuell | cli
  user_name       TEXT,
  zeitraum_von    DATE,
  zeitraum_bis    DATE,
  status          TEXT NOT NULL DEFAULT 'laeuft' CHECK (status IN ('laeuft','ok','fehler','teilweise')),
  gestartet_am    TEXT NOT NULL DEFAULT (datetime('now')),
  beendet_am      TEXT,
  abdeckung       TEXT,                           -- JSON: Calls mit/ohne Aufnahme je Closer u. a.
  fehler          TEXT,                           -- JSON-Liste
  kosten_usd      NUMERIC(10,4),
  log             TEXT
);
CREATE INDEX IF NOT EXISTS idx_ar_gestartet ON analyse_runs (gestartet_am DESC);

CREATE TABLE IF NOT EXISTS analyse_settings (
  schluessel  TEXT PRIMARY KEY,
  wert        TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by  TEXT
);
INSERT INTO analyse_settings (schluessel, wert, updated_by) VALUES ('versand_modus', 'test', 'Migration 119')
ON CONFLICT (schluessel) DO NOTHING;
