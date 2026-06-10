-- Migration 011: Rebuild ae_gesamt_monthly from actual deal data
-- The previous ae_gesamt values were imported from a Google Sheet that differed
-- from the CSV import. This rebuilds the table so the Dashboard overview
-- shows the same numbers as the Auftragseingang detail view.

DELETE FROM ae_gesamt_monthly;

INSERT INTO ae_gesamt_monthly (
  monat,
  nk_bonn_anz, nk_bonn_ae,
  nk_bs_anz,   nk_bs_ae,
  nk_at_anz,   nk_at_ae,
  nk_ch_anz,   nk_ch_ae,
  nk_gesamt,   bk_gesamt,   vl_gesamt,   gesamt
)
SELECT
  m.monat,
  COALESCE(nk.bonn_anz, 0),
  COALESCE(nk.bonn_ae,  0),
  COALESCE(nk.bs_anz,   0),
  COALESCE(nk.bs_ae,    0),
  COALESCE(nk.at_anz,   0),
  COALESCE(nk.at_ae,    0),
  COALESCE(nk.ch_anz,   0),
  COALESCE(nk.ch_ae,    0),
  COALESCE(nk.nk_gesamt, 0),
  COALESCE(bk.bk_gesamt, 0),
  COALESCE(vl.vl_gesamt, 0),
  COALESCE(nk.nk_gesamt, 0) + COALESCE(bk.bk_gesamt, 0) + COALESCE(vl.vl_gesamt, 0)
FROM (
  SELECT DISTINCT gewonnen_monat AS monat FROM (
    SELECT gewonnen_monat FROM deals_nk WHERE status='Gewonnen' AND gewonnen_monat IS NOT NULL
    UNION
    SELECT gewonnen_monat FROM deals_bk WHERE status='Gewonnen' AND gewonnen_monat IS NOT NULL
    UNION
    SELECT gewonnen_monat FROM deals_vl WHERE status='Gewonnen' AND gewonnen_monat IS NOT NULL
  ) u
) m
LEFT JOIN (
  SELECT
    d.gewonnen_monat AS monat,
    SUM(CASE WHEN COALESCE(e.standort,'') = 'Bonn'          THEN d.ae_wert ELSE 0 END) AS bonn_ae,
    COUNT(CASE WHEN COALESCE(e.standort,'') = 'Bonn'          THEN 1 END)               AS bonn_anz,
    SUM(CASE WHEN COALESCE(e.standort,'') = 'Braunschweig'  THEN d.ae_wert ELSE 0 END) AS bs_ae,
    COUNT(CASE WHEN COALESCE(e.standort,'') = 'Braunschweig'  THEN 1 END)               AS bs_anz,
    SUM(CASE WHEN COALESCE(e.standort,'') = 'Österreich'    THEN d.ae_wert ELSE 0 END) AS at_ae,
    COUNT(CASE WHEN COALESCE(e.standort,'') = 'Österreich'    THEN 1 END)               AS at_anz,
    SUM(CASE WHEN COALESCE(e.standort,'') = 'Schweiz'       THEN d.ae_wert ELSE 0 END) AS ch_ae,
    COUNT(CASE WHEN COALESCE(e.standort,'') = 'Schweiz'       THEN 1 END)               AS ch_anz,
    SUM(d.ae_wert) AS nk_gesamt
  FROM deals_nk d
  LEFT JOIN employees e ON e.id = d.closer_id
  WHERE d.status = 'Gewonnen' AND d.gewonnen_monat IS NOT NULL
  GROUP BY d.gewonnen_monat
) nk ON nk.monat = m.monat
LEFT JOIN (
  SELECT gewonnen_monat AS monat, SUM(ae_wert) AS bk_gesamt
  FROM deals_bk
  WHERE status = 'Gewonnen' AND gewonnen_monat IS NOT NULL
  GROUP BY gewonnen_monat
) bk ON bk.monat = m.monat
LEFT JOIN (
  SELECT gewonnen_monat AS monat, SUM(ae_wert) AS vl_gesamt
  FROM deals_vl
  WHERE status = 'Gewonnen' AND gewonnen_monat IS NOT NULL
  GROUP BY gewonnen_monat
) vl ON vl.monat = m.monat
ORDER BY m.monat;
