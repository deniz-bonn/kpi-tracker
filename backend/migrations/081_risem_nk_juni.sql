-- Migration 081: Nachimport Risem Neukunden-Angebote Juni 2026 (78 Deals)
-- Regeln identisch zum Juli-Import (Migration 076):
--   status_original -> [orig:...] im Kommentar (es gibt keine eigene Spalte)
--   crm_link wird nicht importiert
--   Gewonnen: gewonnen_datum = Angebotsdatum, gewonnen_monat = 2026-06
--   Verloren/Offen: gewonnen_datum und gewonnen_monat NULL
--   ae_wert bleibt bei ALLEN Deals NULL -- kein historischer AE
-- Kein Schreiben in ae_gesamt_monthly, keine Buchungslogik (reines SQL).
-- Betraege sind CHF, Umrechnung geschieht zur Laufzeit ueber companies.currency.
-- Idempotent ueber die Marke [imp:excel_risem_nachimport_juni:nk:<n>] je Zeile.

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-01', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Stefan Züst holzboot.ch', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:1]', '2026-06-01', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:1]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Stefan Züst holzboot.ch'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-01', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Musegg Immobilien AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:2]', '2026-06-01', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:2]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Musegg Immobilien AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-01', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Axova AG', 'Kontingentvertrag', 16000, 4, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:3]', '2026-06-01', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:3]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Axova AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-01', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Calendly', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Valbag AG', 'Kontingentvertrag', 5500, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:4]', '2026-06-01', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:4]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Valbag AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-02', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'physiopuma ag', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:5]', '2026-06-02', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:5]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'physiopuma ag'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-02', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Bütikofer Gebäudetechnik AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Hat keine Dringlichkeit (momentan 2 Kandidaten in der Pipeline, hätte da in der BDA kurz bleiben müssen), hab ihm trotzdem alles gezeigt kann es sich grundsätzlich auch vorstellen, aber möchte auch nicht per Vorkasse bezahlen. Hab ihm offerte gesendet und sind so verblieben dass er sich bei Bedarf meldet [orig:Nein] [imp:excel_risem_nachimport_juni:nk:6]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:6]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Bütikofer Gebäudetechnik AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-02', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Titlis Sport AG', 'Kontingentvertrag', 7000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:7]', '2026-06-02', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:7]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Titlis Sport AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-03', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Markus Schmid AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'FB: 08.06.2026 [orig:Ja] [imp:excel_risem_nachimport_juni:nk:8]', '2026-06-03', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:8]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Markus Schmid AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-03', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Esther Hartmann GmbH', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Entweder sie meldet sich oder später nachfassen [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:9]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:9]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Esther Hartmann GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-03', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Stiftung MitMänsch Oberwallis', 'Kontingentvertrag', 12500, 3, 'Verloren', NULL, 'Ja', 'Absage: Für sie wenig interessant [orig:Nein] [imp:excel_risem_nachimport_juni:nk:10]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:10]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Stiftung MitMänsch Oberwallis'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-03', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), NULL, (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Liesch Ingenieure AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [opener laut Quelle: Eliott (nicht zugeordnet)] [imp:excel_risem_nachimport_juni:nk:11]', '2026-06-03', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:11]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Liesch Ingenieure AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-03', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Physio Lifestyle', 'Kontingentvertrag', 5500, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:12]', '2026-06-03', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:12]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Physio Lifestyle'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-03', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'VitaFutura AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Hat abgesagt: Nicht so das Vertrauen gehabt dass wir ihnen wirklich helfen können [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:13]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:13]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'VitaFutura AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-04', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Walter Bochsler AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:14]', '2026-06-04', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:14]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Walter Bochsler AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-05', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Ärztezentrum Stäfa', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:15]', '2026-06-05', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:15]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Ärztezentrum Stäfa'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-09', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Fanzun AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend: Zeit lassen er meldet sich [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:16]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:16]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Fanzun AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-09', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Praxis Calandra Physiotherapie & Naturheilkunde', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:17]', '2026-06-09', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:17]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Praxis Calandra Physiotherapie & Naturheilkunde'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-10', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Karl Rölli Holzbau, Bedachung & Spenglerei AG', 'Kontingentvertrag', 12500, 3, 'Verloren', NULL, 'Ja', 'Entweder er meldet sich oder komplett lassy [orig:Nein] [imp:excel_risem_nachimport_juni:nk:18]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:18]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Karl Rölli Holzbau, Bedachung & Spenglerei AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-10', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Swiss Physio Partner AG', 'Kontingentvertrag', 12500, 3, 'Verloren', NULL, 'Ja', 'Entweder sie meldet sich oder komplett lassy [orig:Nein] [imp:excel_risem_nachimport_juni:nk:19]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:19]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Swiss Physio Partner AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-10', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Physiotherapie Recherswil GmbH', 'Kontingentvertrag', 5500, 1, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:20]', '2026-06-10', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:20]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Physiotherapie Recherswil GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-10', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Furrer Schreinerei + Küchenbau AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Konnte die Stelle nun selber besetzen [orig:Nein] [imp:excel_risem_nachimport_juni:nk:21]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:21]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Furrer Schreinerei + Küchenbau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-10', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'AsFam beider Basel gmbh', 'Kontingentvertrag', 12500, 3, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:22]', '2026-06-10', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:22]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'AsFam beider Basel gmbh'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-10', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Reha Zentral GmbH', 'Kontingentvertrag', 5500, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:23]', '2026-06-10', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:23]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Reha Zentral GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-11', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Martin Ruckli AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:24]', '2026-06-11', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:24]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Martin Ruckli AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-11', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Haus im Ruthen', 'Kontingentvertrag', 5500, 1, 'Verloren', NULL, 'Ja', 'Entweder sie melden sich oder komplett lassy = Später Nachfassen [orig:Nein] [imp:excel_risem_nachimport_juni:nk:25]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:25]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Haus im Ruthen'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-11', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Oschwald Platten AG', 'Kontingentvertrag', 12500, 3, 'Offen', NULL, 'Ja', 'Kein grossen Bedarf mehr wollte aber verhandeln und hab es nicht gemacht dass ich ihm noch das setup schenke - wir höre uns einfach [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:26]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:26]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Oschwald Platten AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-11', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Hasler Limacher Architekten GmbH', 'Kontingentvertrag', 12500, 3, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:27]', '2026-06-11', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:27]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Hasler Limacher Architekten GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-12', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'LP Ingenieure AG', 'Kontingentvertrag', 7000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:28]', '2026-06-12', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:28]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'LP Ingenieure AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-12', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Gauss & Merz AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:29]', '2026-06-12', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:29]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Gauss & Merz AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-12', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Zindel + Co. AG', 'Kontingentvertrag', 12500, 3, 'Verloren', NULL, 'Ja', 'GL hat sich leider dagegen entschieden aber Franziska Ebneter bleibt da dran weil sie von uns überzeugt ist! [orig:Nein] [imp:excel_risem_nachimport_juni:nk:30]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:30]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Zindel + Co. AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-12', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Merz AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Burned, möchte nicht per Vorleistung arbeiten [orig:Nein] [imp:excel_risem_nachimport_juni:nk:31]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:31]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Merz AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-15', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'HEINI Conditorei AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Will zuerst eigene Wege gehen aber ist grundsätzlich überzeugt [orig:Nein] [imp:excel_risem_nachimport_juni:nk:32]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:32]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'HEINI Conditorei AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-15', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Alters- und Pflegeheim Sägematt', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend: Sie meldet sich! [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:33]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:33]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Alters- und Pflegeheim Sägematt'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-15', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Rehacenter Physiofit AG', 'Kontingentvertrag', 12500, 3, 'Verloren', NULL, 'Ja', 'Entweder er meldet sich oder komplett lassy [orig:Nein] [imp:excel_risem_nachimport_juni:nk:34]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:34]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Rehacenter Physiofit AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-15', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'MBG Verwaltungs AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:35]', '2026-06-15', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:35]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'MBG Verwaltungs AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-15', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Villiger Arnosti Gartenbau AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:36]', '2026-06-15', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:36]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Villiger Arnosti Gartenbau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-16', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'AZ systems AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:37]', '2026-06-16', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:37]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'AZ systems AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-16', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'J. Schumacher AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:38]', '2026-06-16', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:38]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'J. Schumacher AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-17', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'BrunnerFelix AG', 'Kontingentvertrag', 12500, 2, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend: Bereits 1 FU + Wollen noch Referenzen einholen [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:39]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:39]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'BrunnerFelix AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-17', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Raimann Holzbau AG', 'Kontingentvertrag', 5500, 1, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:40]', '2026-06-17', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:40]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Raimann Holzbau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-17', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'A. Ruoff AG', 'Kontingentvertrag', 12500, 3, 'Verloren', NULL, 'Ja', 'Entweder meldet er sich ganz konkret aber ist ein ganz spezieller typ der immer zu viele unsicherheiten hat und deswegen lasse ich ihm die Zeit sonst komplett SAS [orig:Nein] [imp:excel_risem_nachimport_juni:nk:41]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:41]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'A. Ruoff AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-17', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'pfistertrans ag', 'Kontingentvertrag', 5500, 1, 'Verloren', NULL, 'Ja', 'Können aktuell aus eigener Kraft die Stellen besetzen, aber sie melden sich. Allenfalls wäre das was für Immobilienbewirtschafter, weil sie da auch ein Unternehmen haben und dort eher schwierigkeiten Stellen zu besetzen [orig:Nein] [imp:excel_risem_nachimport_juni:nk:42]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:42]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'pfistertrans ag'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-17', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'GfC Provivatis AG', 'Kontingentvertrag', 5500, 1, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:43]', '2026-06-17', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:43]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'GfC Provivatis AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-18', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Tocafix AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Für immer geburned [orig:Nein] [imp:excel_risem_nachimport_juni:nk:44]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:44]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Tocafix AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-18', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Molkerei Lanz AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:45]', '2026-06-18', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:45]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Molkerei Lanz AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-19', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'NATURA Gartenbau AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:46]', '2026-06-19', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:46]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'NATURA Gartenbau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-19', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Heim AG Heizsysteme', 'Kontingentvertrag', 16000, 4, 'Verloren', NULL, 'Ja', '28.08.2026: Nachfragen per Mail wie der stand ist [orig:Nein] [imp:excel_risem_nachimport_juni:nk:47]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:47]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Heim AG Heizsysteme'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-19', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'HS Kälte Wärme Klima GmbH', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Nein', 'Absage: Hallo Herr Shala Entschuldigen Sie die Wartezeit. Ich gehe nächste Woche in die Ferien und konnte mich nicht um die Angelegenheit kümmern. Wir haben momentan direkt die Möglichkeit jemanden zu rekrutieren. Gerne würden wir aber bei Bedarf wieder auf Sie zukommen. Besten Dank für Ihr Engagement. Freundliche Grüsse Thomas Huber [orig:Nein] [imp:excel_risem_nachimport_juni:nk:48]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:48]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'HS Kälte Wärme Klima GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-19', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Thomet Partner AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:49]', '2026-06-19', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:49]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Thomet Partner AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-19', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Elektro Iten-Steiner AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:50]', '2026-06-19', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:50]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Elektro Iten-Steiner AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-22', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Schmidlin Holzbau AG', 'Kontingentvertrag', 12500, 3, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:51]', '2026-06-22', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:51]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Schmidlin Holzbau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-22', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Bernauer AG', 'Kontingentvertrag', 16000, 4, 'Verloren', NULL, 'Ja', 'Er soll sich melden, hab ihm eine Mail geschrieben und lasse es sein [orig:Nein] [imp:excel_risem_nachimport_juni:nk:52]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:52]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Bernauer AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-22', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'eyeBq engineering & consulting AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:53]', '2026-06-22', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:53]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'eyeBq engineering & consulting AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-22', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Infranext AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:54]', '2026-06-22', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:54]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Infranext AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-22', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Leutwyler Kühlanlagen AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Wirklicher Einwand: Aktuell einfach gar keine Zeit [orig:Nein] [imp:excel_risem_nachimport_juni:nk:55]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:55]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Leutwyler Kühlanlagen AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-22', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Top-Tec Haus-Technik GmbH', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Nie Zeit, [orig:Nein] [imp:excel_risem_nachimport_juni:nk:56]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:56]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Top-Tec Haus-Technik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-23', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'METTLER PRADER AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Entscheidung ausstehend [orig:Ja] [imp:excel_risem_nachimport_juni:nk:57]', '2026-06-23', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:57]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'METTLER PRADER AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-23', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Silas Rudolph' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Holzbau Niederberger AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Bedarf später [orig:Nein] [imp:excel_risem_nachimport_juni:nk:58]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:58]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Holzbau Niederberger AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-23', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Hugo Leutenegger AG', 'Kontingentvertrag', 12500, 3, 'Verloren', NULL, 'Ja', 'Absage: Wir sind wie gesagt mit einem Personalvermittler in der Zusammenarbeit, bereits mit Kostenfolge. Da wir zurzeit 6 Dossiers am Prüfen sind und demnächst ein Entscheid fallen wird, besteht im Moment kein Interesse an einer zusätzlichen Quelle. Wir melden uns aber gerne zu einem anderen Zeitpunkt wieder. [orig:Nein] [imp:excel_risem_nachimport_juni:nk:59]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:59]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Hugo Leutenegger AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-23', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Vermflex GmbH', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Roman Gnägi lehnte ab und erklärte, die Entscheidung der GL sei endgültig und das Unternehmen stehe dahinter. [orig:Nein] [imp:excel_risem_nachimport_juni:nk:60]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:60]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Vermflex GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-24', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Rossel Bedachungen+ Holzbau AG', 'Kontingentvertrag', 7000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:61]', '2026-06-24', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:61]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Rossel Bedachungen+ Holzbau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-24', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'hebHolz AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:62]', '2026-06-24', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:62]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'hebHolz AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-25', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'M B Metallbau AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:63]', '2026-06-25', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:63]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'M B Metallbau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-25', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Zentrum Guggerbach Davos', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:64]', '2026-06-25', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:64]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Zentrum Guggerbach Davos'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-25', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Stiftung Aarvital', 'Kontingentvertrag', 12500, 3, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:65]', '2026-06-25', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:65]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Stiftung Aarvital'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-25', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Hürlimann Holzbau AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend: Entscheid im August [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:66]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:66]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Hürlimann Holzbau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-26', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'MiMaTi GmbH', 'Kontingentvertrag', 5500, 1, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:67]', '2026-06-26', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:67]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'MiMaTi GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-26', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Cäsar Garten GmbH', 'Kontingentvertrag', 5500, 2, 'Verloren', NULL, 'Ja', 'Kein Bedarf [orig:Nein] [imp:excel_risem_nachimport_juni:nk:68]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:68]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Cäsar Garten GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-26', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Sterki Bau AG', 'Kontingentvertrag', 14500, 2, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend: Bereits 1 FU [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:69]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:69]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Sterki Bau AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-26', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Büsser AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Bedarf später [orig:Nein] [imp:excel_risem_nachimport_juni:nk:70]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:70]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Büsser AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-29', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Augenkontakt AG', 'Kontingentvertrag', 9000, 2, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend: Bereits 1 FU [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:71]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:71]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Augenkontakt AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-29', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Bitzer Sanitär AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:72]', '2026-06-29', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:72]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Bitzer Sanitär AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-29', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Physiotherapie Praxis Bücheli Inhaber Salic', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Komplett LOST [orig:Nein] [imp:excel_risem_nachimport_juni:nk:73]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:73]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Physiotherapie Praxis Bücheli Inhaber Salic'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-30', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Dr.Meyer Immobilien AG', 'Kontingentvertrag', 9000, 2, 'Gewonnen', NULL, 'Nein', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:74]', '2026-06-30', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:74]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Dr.Meyer Immobilien AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-30', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Deniz Boukhris' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'dsp Ingenieure + Planer AG', 'Kontingentvertrag', 16000, 4, 'Offen', NULL, 'Ja', 'Entscheidung ausstehend: Bereits 1 FU [orig:Verhandlung] [imp:excel_risem_nachimport_juni:nk:75]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:75]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'dsp Ingenieure + Planer AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-30', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Cold Calling', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daris Becic' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Karl Bucher AG', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Absage Grund: Zahlung [orig:Nein] [imp:excel_risem_nachimport_juni:nk:76]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:76]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Karl Bucher AG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-30', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Baran Bünül' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Gesundheitszentrum Walchwil GmbH', 'Kontingentvertrag', 5500, 1, 'Gewonnen', NULL, 'Ja', 'Close! [orig:Ja] [imp:excel_risem_nachimport_juni:nk:77]', '2026-06-30', '2026-06'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:77]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Gesundheitszentrum Walchwil GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));

INSERT INTO deals_nk (datum, monat, company_id, quelle, closer_id, opener_id, setter_id, kunde, dienstleistung, angebotswert, laufzeit_monate, status, ae_wert, automatische_verlaengerung, kommentar, gewonnen_datum, gewonnen_monat)
SELECT '2026-06-30', '2026-06', (SELECT id FROM companies WHERE name = 'Risem'), 'Mail', (SELECT id FROM employees WHERE name = 'Dardan Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Elias Ackle' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Zymer Shala' AND company_id = (SELECT id FROM companies WHERE name = 'Risem') ORDER BY id LIMIT 1), 'Helvetic Health GmbH', 'Kontingentvertrag', 9000, 2, 'Verloren', NULL, 'Ja', 'Absage Grund: Haben sich dagegen entschieden [orig:Nein] [imp:excel_risem_nachimport_juni:nk:78]', NULL, NULL
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Risem')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE kommentar LIKE '%[imp:excel_risem_nachimport_juni:nk:78]%')
  AND NOT EXISTS (SELECT 1 FROM deals_nk WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem')
                    AND monat = '2026-06' AND kunde = 'Helvetic Health GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%excel_risem_nachimport_juni%'));
