-- Migration 035: Bonn/BS NK-Werte in ae_gesamt_monthly wiederherstellen
-- Migration 034 hat nk_bonn_ae, nk_bs_ae, nk_bonn_anz, nk_bs_anz auf 0 gesetzt.
-- Stellt die originalen Werte aus Migration 013 zurueck.
-- Alle anderen Felder (nk_at, nk_gesamt, bk_gesamt, vl_gesamt, gesamt) bleiben unveraendert.

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 19, nk_bonn_ae = 128700,
  nk_bs_anz   = 0,  nk_bs_ae   = 0,
  updated_at  = NOW()
WHERE monat = '2026-01';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 30, nk_bonn_ae = 219900,
  nk_bs_anz   = 0,  nk_bs_ae   = 0,
  updated_at  = NOW()
WHERE monat = '2026-02';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 21, nk_bonn_ae = 222300,
  nk_bs_anz   = 0,  nk_bs_ae   = 0,
  updated_at  = NOW()
WHERE monat = '2026-03';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 44, nk_bonn_ae = 477400,
  nk_bs_anz   = 0,  nk_bs_ae   = 0,
  updated_at  = NOW()
WHERE monat = '2026-04';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 26, nk_bonn_ae = 285300,
  nk_bs_anz   = 32, nk_bs_ae   = 314100,
  updated_at  = NOW()
WHERE monat = '2026-05';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 5,  nk_bonn_ae = 45000,
  nk_bs_anz   = 13, nk_bs_ae   = 144800,
  updated_at  = NOW()
WHERE monat = '2026-06';
