-- Migration 078: vl_gesamt Juni 2026 konsistent zu vl_de_ae + vl_at_ae (SQLite)
-- Migration 068 hat vl_de_ae fuer Juni korrigiert (160100 -> 543400), aber vl_gesamt
-- unveraendert bei 306800 gelassen. Das Dashboard summiert vl_de_ae + vl_at_ae und war
-- daher nie betroffen, aber deals_nk.js liest ag.vl_gesamt beim Neuberechnen von
-- ae_gesamt_monthly.gesamt -- dort wirkte der veraltete Wert.
-- Setzt nur Juni 2026 (Vorgabe Deniz). Andere Monate bleiben unveraendert.
UPDATE ae_gesamt_monthly SET vl_gesamt = vl_de_ae + vl_at_ae, updated_at = datetime('now') WHERE monat = '2026-06';
