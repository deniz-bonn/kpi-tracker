-- Migration 102: Kennzeichnung "Verlängerung auf Dauervertrag umgestellt" + neuer AE-Wert.
--
-- Zweck: Nur TRACKING. Der dauervertrag_ae_wert fliesst ausdruecklich in KEINE bestehende Summe —
-- nicht in den VL-AE, nicht in ae_gesamt/Dashboard, nicht in Ziele, nicht in die Provisionen.
-- Er wird ausschliesslich separat ausgewiesen. Ob und wie er spaeter zaehlt, ist eine offene
-- Geschaeftsentscheidung (erst tracken, dann regeln).
--
-- Typwahl dauervertrag_umgestellt = INTEGER (nicht BOOLEAN): In deals_vl ist `terminiert` in BEIDEN
-- Dialekten INTEGER, die upsale_*-Spalten dagegen BOOLEAN (pg) vs. INTEGER (sqlite) — eine bereits
-- bestehende Divergenz, die nur deshalb nicht auffaellt, weil Postgres '0'/'1' als Boolean-Literal
-- akzeptiert. Mit INTEGER in beiden Dialekten bleibt der Routen-Code dialektfrei
-- (Number(x) || 0) und Vergleiche (= 1) verhalten sich identisch.
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS dauervertrag_umgestellt INTEGER NOT NULL DEFAULT 0;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS dauervertrag_ae_wert    NUMERIC(12,2);
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS dauervertrag_datum      DATE;

-- Teilindex: die Auswertung fragt fast immer nur die markierten Faelle ab.
CREATE INDEX IF NOT EXISTS idx_vl_dauervertrag ON deals_vl (dauervertrag_umgestellt) WHERE dauervertrag_umgestellt = 1;
