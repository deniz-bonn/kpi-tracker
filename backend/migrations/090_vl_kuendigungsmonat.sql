-- Migration 090: VL-Monatszuordnung nach spaetestem Kuendigungsdatum (Korrektur 079)
-- Regel: Verlaengerung gehoert in den Monat ihres spaetesten Kuendigungsdatums.
-- Teil A: 27 offene Import-Deals von 2026-08 nach 2026-07 umziehen (monat + datum).
-- Teil B: 2 Namensvarianten-Dubletten -- bestehende Tracker-Deals fuehren:
--   (1) Deutsche Steinzeug: Import-Kopie (2026-08) loeschen, gewonnener Juli-Deal fuehrt.
--   (2) Scherer Ernst Zimmerei: NICHT nachimportieren, bestehender 2026-08/Offen-Deal fuehrt.
-- Teil C: Nachimport fehlender Soll-Vertraege Juli (9) + August (86), Status Offen, ae_wert leer.
-- Idempotent ueber Marker + NOT EXISTS. Kein Schreiben in ae_gesamt_monthly. Keine Buchung <= 2026-06.
-- Klaerliste (11) und Nicht-Offen-Faelle (8) bleiben unberuehrt (separate Klaerung).

-- Teil A: Umzuege 2026-08 -> 2026-07
UPDATE deals_vl SET monat='2026-07', datum='2026-07-29' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:4]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-29' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:5]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-28' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:14]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-28' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:34]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-27' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:32]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-24' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:82]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-24' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:83]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-24' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:10]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-23' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:80]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-22' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:81]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-21' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:8]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-17' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:30]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-15' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:60]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-31' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:23]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-30' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:103]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-12' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:31]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-12' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:6]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-28' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:43]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-11' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:29]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-27' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:54]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-27' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:49]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-10' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:7]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-25' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:42]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-08' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:44]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-24' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:101]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-19' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:12]%' AND monat='2026-08' AND status='Offen';
UPDATE deals_vl SET monat='2026-07', datum='2026-07-19' WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:16]%' AND monat='2026-08' AND status='Offen';

-- Teil B: Dublette loeschen (Import-Kopie), bestehender Juli-Deal fuehrt
DELETE FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:33]%' AND monat='2026-08' AND status='Offen';
-- Nicht importiert (Namensvarianten-Dublette, 2026-08, bestehender Deal fuehrt): Scherer Ernst Zimmerei Betriebsges.m.b.H. Nr. AN26-4562

-- Teil C: Nachimport 2026-07 (9)
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-14', '2026-07', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'MEDIAN Heinrich-Mann-Klinik Bad Liebenstein', 27000, NULL, 10, 'Offen', 2, 'DA 521036', '2025-12-15', '2026-10-14', '2026-07-14', '2026-10-14', 'Kontingentvertrag, Fotoshooting · Nr. DA 521036 · [imp:vertragssystem_kuend_2026-07:1]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:1]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='MEDIAN Heinrich-Mann-Klinik Bad Liebenstein' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-19', '2026-07', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Friesenwarf GmbH & Co. KG', 2100, NULL, 6, 'Offen', 2, 'JA 11982', '2026-03-20', '2026-09-19', '2026-07-19', '2026-09-19', 'Karriereseite · Nr. JA 11982 · [imp:vertragssystem_kuend_2026-07:2]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:2]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='Friesenwarf GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-23', '2026-07', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'GFI Gesellschaft für Feuerschutz und Installationen mbH', 0, NULL, 12, 'Offen', 2, '1', '2025-10-24', '2026-10-23', '2026-07-23', '2026-10-23', 'Karriereseite · Nr. 1 · [imp:vertragssystem_kuend_2026-07:3]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:3]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='GFI Gesellschaft für Feuerschutz und Installationen mbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-27', '2026-07', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Holthausen GmbH', 0, NULL, 12, 'Offen', 2, '10498', '2025-10-28', '2026-10-27', '2026-07-27', '2026-10-27', 'Karriereseite + SM · Nr. 10498 · [imp:vertragssystem_kuend_2026-07:4]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:4]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='Holthausen GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-27', '2026-07', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Tirolpack GmbH', 6000, NULL, 2, 'Offen', 4, 'AN26-3965', '2026-07-27', '2026-09-27', '2026-07-27', '2026-09-27', 'RaaS · Nr. AN26-3965 · [imp:vertragssystem_kuend_2026-07:5]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:5]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='Tirolpack GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-28', '2026-07', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Tiroler Hospiz Betriebsgesellschaft m.b.H.', 3000, NULL, 1, 'Offen', 3, 'AB26-2058', '2026-07-11', '2026-08-11', '2026-07-28', '2026-08-11', 'Kontingentmodell · Nr. AB26-2058 · [imp:vertragssystem_kuend_2026-07:6]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:6]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='Tiroler Hospiz Betriebsgesellschaft m.b.H.' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-01', '2026-07', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'GW St. Pölten Integrative Betriebe GmbH', 5400, NULL, 2, 'Offen', 2, 'AN26-4382', '2026-06-02', '2026-08-01', '2026-07-01', '2026-08-01', 'RaaS · Nr. AN26-4382 · [imp:vertragssystem_kuend_2026-07:7]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:7]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='GW St. Pölten Integrative Betriebe GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-31', '2026-07', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Evangelische Krankenhausgemeinschaft Herne  Castrop-Rauxel gGmbH', 20400, NULL, 12, 'Offen', 2, 'nV', '2025-11-01', '2026-10-31', '2026-07-31', '2026-10-31', 'Social Media Betreuung · Nr. nV · [imp:vertragssystem_kuend_2026-07:8]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:8]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='Evangelische Krankenhausgemeinschaft Herne  Castrop-Rauxel gGmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-07-31', '2026-07', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Paul Koppenwallner GmbH', 5400, NULL, 2, 'Offen', 2, 'AN26-4356', '2026-07-01', '2026-08-31', '2026-07-31', '2026-08-31', 'RaaS · Nr. AN26-4356 · [imp:vertragssystem_kuend_2026-07:9]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-07:9]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-07' AND kunde='Paul Koppenwallner GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));

-- Teil C: Nachimport 2026-08 (86)
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Vincent Mäder' ORDER BY aktiv DESC, id LIMIT 1), 'Diakonisches Werk Bonn und Region - gemeinnützige GmbH', 15000, NULL, 12, 'Offen', 3, '01744', '2025-11-15', '2026-11-15', '2026-08-15', '2026-11-15', 'Kontingentvertrag · Nr. 01744 · [imp:vertragssystem_kuend_2026-08:1]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:1]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Diakonisches Werk Bonn und Region - gemeinnützige GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-01', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Deutsches Rotes Kreuz Kreisverband Düren e. V.', 24000, NULL, 12, 'Offen', 3, 'CK-04052', '2025-11-01', '2026-11-01', '2026-08-01', '2026-11-01', 'Social Media Betreuung · Nr. CK-04052 · [imp:vertragssystem_kuend_2026-08:2]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:2]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Deutsches Rotes Kreuz Kreisverband Düren e. V.' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-11', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Krankenhaus Agatharied KU', 9000, NULL, 3, 'Offen', 4, '18781', '2026-06-11', '2026-09-11', '2026-08-11', '2026-09-11', 'Active-Sourcing · Nr. 18781 · [imp:vertragssystem_kuend_2026-08:3]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:3]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Krankenhaus Agatharied KU' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'KBO Lech-Mangfall-Kliniken gGmbH', 61250, NULL, 12, 'Offen', 1, 'DA 5280522', '2025-11-30', '2026-11-29', '2026-08-29', '2026-11-29', 'Kontingentvertrag · Nr. DA 5280522 · [imp:vertragssystem_kuend_2026-08:4]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:4]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='KBO Lech-Mangfall-Kliniken gGmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-30', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Klinik Ernst von Bergmann Bad Belzig gGmbH', 34200, NULL, 12, 'Offen', 1, 'DA 202011a', '2025-12-01', '2026-11-30', '2026-08-30', '2026-11-30', 'Glaubenssatzmarketing · Nr. DA 202011a · [imp:vertragssystem_kuend_2026-08:5]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:5]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Klinik Ernst von Bergmann Bad Belzig gGmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-30', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Universitätsklinikum Regensburg', 32400, NULL, 12, 'Offen', 1, 'JA 11935', '2025-12-01', '2026-11-30', '2026-08-30', '2026-11-30', 'Kontingentvertrag · Nr. JA 11935 · [imp:vertragssystem_kuend_2026-08:6]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:6]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Universitätsklinikum Regensburg' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-25', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Textil-Service ILSE GmbH', 9000, NULL, 3, 'Offen', 3, '18893', '2026-06-25', '2026-09-25', '2026-08-25', '2026-09-25', 'Kontingentvertrag · Nr. 18893 · [imp:vertragssystem_kuend_2026-08:7]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:7]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Textil-Service ILSE GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-30', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Knappschaft Kliniken Saar GmbH', 32400, NULL, 12, 'Offen', 1, 'JA 11937', '2025-12-01', '2026-11-30', '2026-08-30', '2026-11-30', 'Kontingentvertrag · Nr. JA 11937 · [imp:vertragssystem_kuend_2026-08:8]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:8]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Knappschaft Kliniken Saar GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Gemeinnützige Gesellschaft der Franziskanerinnen zu Olpe mbH', 9000, NULL, 3, 'Offen', 3, '18967', '2026-06-24', '2026-09-24', '2026-08-24', '2026-09-24', 'Kontingentvertrag · Nr. 18967 · [imp:vertragssystem_kuend_2026-08:9]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:9]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Gemeinnützige Gesellschaft der Franziskanerinnen zu Olpe mbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-30', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Dustin Mischak' ORDER BY aktiv DESC, id LIMIT 1), 'Wartig Nord GmbH', 6000, NULL, 2, 'Offen', 3, '12134', '2026-07-13', '2026-09-13', '2026-08-30', '2026-09-13', 'Kontingentpaket · Nr. 12134 · [imp:vertragssystem_kuend_2026-08:10]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:10]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Wartig Nord GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-03', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Fach.digital GmbH', 6000, NULL, 2, 'Offen', 4, '111111', '2026-07-03', '2026-09-03', '2026-08-03', '2026-09-03', 'Kontingentpaket · Nr. 111111 · [imp:vertragssystem_kuend_2026-08:11]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:11]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Fach.digital GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-04', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Sergio Velardo' ORDER BY aktiv DESC, id LIMIT 1), 'MR Landkreis Ansbach GmbH', 6000, NULL, 2, 'Offen', 4, '12105', '2026-07-04', '2026-09-04', '2026-08-04', '2026-09-04', 'Kontingentvertrag · Nr. 12105 · [imp:vertragssystem_kuend_2026-08:12]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:12]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='MR Landkreis Ansbach GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'GFO Kliniken Niederrhein', 9000, NULL, 3, 'Offen', 2, 'DA521062', '2026-06-15', '2026-09-15', '2026-08-15', '2026-09-15', 'Kontingentvertrag · Nr. DA521062 · [imp:vertragssystem_kuend_2026-08:13]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:13]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='GFO Kliniken Niederrhein' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-18', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Kinder-Hospiz Sternenbrücke', 750, NULL, 3, 'Offen', 2, 'n.V', '2026-06-18', '2026-09-18', '2026-08-18', '2026-09-18', 'Schnellbewerber-Button · Nr. n.V · [imp:vertragssystem_kuend_2026-08:14]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:14]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Kinder-Hospiz Sternenbrücke' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Heinrich-Braun-Klinikum gGmbH', 40500, NULL, 8, 'Offen', 1, 'DA 52101-25', '2026-03-31', '2026-11-29', '2026-08-29', '2026-11-29', 'Kontingentvertrag · Nr. DA 52101-25 · [imp:vertragssystem_kuend_2026-08:15]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:15]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Heinrich-Braun-Klinikum gGmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Sauter Gebäudetechnik GmbH', 4600, NULL, 2, 'Offen', 3, '1668', '2026-07-12', '2026-09-12', '2026-08-29', '2026-09-12', 'Kontingentvertrag · Nr. 1668 · [imp:vertragssystem_kuend_2026-08:16]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:16]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Sauter Gebäudetechnik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-11', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Test heute', 3000, NULL, 3, 'Offen', 2, '1234', '2026-07-11', '2026-10-11', '2026-08-11', '2026-10-11', 'Konti · Nr. 1234 · [imp:vertragssystem_kuend_2026-08:17]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:17]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Test heute' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Medek & Schörner GmbH', 5000, NULL, 2, 'Offen', 3, 'AN25-4862', '2026-07-27', '2026-09-27', '2026-08-27', '2026-09-27', 'Kontingentmodell · Nr. AN25-4862 · [imp:vertragssystem_kuend_2026-08:18]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:18]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Medek & Schörner GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'KSP CNC-Technik GmbH', 6000, NULL, 2, 'Offen', 2, '2604017', '2026-07-04', '2026-09-04', '2026-08-21', '2026-09-04', 'Kontingentvertrag · Nr. 2604017 · [imp:vertragssystem_kuend_2026-08:19]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:19]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='KSP CNC-Technik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-23', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Klinikum Fürth', 18000, NULL, 6, 'Offen', 1, '2602103', '2026-04-24', '2026-10-23', '2026-08-23', '2026-10-23', 'Kontingentvertrag · Nr. 2602103 · [imp:vertragssystem_kuend_2026-08:20]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:20]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Klinikum Fürth' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'INDUSTRIE- UND TANKANLAGEN Führer & Weingartner GmbH', 6000, NULL, 2, 'Offen', 2, '12284', '2026-07-04', '2026-09-04', '2026-08-21', '2026-09-04', 'Kontingentpaket · Nr. 12284 · [imp:vertragssystem_kuend_2026-08:21]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:21]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='INDUSTRIE- UND TANKANLAGEN Führer & Weingartner GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'MEDIAN Klinik Hohenlohe Bad Mergentheim', 10000, NULL, 4, 'Offen', 1, '2603013', '2026-05-18', '2026-09-17', '2026-08-17', '2026-09-17', 'Kontingentvertrag · Nr. 2603013 · [imp:vertragssystem_kuend_2026-08:22]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:22]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='MEDIAN Klinik Hohenlohe Bad Mergentheim' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Caritasverband e.V. Pforzheim', 0, NULL, 12, 'Offen', 1, '11549', '2025-11-28', '2026-11-27', '2026-08-27', '2026-11-27', 'Social Media · Nr. 11549 · [imp:vertragssystem_kuend_2026-08:23]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:23]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Caritasverband e.V. Pforzheim' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-13', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Oberlin e.V.', 0, NULL, 12, 'Offen', 1, '11606', '2025-11-14', '2026-11-13', '2026-08-13', '2026-11-13', 'Karriereseite · Nr. 11606 · [imp:vertragssystem_kuend_2026-08:24]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:24]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Oberlin e.V.' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-02', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Karl Roth Straßen- und Tiefbau GmbH & Co KG', 0, NULL, 12, 'Offen', 2, '2', '2025-11-03', '2026-11-02', '2026-08-02', '2026-11-02', 'Karriereseite · Nr. 2 · [imp:vertragssystem_kuend_2026-08:25]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:25]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Karl Roth Straßen- und Tiefbau GmbH & Co KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-04', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'Braumann Haustechnik GmbH', 4000, NULL, 2, 'Offen', 3, 'AN26-4633', '2026-07-04', '2026-09-04', '2026-08-04', '2026-09-04', 'RaaS · Nr. AN26-4633 · [imp:vertragssystem_kuend_2026-08:26]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:26]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Braumann Haustechnik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-08', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'FMG | Fahrzeugbau – Maschinenbau GmbH', 5000, NULL, 2, 'Offen', 3, 'AN26-3717', '2026-07-08', '2026-09-08', '2026-08-08', '2026-09-08', 'Kontingentmodell · Nr. AN26-3717 · [imp:vertragssystem_kuend_2026-08:27]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:27]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='FMG | Fahrzeugbau – Maschinenbau GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-13', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'TWF International GmbH', 4000, NULL, 2, 'Offen', 2, 'AN25-3812', '2026-07-13', '2026-09-13', '2026-08-13', '2026-09-13', 'Kontingentmodell · Nr. AN25-3812 · [imp:vertragssystem_kuend_2026-08:28]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:28]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='TWF International GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'REFORM Fenster GmbH', 6000, NULL, 2, 'Offen', 2, 'AN26-3989', '2026-07-27', '2026-09-27', '2026-08-27', '2026-09-27', 'RaaS · Nr. AN26-3989 · [imp:vertragssystem_kuend_2026-08:29]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:29]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='REFORM Fenster GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'SBT Steuerberatungs GmbH & Co KG', 6000, NULL, 2, 'Offen', 2, 'AN26-4000', '2026-07-27', '2026-09-27', '2026-08-27', '2026-09-27', 'RaaS · Nr. AN26-4000 · [imp:vertragssystem_kuend_2026-08:30]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:30]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='SBT Steuerberatungs GmbH & Co KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-28', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'Farm-ING Smart Farm Equipment FlexCo', 5000, NULL, 2, 'Offen', 2, 'AN26-3796', '2026-07-28', '2026-09-28', '2026-08-28', '2026-09-28', 'Kontingentmodell · Nr. AN26-3796 · [imp:vertragssystem_kuend_2026-08:31]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:31]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Farm-ING Smart Farm Equipment FlexCo' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Cargomind (Austria) GmbH', 9000, NULL, 2, 'Offen', 2, 'AN26-3878', '2026-07-29', '2026-09-29', '2026-08-29', '2026-09-29', 'RaaS · Nr. AN26-3878 · [imp:vertragssystem_kuend_2026-08:32]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:32]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Cargomind (Austria) GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-02', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'CLEANTEC hygiene technology gmbh', 4998, NULL, 3, 'Offen', 2, 'AN26-3803', '2026-06-03', '2026-09-02', '2026-08-02', '2026-09-02', 'Kontingentmodell · Nr. AN26-3803 · [imp:vertragssystem_kuend_2026-08:33]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:33]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='CLEANTEC hygiene technology gmbh' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-09', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Behandlungszentrum Aschau GmbH', 13500, NULL, 3, 'Offen', 2, '2606045', '2026-06-10', '2026-09-09', '2026-08-09', '2026-09-09', 'Poolvertrag · Nr. 2606045 · [imp:vertragssystem_kuend_2026-08:34]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:34]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Behandlungszentrum Aschau GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Tiroler Hospiz Betriebsgesellschaft m.b.H.', 3000, NULL, 1, 'Offen', 3, 'AB26-2058', '2026-08-12', '2026-09-12', '2026-08-29', '2026-09-12', 'Kontingentmodell · Nr. AB26-2058 · [imp:vertragssystem_kuend_2026-08:35]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:35]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Tiroler Hospiz Betriebsgesellschaft m.b.H.' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Tank - Technik - Handel Meiwes GmbH', 9000, NULL, 2, 'Offen', 1, '2606046', '2026-07-09', '2026-09-09', '2026-08-26', '2026-09-09', 'Kontingentpaket · Nr. 2606046 · [imp:vertragssystem_kuend_2026-08:36]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:36]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Tank - Technik - Handel Meiwes GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-10', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Klinik Schöneberg GmbH', 13500, NULL, 3, 'Offen', 2, 'BK-12457', '2026-06-11', '2026-09-10', '2026-08-10', '2026-09-10', 'Poolvertrag · Nr. BK-12457 · [imp:vertragssystem_kuend_2026-08:37]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:37]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Klinik Schöneberg GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'G. Steinkühler Transporte GmbH & Co. KG', 13500, NULL, 3, 'Offen', 1, 'BK-12494', '2026-06-16', '2026-09-15', '2026-08-15', '2026-09-15', 'Kontingentvertrag · Nr. BK-12494 · [imp:vertragssystem_kuend_2026-08:38]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:38]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='G. Steinkühler Transporte GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-14', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Klinikum der Landeshauptstadt Stuttgart gKAöR', 13500, NULL, 3, 'Offen', 1, '2606083', '2026-06-15', '2026-09-14', '2026-08-14', '2026-09-14', 'Kontingentpaket · Nr. 2606083 · [imp:vertragssystem_kuend_2026-08:39]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:39]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Klinikum der Landeshauptstadt Stuttgart gKAöR' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Sanitär Kleissner GmbH', 13500, NULL, 3, 'Offen', 1, 'BK-12493', '2026-06-16', '2026-09-15', '2026-08-15', '2026-09-15', 'Kontingentvertrag · Nr. BK-12493 · [imp:vertragssystem_kuend_2026-08:40]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:40]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Sanitär Kleissner GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-11', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Hoffbauer Care gGmbH', 13500, NULL, 3, 'Offen', 1, 'BK-12473', '2026-06-12', '2026-09-11', '2026-08-11', '2026-09-11', 'Kontingentvertrag · Nr. BK-12473 · [imp:vertragssystem_kuend_2026-08:41]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:41]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Hoffbauer Care gGmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-14', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Gemeinnützige Heimbetriebsgesellschaft mbH Kirchberg', 13500, NULL, 3, 'Offen', 1, 'BK-12492', '2026-06-15', '2026-09-14', '2026-08-14', '2026-09-14', 'Poolvertrag · Nr. BK-12492 · [imp:vertragssystem_kuend_2026-08:42]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:42]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Gemeinnützige Heimbetriebsgesellschaft mbH Kirchberg' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-16', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Deutsches Rotes Kreuz Kreisverband Grafschaft Bentheim e. V.', 13500, NULL, 3, 'Offen', 1, 'BK-12461', '2026-06-17', '2026-09-16', '2026-08-16', '2026-09-16', 'Poolvertrag · Nr. BK-12461 · [imp:vertragssystem_kuend_2026-08:43]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:43]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Deutsches Rotes Kreuz Kreisverband Grafschaft Bentheim e. V.' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-18', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'AllDent Holding GmbH', 13500, NULL, 3, 'Offen', 1, 'BK-12346', '2026-06-19', '2026-09-18', '2026-08-18', '2026-09-18', 'Poolvertrag · Nr. BK-12346 · [imp:vertragssystem_kuend_2026-08:44]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:44]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='AllDent Holding GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-07', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Helmuth Schiller GesmbH', 4050, NULL, 2, 'Offen', 2, 'An26-4204', '2026-06-22', '2026-08-21', '2026-08-07', '2026-08-21', 'RaaS · Nr. An26-4204 · [imp:vertragssystem_kuend_2026-08:45]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:45]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Helmuth Schiller GesmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'medicalnetworks CJ GmbH & Co. KG', 13500, NULL, 3, 'Offen', 1, 'BK-12501', '2026-06-22', '2026-09-21', '2026-08-21', '2026-09-21', 'Poolvertrag · Nr. BK-12501 · [imp:vertragssystem_kuend_2026-08:46]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:46]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='medicalnetworks CJ GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-23', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Vulpius Klinik GmbH', 13500, NULL, 3, 'Offen', 1, 'BK-12522', '2026-06-24', '2026-09-23', '2026-08-23', '2026-09-23', 'Poolvertrag · Nr. BK-12522 · [imp:vertragssystem_kuend_2026-08:47]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:47]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Vulpius Klinik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Kinderhospiz & Junges Wohnen Haus ANNA gGmbH', 18000, NULL, 4, 'Offen', 1, 'BK-12507', '2026-06-25', '2026-10-24', '2026-08-24', '2026-10-24', 'Kontingentvertrag · Nr. BK-12507 · [imp:vertragssystem_kuend_2026-08:48]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:48]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Kinderhospiz & Junges Wohnen Haus ANNA gGmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-25', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Physio in Baienfurt GmbH & Co. KG', 13500, NULL, 3, 'Offen', 1, 'TR-14315', '2026-06-26', '2026-09-25', '2026-08-25', '2026-09-25', 'Poolvertrag · Nr. TR-14315 · [imp:vertragssystem_kuend_2026-08:49]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:49]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Physio in Baienfurt GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-28', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'F + T Müller GmbH', 13500, NULL, 3, 'Offen', 1, 'BK-12536', '2026-06-29', '2026-09-28', '2026-08-28', '2026-09-28', 'Kontingentpaket · Nr. BK-12536 · [imp:vertragssystem_kuend_2026-08:50]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:50]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='F + T Müller GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Blank GmbH & Co. KG', 13500, NULL, 3, 'Offen', 1, 'BK-12534', '2026-06-30', '2026-09-29', '2026-08-29', '2026-09-29', 'Poolvertrag · Nr. BK-12534 · [imp:vertragssystem_kuend_2026-08:51]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:51]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Blank GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'AWO Karlsruhe gGmbH', 13500, NULL, 3, 'Offen', 1, 'BK-12530', '2026-06-30', '2026-09-29', '2026-08-29', '2026-09-29', 'Poolvertrag · Nr. BK-12530 · [imp:vertragssystem_kuend_2026-08:52]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:52]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='AWO Karlsruhe gGmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Sergio Velardo' ORDER BY aktiv DESC, id LIMIT 1), 'Philia Intensiv Brandenburg GmbH & Co. KG', 13500, NULL, 3, 'Offen', 1, 'BK-125', '2026-06-30', '2026-09-29', '2026-08-29', '2026-09-29', 'Kontingentvertrag · Nr. BK-125 · [imp:vertragssystem_kuend_2026-08:53]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:53]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Philia Intensiv Brandenburg GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-01', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'JP Kanaltechnik GmbH', 5400, NULL, 2, 'Offen', 2, 'AN26-4366', '2026-07-02', '2026-09-01', '2026-08-01', '2026-09-01', 'RaaS · Nr. AN26-4366 · [imp:vertragssystem_kuend_2026-08:54]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:54]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='JP Kanaltechnik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-01', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'ENERCONT GmbH', 2934, NULL, 2, 'Offen', 2, 'AN26-4383', '2026-07-02', '2026-09-01', '2026-08-01', '2026-09-01', 'RaaS · Nr. AN26-4383 · [imp:vertragssystem_kuend_2026-08:55]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:55]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='ENERCONT GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-25', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Fritz Logistik GmbH', 5800, NULL, 1, 'Offen', 2, '2607078', '2026-08-08', '2026-09-08', '2026-08-25', '2026-09-08', 'Kontingentpaket · Nr. 2607078 · [imp:vertragssystem_kuend_2026-08:56]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:56]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Fritz Logistik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-06', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Dustin Mischak' ORDER BY aktiv DESC, id LIMIT 1), 'Reiter Gebäudetechnik GmbH', 9000, NULL, 2, 'Offen', 2, '2607030', '2026-07-07', '2026-09-06', '2026-08-06', '2026-09-06', 'Kontingentpaket · Nr. 2607030 · [imp:vertragssystem_kuend_2026-08:57]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:57]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Reiter Gebäudetechnik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-08', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'EBSTER BAU Gesellschaft m.b.H.', 4400, NULL, 2, 'Offen', 2, 'AN26-4444', '2026-07-09', '2026-09-08', '2026-08-08', '2026-09-08', 'RaaS · Nr. AN26-4444 · [imp:vertragssystem_kuend_2026-08:58]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:58]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='EBSTER BAU Gesellschaft m.b.H.' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-09', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'Veit DER GERÜSTBAUER GmbH', 3280, NULL, 2, 'Offen', 2, 'AB26-2120', '2026-07-10', '2026-09-09', '2026-08-09', '2026-09-09', 'RaaS · Nr. AB26-2120 · [imp:vertragssystem_kuend_2026-08:59]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:59]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Veit DER GERÜSTBAUER GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-09', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Sobota Bau & Trockenbau GmbH', 3600, NULL, 2, 'Offen', 2, 'AB26-2122', '2026-07-10', '2026-09-09', '2026-08-09', '2026-09-09', 'Kontingentmodell · Nr. AB26-2122 · [imp:vertragssystem_kuend_2026-08:60]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:60]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Sobota Bau & Trockenbau GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-05', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Dustin Mischak' ORDER BY aktiv DESC, id LIMIT 1), 'Kurt A. Behrmann Wäschereimaschinen und Reinigungsanlagen GmbH', 9000, NULL, 2, 'Offen', 2, '2607007', '2026-07-06', '2026-09-05', '2026-08-05', '2026-09-05', 'Kontingentpaket · Nr. 2607007 · [imp:vertragssystem_kuend_2026-08:61]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:61]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Kurt A. Behrmann Wäschereimaschinen und Reinigungsanlagen GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-08', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Schweißtechnik Zimmermann GmbH', 9000, NULL, 2, 'Offen', 2, '2607070', '2026-07-09', '2026-09-08', '2026-08-08', '2026-09-08', 'Kontingentpaket · Nr. 2607070 · [imp:vertragssystem_kuend_2026-08:62]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:62]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Schweißtechnik Zimmermann GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'B & L Kälte-Klimatechnik GmbH & Co. KG', 9000, NULL, 2, 'Offen', 1, '2607043', '2026-07-16', '2026-09-15', '2026-08-15', '2026-09-15', 'Kontingentpaket · Nr. 2607043 · [imp:vertragssystem_kuend_2026-08:63]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:63]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='B & L Kälte-Klimatechnik GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-13', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'H&W Haustechnik GmbH', 9000, NULL, 2, 'Offen', 1, '2607016', '2026-07-14', '2026-09-13', '2026-08-13', '2026-09-13', 'Kontingentpaket · Nr. 2607016 · [imp:vertragssystem_kuend_2026-08:64]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:64]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='H&W Haustechnik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-16', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Dustin Mischak' ORDER BY aktiv DESC, id LIMIT 1), 'Köhl GmbH', 18000, NULL, 2, 'Offen', 1, '2607155', '2026-07-17', '2026-09-16', '2026-08-16', '2026-09-16', 'Kontingentpaket · Nr. 2607155 · [imp:vertragssystem_kuend_2026-08:65]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:65]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Köhl GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-19', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Rümmelin Baustoffe GmbH', 0, NULL, 2, 'Offen', 1, '2607165', '2026-07-20', '2026-09-19', '2026-08-19', '2026-09-19', 'Poolvertrag · Nr. 2607165 · [imp:vertragssystem_kuend_2026-08:66]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:66]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Rümmelin Baustoffe GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-20', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Herrmann Bäder Wärme Wasser GmbH', 0, NULL, 2, 'Offen', 1, '2607174', '2026-07-21', '2026-09-20', '2026-08-20', '2026-09-20', 'Poolvertrag · Nr. 2607174 · [imp:vertragssystem_kuend_2026-08:67]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:67]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Herrmann Bäder Wärme Wasser GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-19', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Reichel & Steinmetz GmbH', 9000, NULL, 2, 'Offen', 1, '2607069', '2026-07-20', '2026-09-19', '2026-08-19', '2026-09-19', 'Poolvertrag · Nr. 2607069 · [imp:vertragssystem_kuend_2026-08:68]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:68]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Reichel & Steinmetz GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-20', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'AAD Kanaltechnik Spindler GmbH & Co. KG', 0, NULL, 2, 'Offen', 1, '2607185', '2026-07-21', '2026-09-20', '2026-08-20', '2026-09-20', 'Poolvertrag · Nr. 2607185 · [imp:vertragssystem_kuend_2026-08:69]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:69]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='AAD Kanaltechnik Spindler GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Urbetho CF GmbH', 0, NULL, 2, 'Offen', 1, '2607179', '2026-07-22', '2026-09-21', '2026-08-21', '2026-09-21', 'Poolvertrag · Nr. 2607179 · [imp:vertragssystem_kuend_2026-08:70]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:70]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Urbetho CF GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-23', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Schurr - Die Badgestalter GmbH', 9000, NULL, 2, 'Offen', 1, '2607121', '2026-07-24', '2026-09-23', '2026-08-23', '2026-09-23', 'Poolvertrag · Nr. 2607121 · [imp:vertragssystem_kuend_2026-08:71]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:71]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Schurr - Die Badgestalter GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'Egger Bau GmbH', 5400, NULL, 2, 'Offen', 1, 'AN25-5580', '2026-07-27', '2026-09-26', '2026-08-26', '2026-09-26', 'RaaS · Nr. AN25-5580 · [imp:vertragssystem_kuend_2026-08:72]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:72]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Egger Bau GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-25', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Augustinum Ambulanter Pflegedienst Krefeld GmbH', 9000, NULL, 2, 'Offen', 1, 'BK-12625', '2026-07-26', '2026-09-25', '2026-08-25', '2026-09-25', 'Poolvertrag · Nr. BK-12625 · [imp:vertragssystem_kuend_2026-08:73]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:73]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Augustinum Ambulanter Pflegedienst Krefeld GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Natuvion Austria GmbH', 5400, NULL, 2, 'Offen', 1, 'AB26-2135', '2026-07-27', '2026-09-26', '2026-08-26', '2026-09-26', 'RaaS · Nr. AB26-2135 · [imp:vertragssystem_kuend_2026-08:74]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:74]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Natuvion Austria GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-22', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Wäscherei Grete Rommel GmbH', 9000, NULL, 2, 'Offen', 1, '2607211', '2026-07-23', '2026-09-22', '2026-08-22', '2026-09-22', 'Kontingentpaket · Nr. 2607211 · [imp:vertragssystem_kuend_2026-08:75]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:75]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Wäscherei Grete Rommel GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-23', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Autohaus Wernigerode GmbH', 9000, NULL, 2, 'Offen', 1, '2607213', '2026-07-24', '2026-09-23', '2026-08-23', '2026-09-23', 'Kontingentpaket · Nr. 2607213 · [imp:vertragssystem_kuend_2026-08:76]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:76]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Autohaus Wernigerode GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Luftan Lufttechnische Anlagen Bau GmbH', 9000, NULL, 2, 'Offen', 1, '2607176', '2026-07-27', '2026-09-26', '2026-08-26', '2026-09-26', 'Kontingentpaket · Nr. 2607176 · [imp:vertragssystem_kuend_2026-08:77]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:77]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Luftan Lufttechnische Anlagen Bau GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'HeizungsSanitärService GmbH', 9000, NULL, 2, 'Offen', 1, '2607139', '2026-07-27', '2026-09-26', '2026-08-26', '2026-09-26', 'Kontingentpaket · Nr. 2607139 · [imp:vertragssystem_kuend_2026-08:78]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:78]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='HeizungsSanitärService GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name='Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Hartlauer Handelsgesellschaft m.b.H.', 5238, NULL, 2, 'Offen', 1, 'AN26-4174', '2026-07-28', '2026-09-27', '2026-08-27', '2026-09-27', 'RaaS · Nr. AN26-4174 · [imp:vertragssystem_kuend_2026-08:79]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:79]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Hartlauer Handelsgesellschaft m.b.H.' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-28', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Stollberg International GmbH', 9000, NULL, 2, 'Offen', 1, 'TR-14345', '2026-07-29', '2026-09-28', '2026-08-28', '2026-09-28', 'Kontingentpaket · Nr. TR-14345 · [imp:vertragssystem_kuend_2026-08:80]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:80]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Stollberg International GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-28', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'NAUMANN PUMPEN GmbH', 9000, NULL, 2, 'Offen', 1, '2607249', '2026-07-29', '2026-09-28', '2026-08-28', '2026-09-28', 'Kontingentpaket · Nr. 2607249 · [imp:vertragssystem_kuend_2026-08:81]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:81]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='NAUMANN PUMPEN GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'OWB - Wohnheime - Einrichtungen - ambulante Dienste gem. GmbH', 9000, NULL, 2, 'Offen', 1, 'BK-12640', '2026-07-31', '2026-09-29', '2026-08-29', '2026-09-29', 'Kontingentvertrag · Nr. BK-12640 · [imp:vertragssystem_kuend_2026-08:82]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:82]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='OWB - Wohnheime - Einrichtungen - ambulante Dienste gem. GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'ETL Lang & Kollegen Steuerberatungsgesellschaft mbH', 9000, NULL, 2, 'Offen', 1, '2607251', '2026-07-30', '2026-09-29', '2026-08-29', '2026-09-29', 'Kontingentpaket · Nr. 2607251 · [imp:vertragssystem_kuend_2026-08:83]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:83]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='ETL Lang & Kollegen Steuerberatungsgesellschaft mbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Klar GmbH & Co. KG', 9000, NULL, 2, 'Offen', 1, '2607249', '2026-07-30', '2026-09-29', '2026-08-29', '2026-09-29', 'Kontingentpaket · Nr. 2607249 · [imp:vertragssystem_kuend_2026-08:84]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:84]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Klar GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Emeran Braun GmbH & Co. KG', 9000, NULL, 2, 'Offen', 1, '2608004', '2026-07-30', '2026-09-29', '2026-08-29', '2026-09-29', 'Kontingentpaket · Nr. 2608004 · [imp:vertragssystem_kuend_2026-08:85]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:85]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='Emeran Braun GmbH & Co. KG' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsnummer, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name='fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name='Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'EFT Eschenbacher Flachdachtechnik GmbH', 5800, NULL, 1, 'Offen', 1, '2608060', '2026-08-10', '2026-09-09', '2026-08-26', '2026-09-09', 'Kontingentpaket · Nr. 2608060 · [imp:vertragssystem_kuend_2026-08:86]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name='fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_kuend_2026-08:86]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat='2026-08' AND kunde='EFT Eschenbacher Flachdachtechnik GmbH' AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_kuend_%'));
