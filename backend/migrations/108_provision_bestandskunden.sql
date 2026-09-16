-- Migration 108: Abrechnungskreis "Bestandskundenvertrieb" (AM/KAM) — SQLite
--
-- Vierter Kreis neben bonn/braunschweig/oesterreich. Anders als diese drei ist er KEINE
-- Standort-Dimension, sondern eine QUELLEN-Dimension: gespeist aus deals_bk (Upsell 3 %) und
-- deals_vl (Verlaengerung 2 %), Empfaenger ist der KAM des Deals unabhaengig von dessen Standort.
-- Zyklus Kalendermonat, Auszahlung im Folgemonat, eigener Abschluss und eigener StB-Export.
--
-- Dialekt-Unterschiede zur .pg.sql: kein "IF NOT EXISTS" bei ADD COLUMN (SQLite kann das nicht),
-- NUMERIC ohne Praezision. Fachlich identisch.

-- ── 1) Quellen-Diskriminator im Ledger ───────────────────────────────────────
-- provision_buchungen.deal_id war bisher implizit immer eine deals_nk.id: kein FK, kein ON DELETE.
-- Mit zwei weiteren Quellen ist die nackte deal_id nicht mehr eindeutig — und mehrere Stellen
-- filtern GENAU darauf (storniereDeal: "WHERE b.deal_id=?", Staffel-Deltas ebenso). Ohne diese
-- Spalte wuerde ein BK-Storno NK-Buchungen mitreissen, sobald die Sequenzen der drei Tabellen
-- sich ueberschneiden. Heute tun sie es nicht (nk 14920–16904, bk 11950–13093, vl 2244–3195),
-- aber die Sequenzen laufen unabhaengig — das ist Zufall, keine Zusicherung.
-- Ein Praefix im idem_key allein reicht NICHT: die Delta-Queries lesen idem_key gar nicht.
ALTER TABLE provision_buchungen ADD COLUMN deal_quelle TEXT NOT NULL DEFAULT 'nk';

-- Bestand ist per Definition NK — der Default deckt das ab, hier nur zur Sicherheit explizit.
UPDATE provision_buchungen SET deal_quelle = 'nk' WHERE deal_quelle IS NULL;

-- Der alte Index auf deal_id allein bleibt (andere Abfragen nutzen ihn); zusaetzlich der
-- zusammengesetzte, weil ab jetzt JEDE Deal-bezogene Abfrage beide Spalten fuehren muss.
CREATE INDEX IF NOT EXISTS idx_prov_buch_quelle_deal ON provision_buchungen(deal_quelle, deal_id);

-- ── 2) Saetze des BK-Kreises ─────────────────────────────────────────────────
-- Eigene Spalten statt Zweckentfremdung der NK-Spalten: opener/setter/closer haben im
-- Bestandskundenvertrieb keine Entsprechung, und closer_basis mit "3" zu belegen waere eine
-- Falle fuer jeden, der spaeter die NK-Logik liest. NULL-bar, weil die drei NK-Kreise sie nicht haben.
ALTER TABLE provision_config ADD COLUMN upsell_satz  NUMERIC;
ALTER TABLE provision_config ADD COLUMN auto_vl_satz NUMERIC;

-- ── 3) Config-Zeile = Go-Live des Kreises ────────────────────────────────────
-- ACHTUNG, das ist der scharfe Schalter: goLiveDatum() leitet den Go-Live aus
-- MIN(gueltig_ab) DIESES Kreises ab. '2026-09-01' heisst daher ausdruecklich: erste
-- Abrechnungsperiode ist September 2026, Auszahlung Oktober. Kein August-Backfill.
-- Die NK-Satzspalten sind NOT NULL und werden mit 0 gefuellt (Muster wie BS/AT in 094) —
-- sie werden fuer diesen Kreis nie gelesen.
INSERT OR IGNORE INTO provision_config
  (kreis, gueltig_ab, opener_satz, setter_satz, opener_setter_pauschal, closer_basis,
   closer_schwelle, closer_hoch, team_empfaenger_id, team_s1_bis, team_s1, team_s2_bis,
   team_s2, team_s3, opener_modus, opener_fix, setter_modus, closer_modus,
   upsell_satz, auto_vl_satz)
VALUES
  ('bestandskunden', '2026-09-01', 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL,
   3.0, 2.0);
