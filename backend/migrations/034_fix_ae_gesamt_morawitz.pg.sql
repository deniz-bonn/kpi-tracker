-- Migration 034: ae_gesamt_monthly exakte Werte aus Morawitz-Excel setzen
-- Ersetzt alle relativen Anpassungen aus Migration 033 durch absolute Zielwerte.
-- Quelle: Morawitz-Excel-Tabelle (Auftragseingang Jan-Jun 2026)

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 0, nk_bonn_ae = 0,
  nk_bs_anz   = 0, nk_bs_ae   = 0,
  nk_ch_anz   = 0, nk_ch_ae   = 0,
  nk_at_anz   = 29, nk_at_ae  = 125600,
  nk_gesamt   = 125600,
  bk_gesamt   = 117000,
  vl_gesamt   = 100750,
  gesamt      = 343350,
  updated_at  = NOW()
WHERE monat = '2026-01';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 0, nk_bonn_ae = 0,
  nk_bs_anz   = 0, nk_bs_ae   = 0,
  nk_ch_anz   = 0, nk_ch_ae   = 0,
  nk_at_anz   = 34, nk_at_ae  = 157050,
  nk_gesamt   = 157050,
  bk_gesamt   = 336690,
  vl_gesamt   = 36800,
  gesamt      = 530540,
  updated_at  = NOW()
WHERE monat = '2026-02';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 0, nk_bonn_ae = 0,
  nk_bs_anz   = 0, nk_bs_ae   = 0,
  nk_ch_anz   = 0, nk_ch_ae   = 0,
  nk_at_anz   = 31, nk_at_ae  = 161400,
  nk_gesamt   = 161400,
  bk_gesamt   = 188650,
  vl_gesamt   = 117380,
  gesamt      = 467430,
  updated_at  = NOW()
WHERE monat = '2026-03';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 0, nk_bonn_ae = 0,
  nk_bs_anz   = 0, nk_bs_ae   = 0,
  nk_ch_anz   = 0, nk_ch_ae   = 0,
  nk_at_anz   = 42, nk_at_ae  = 211300,
  nk_gesamt   = 211300,
  bk_gesamt   = 107480,
  vl_gesamt   = 126350,
  gesamt      = 445130,
  updated_at  = NOW()
WHERE monat = '2026-04';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 0, nk_bonn_ae = 0,
  nk_bs_anz   = 0, nk_bs_ae   = 0,
  nk_ch_anz   = 0, nk_ch_ae   = 0,
  nk_at_anz   = 33, nk_at_ae  = 186160,
  nk_gesamt   = 186160,
  bk_gesamt   = 121512,
  vl_gesamt   = 90200,
  gesamt      = 397872,
  updated_at  = NOW()
WHERE monat = '2026-05';

UPDATE ae_gesamt_monthly SET
  nk_bonn_anz = 0, nk_bonn_ae = 0,
  nk_bs_anz   = 0, nk_bs_ae   = 0,
  nk_ch_anz   = 0, nk_ch_ae   = 0,
  nk_at_anz   = 33, nk_at_ae  = 164350,
  nk_gesamt   = 164350,
  bk_gesamt   = 147780,
  vl_gesamt   = 67400,
  gesamt      = 379530,
  updated_at  = NOW()
WHERE monat = '2026-06';
