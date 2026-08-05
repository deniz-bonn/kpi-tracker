-- Migration 084: Nachimport 22 fehlende Risem-NK-Deals Juli 2026
-- Im Risem-Excel nach dem Erstimport ergaenzt. Regeln wie beim Erstimport (076/081),
-- mit einer bewussten Abweichung: gewonnene Deals bekommen ae_wert (CHF) --
-- konsistent zu Migration 083, die den Bestand nachtraeglich befuellt.
--   Gewonnen: ae_wert = CHF-Wert, gewonnen_datum = Angebotsdatum, gewonnen_monat = 2026-07
--   Verloren/Offen: ae_wert und beide Gewinn-Felder NULL
-- status_original als [orig:...] im Kommentar, Close-Link als " · Close: <URL>".
-- Idempotent ueber [imp:excel_risem_nachimport_juli2:nk:<n>] je Zeile.
-- Kein Schreiben in ae_gesamt_monthly.

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-27', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Wenaweser & Partner Bauingenieure AG', 'Kontingentvertrag', 12500, 3, 'Gewonnen', 12500, 'Nein', 'Close! [orig:Gewonnen] · Close: https://app.close.com/lead/lead_RLE04nJb0ha6mCWxbgHl176NqWmkZFQBxQ4HdF68I9M/ [imp:excel_risem_nachimport_juli2:nk:1]', '2026-07-27', '2026-07'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:1]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Wenaweser & Partner Bauingenieure AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-27', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'DACO Baumanagement GmbH', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend [orig:Offen] · Close: https://app.close.com/lead/lead_GSL2VHl96Rfd5wv5bm3wFX8belE8bLlEQpa4cSdXf7G/ [imp:excel_risem_nachimport_juli2:nk:2]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:2]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'DACO Baumanagement GmbH');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-27', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'FRIEDLI MetallTechnik AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', 9000, 'Nein', 'Close! [orig:Gewonnen] · Close: https://app.close.com/lead/lead_f5Bkp3U6Jvk8Nr25y5e158u9HxVZPa8u9BD6kIbGB25/ [imp:excel_risem_nachimport_juli2:nk:3]', '2026-07-27', '2026-07'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:3]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'FRIEDLI MetallTechnik AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-28', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Alterszentrum Haus Tabea', 'Kontingentvertrag', 16000, 4, 'Offen', NULL, 'Ja', 'Bis 20.08. Entscheidung ausstehend: 19.08. GL Sitzung [orig:Offen] · Close: https://app.close.com/lead/lead_oqrUSWOuBQEj1l0uY8KXHUrePYhiZKjY65rIBLdgvW3/ [imp:excel_risem_nachimport_juli2:nk:4]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:4]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Alterszentrum Haus Tabea');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-28', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Spitex Dulliken, Obergösgen, Starrkirch-Wil', 'Kontingentvertrag', 9000, 2, 'Gewonnen', 9000, 'Ja', 'Close! [orig:Gewonnen] · Close: https://app.close.com/lead/lead_jy8vZnYrd0UyLGYfQnxqqOoC8FvTmB362L1Lyye87pF/ [imp:excel_risem_nachimport_juli2:nk:5]', '2026-07-28', '2026-07'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:5]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Spitex Dulliken, Obergösgen, Starrkirch-Wil');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-28', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'RWeidmann AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Kein Bedarf [orig:Verloren] · Close: https://app.close.com/lead/lead_eDsi21PMHxCJ8AzLdpgufVra4iTVOffCGspsHhSk4IU/ [imp:excel_risem_nachimport_juli2:nk:6]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:6]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'RWeidmann AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-28', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'wbarchitekten GmbH', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend: 11.08. FU Mail [orig:Offen] · Close: https://app.close.com/lead/lead_1eP8XnuESrOjBUyftKlafnSalJ12EbWvxL1xOzBXzPp/ [imp:excel_risem_nachimport_juli2:nk:7]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:7]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'wbarchitekten GmbH');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-28', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Flütsch Advokatur & Notariat GmbH', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Glaubwürdigkeit komplett weg wegen "Fake-Profil" [orig:Verloren] · Close: https://app.close.com/lead/lead_GXoE4rF9lq2zC9aGzvjnLu4qmn57vwADx9jncOgmZa6/ [imp:excel_risem_nachimport_juli2:nk:8]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:8]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Flütsch Advokatur & Notariat GmbH');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-29', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Thomann Nutzfahrzeuge AG', 'Kontingentvertrag', 0, 0, 'Verloren', NULL, 'Ja', 'Nichts gepitcht. Herr Frei hat direkt von Anfang an, als ich das Framing eingeleitet habe, gesagt, dass die GL entschieden hat, dass wir nicht ins Geschäft kommen. [orig:Verloren] · Close: https://app.close.com/lead/lead_Kp0dcUuiP8KULEh0JgVIPRCYAtuAj8vP7yqapa1KbcU/ [imp:excel_risem_nachimport_juli2:nk:9]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:9]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Thomann Nutzfahrzeuge AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-29', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Murrelektronik AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Bedarf später [orig:Offen] · Close: https://app.close.com/lead/lead_WmkQKP0DjFkZohvIebZFM8RfnRUmtgnQvW5RoS5lB8t/ [imp:excel_risem_nachimport_juli2:nk:10]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:10]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Murrelektronik AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-29', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Schwarzwälder AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'FB: 03.08.2026 [orig:Offen] · Close: https://app.close.com/lead/lead_1CcaO9ko1PZg0HIZAksHVbjxBiGSCCJieVZWp0fzQhk/ [imp:excel_risem_nachimport_juli2:nk:11]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:11]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Schwarzwälder AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-29', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'LEXA-Wohnmobile AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'FB: 05.08.2026 [orig:Offen] · Close: https://app.close.com/lead/lead_dznOdpcBT6DZOVhAmxCg5ulIbMHnvCbm8zHLNh3LCYR/ [imp:excel_risem_nachimport_juli2:nk:12]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:12]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'LEXA-Wohnmobile AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-29', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Medvita Praxis GmbH', 'Kontingentvertrag', 12500, 3, 'Offen', NULL, 'Ja', 'Entscheidung: 31.07.2026 [orig:Offen] · Close: https://app.close.com/lead/lead_g7k1OxR96Idx8ArNh7q09ySpgKDqqDPF49F7RxK1LAS/ [imp:excel_risem_nachimport_juli2:nk:13]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:13]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Medvita Praxis GmbH');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-29', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'MediZentrum Reichenbach i/K AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', 9000, 'Ja', 'Close! [orig:Gewonnen] · Close: https://app.close.com/lead/lead_iGP9WOAT35IbsHGHQPeiteNhi4DuvuM4LpA6MFLqpdR/ [imp:excel_risem_nachimport_juli2:nk:14]', '2026-07-29', '2026-07'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:14]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'MediZentrum Reichenbach i/K AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-29', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Rutschmann Reifen AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Entscheidung: Closer Follow Up: Fragen wie der Stand ist = haben noch 1 Monat inserat online [orig:Offen] · Close: https://app.close.com/lead/lead_gwlFfrG3VA4v18cYHKSk9gHmN3Jy9DXGjKARA2vxUeh/ [imp:excel_risem_nachimport_juli2:nk:15]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:15]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Rutschmann Reifen AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-30', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Indermühle Bauingenieure GmbH', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'FB: 11.08.2026 [orig:Offen] · Close: https://app.close.com/lead/lead_mjkWrKps9nPr6YdGt8divHhZqGVX2ep0xkwQEl6J79G/ [imp:excel_risem_nachimport_juli2:nk:16]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:16]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Indermühle Bauingenieure GmbH');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-30', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Reg. Meiko-Servicestelle Roth AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'FB: 05.08.2026 [orig:Offen] · Close: https://app.close.com/lead/lead_n1VB6QSpWWelDvr1HmjSnq2F93vkjOduJsf0dgJDPeh/ [imp:excel_risem_nachimport_juli2:nk:17]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:17]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Reg. Meiko-Servicestelle Roth AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-31', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Elektro Bachmann AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', 9000, 'Ja', 'Close! [orig:Gewonnen] · Close: https://app.close.com/lead/lead_Ymusa1IdYQ9jIGS7wL887MaxQC8HInzULzHkA46r428/ [imp:excel_risem_nachimport_juli2:nk:18]', '2026-07-31', '2026-07'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:18]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Elektro Bachmann AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-31', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Tony Panitti AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', 9000, 'Ja', 'Close! [orig:Gewonnen] · Close: https://app.close.com/lead/lead_JXjEJktdWgpNYrqJrtVBTbZnjniiBVXSRoezkQHXG91/ [imp:excel_risem_nachimport_juli2:nk:19]', '2026-07-31', '2026-07'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:19]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Tony Panitti AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-31', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Feldhof Garage AG', 'Kontingentvertrag', 5500, 1, 'Gewonnen', 5500, 'Ja', 'Close! [orig:Gewonnen] · Close: https://app.close.com/lead/lead_LrrKM2lsFcRcauAxijWw0lfhod4AqlVjZZmveoaHF2B/ [imp:excel_risem_nachimport_juli2:nk:20]', '2026-07-31', '2026-07'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:20]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Feldhof Garage AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-31', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Brütsch AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', 9000, 'Ja', 'Close! [orig:Gewonnen] · Close: https://app.close.com/lead/lead_TRQ2WZN9e5laprb4WD8slh2E3ii0LCYMO40ANXerjTU/ [imp:excel_risem_nachimport_juli2:nk:21]', '2026-07-31', '2026-07'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:21]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Brütsch AG');

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-07-31', '2026-07', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Gilli Gartenbau GmbH', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'FB: 05.08.2026 [orig:Offen] · Close: https://app.close.com/lead/lead_3Kze44LjrrGPjQDqfczqAmFVoISKZOzp1r5UvIboar3/ [imp:excel_risem_nachimport_juli2:nk:22]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juli2:nk:22]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-07' AND kunde = 'Gilli Gartenbau GmbH');
