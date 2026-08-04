-- Migration 080: Monatsziele Auftragseingang je STANDORT (SQLite)
-- Warum eine eigene Tabelle:
--   monthly_targets hat monat als PRIMARY KEY -- eine Standort-Spalte wuerde den
--   Schluessel brechen und die Gruppen-Logik des Dashboards beruehren.
--   targets ist company-bezogen (company_id + monat), also eine andere Dimension
--   (fach.digital / High Office / Morawitz) als der Standort (Bonn / Braunschweig / ...).
-- Das Gruppenziel in monthly_targets und die Dashboard-Differenz bleiben unveraendert.
CREATE TABLE IF NOT EXISTS monthly_targets_standort (
  monat      TEXT NOT NULL,
  standort   TEXT NOT NULL,
  ziel_ae    REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (monat, standort)
);

-- Startwert laut Vorgabe: August 2026, Bonn = 750.000 EUR
INSERT INTO monthly_targets_standort (monat, standort, ziel_ae)
VALUES ('2026-08', 'Bonn', 750000)
ON CONFLICT (monat, standort) DO NOTHING;
