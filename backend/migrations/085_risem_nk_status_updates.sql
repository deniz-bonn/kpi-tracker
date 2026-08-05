-- Migration 085: Fuenf Status-Updates aus dem Risem-Excel (Juli 2026)
-- Nur diese fuenf Deals -- die Aenderung ist nachweislich Excel-seitig.
-- Schutz: Es wird ausschliesslich aktualisiert, solange der Tracker-Status noch dem
--   Importstatus Offen entspricht UND der Deal einen [imp:excel_risem...]-Marker hat.
--   Wurde ein Deal zwischenzeitlich in der UI geaendert, greift die Bedingung nicht
--   und der Deal bleibt unberuehrt. Damit ist die Migration auch idempotent:
--   nach dem ersten Lauf ist der Status nicht mehr Offen.
-- Bewusst NICHT angefasst (Tracker ist dort aktueller als das Excel):
--   Huerlimann Holzbau AG (Juni), DECORVET HLKS Planungen AG, Gerber Auto AG, ZAUGG AG.
-- Kein Schreiben in ae_gesamt_monthly.

UPDATE deals_nk SET status = 'Gewonnen', ae_wert = 9000, gewonnen_datum = datum, gewonnen_monat = '2026-07'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Luchs Bodenbeläge AG'
    AND status = 'Offen' AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET status = 'Gewonnen', ae_wert = 12500, gewonnen_datum = datum, gewonnen_monat = '2026-07'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Geburt und Familie - Dr. med. W. Stadlmayr GmbH'
    AND status = 'Offen' AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET status = 'Verloren', ae_wert = NULL, gewonnen_datum = NULL, gewonnen_monat = NULL
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Stiftung Lebensart'
    AND status = 'Offen' AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET status = 'Verloren', ae_wert = NULL, gewonnen_datum = NULL, gewonnen_monat = NULL
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'HAUPTSACHE Franziskanerplatz8 GmbH'
    AND status = 'Offen' AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET status = 'Verloren', ae_wert = NULL, gewonnen_datum = NULL, gewonnen_monat = NULL
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Hans Nussbaumer, Elementbau & Architekturbüro AG'
    AND status = 'Offen' AND kommentar LIKE '%[imp:excel_risem%';
