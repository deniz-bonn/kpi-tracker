-- Migration 038: ae_gesamt_monthly + gewonnen_monat für Juni 2026 korrigieren
-- Root cause: Die KPI-Route nutzt ae_gesamt_monthly als autoritäre Quelle (useAG=true wenn gesamt>0).
-- Migration 037 hat nur die deal-Tabellen aktualisiert, aber nicht ae_gesamt_monthly.
-- Außerdem: gewonnen_monat war NULL für alle Juni-Deals, daher lieferten
-- die Live-Standort-Abfragen (BK/VL DE vs. AT) immer 0.

-- 1. ae_gesamt_monthly für Juni 2026 neu setzen (korrekte Zielwerte)
DELETE FROM ae_gesamt_monthly WHERE monat = '2026-06';
INSERT INTO ae_gesamt_monthly (monat, nk_bonn_anz, nk_bonn_ae, nk_bs_anz, nk_bs_ae, nk_at_anz, nk_at_ae, nk_ch_anz, nk_ch_ae, nk_gesamt, bk_gesamt, vl_gesamt, gesamt)
VALUES ('2026-06', 25, 230830, 51, 615300, 62, 309045, 0, 0, 1155175, 699520, 681300, 2535995);

-- 2. gewonnen_monat und gewonnen_datum setzen damit Live-Standort-Abfragen greifen
UPDATE deals_nk SET gewonnen_monat = '2026-06', gewonnen_datum = datum
  WHERE monat = '2026-06' AND status = 'Gewonnen' AND company_id IN (1, 3);

UPDATE deals_bk SET gewonnen_monat = '2026-06', gewonnen_datum = datum
  WHERE monat = '2026-06' AND status = 'Gewonnen' AND company_id IN (1, 3);

UPDATE deals_vl SET gewonnen_monat = '2026-06', gewonnen_datum = datum
  WHERE monat = '2026-06' AND status = 'Gewonnen' AND company_id IN (1, 3);
