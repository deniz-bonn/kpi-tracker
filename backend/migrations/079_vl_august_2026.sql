-- Migration 079: Anstehende Verlaengerungen August 2026 aus dem Vertragssystem
-- 105 Deals, status Offen, ae_wert bleibt leer (wird erst bei Realisierung gesetzt).
-- Idempotent ueber die Marke [imp:vertragssystem_2026-08:<n>] im Kommentar -- ein Doppellauf
-- fuegt nichts erneut ein. Zusaetzlich werden Kunden uebersprungen, die bereits
-- einen August-VL-Deal AUSSERHALB dieses Imports haben.
-- Kein Schreiben in ae_gesamt_monthly -- offene Deals buchen erst bei Gewonnen.

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Klinikverbund Allgäu gGmbH', 36000, NULL, 12, 'Offen', 3, '2025-08-15', '2026-08-15', '2026-06-15', '2026-08-15', 'Kombivertrag · Nr. DA 821053 · [imp:vertragssystem_2026-08:1]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:1]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Klinikverbund Allgäu gGmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-01', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Gesellschaft für diakonische Altenhilfe Gießen und Linden gGmbH', 24000, NULL, 12, 'Offen', 3, '2025-08-01', '2026-08-01', '2026-05-01', '2026-08-01', 'Social Media Betreuung · Nr. nV · [imp:vertragssystem_2026-08:2]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:2]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Gesellschaft für diakonische Altenhilfe Gießen und Linden gGmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-14', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'MVZ Gelenk-Klinik Dres Schneider, Ostermeier und Partner, Ärztepartnerschaft', 3000, NULL, 12, 'Offen', 2, '2025-08-15', '2026-08-14', '2026-05-14', '2026-08-14', 'Karriereseite · Nr. nV · [imp:vertragssystem_2026-08:3]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:3]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'MVZ Gelenk-Klinik Dres Schneider, Ostermeier und Partner, Ärztepartnerschaft'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Städtisches Krankenhaus Pirmasens gGmbH', 9000, NULL, 3, 'Offen', 5, '2026-05-29', '2026-08-29', '2026-07-29', '2026-08-29', 'Active-Sourcing · Nr. 18738 · [imp:vertragssystem_2026-08:4]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:4]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Städtisches Krankenhaus Pirmasens gGmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Verus Bonifatius Klinik', 9000, NULL, 3, 'Offen', 4, '2026-05-29', '2026-08-29', '2026-07-29', '2026-08-29', 'Active-Sourcing · Nr. 18725 · [imp:vertragssystem_2026-08:5]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:5]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Verus Bonifatius Klinik'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-12', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Lebenshilfe Bad Tölz-Wolfratshausen gGmbH', 9000, NULL, 3, 'Offen', 3, '2026-05-12', '2026-08-12', '2026-07-12', '2026-08-12', 'Kontingentvertrag · Nr. 19134 · [imp:vertragssystem_2026-08:6]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:6]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Lebenshilfe Bad Tölz-Wolfratshausen gGmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-10', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'LBS Landesbausparkasse Süd AdÖR', 9000, NULL, 3, 'Offen', 3, '2026-05-10', '2026-08-10', '2026-07-10', '2026-08-10', 'Kontingentvertrag · Nr. 18986 · [imp:vertragssystem_2026-08:7]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:7]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'LBS Landesbausparkasse Süd AdÖR'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Klinikgruppe Valens Rehakliniken Walenstadtberg und Chur', 9000, NULL, 3, 'Offen', 3, '2026-05-21', '2026-08-21', '2026-07-21', '2026-08-21', 'Kontingentvertrag · Nr. 18988 · [imp:vertragssystem_2026-08:8]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:8]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Klinikgruppe Valens Rehakliniken Walenstadtberg und Chur'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'SUAVIA Gesundheit gGmbH', 18000, NULL, 6, 'Offen', 2, '2026-02-27', '2026-08-26', '2026-06-26', '2026-08-26', 'Kontingentvertrag · Nr. Kreisspitalstiftung Weißenhorn · [imp:vertragssystem_2026-08:9]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:9]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'SUAVIA Gesundheit gGmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'LWL-Maßregelvollzugsklinik Schloss Haldem', 9000, NULL, 3, 'Offen', 3, '2026-05-24', '2026-08-24', '2026-07-24', '2026-08-24', 'Active-Sourcing · Nr. 18822 · [imp:vertragssystem_2026-08:10]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:10]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'LWL-Maßregelvollzugsklinik Schloss Haldem'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-31', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Evangelische Kliniken Gelsenkirchen GmbH', 16800, NULL, 6, 'Offen', 2, '2026-03-01', '2026-08-31', '2026-06-30', '2026-08-31', 'Kontingentvertrag · Nr. A54333 · [imp:vertragssystem_2026-08:11]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:11]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Evangelische Kliniken Gelsenkirchen GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-02', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Werner''s Metzgerei GmbH & Co. KG', 6000, NULL, 2, 'Offen', 3, '2026-06-02', '2026-08-02', '2026-07-19', '2026-08-02', 'Kontingentpaket · Nr. 11590 · [imp:vertragssystem_2026-08:12]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:12]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Werner''s Metzgerei GmbH & Co. KG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'GE Power & Grid Austria GmbH', 4000, NULL, 2, 'Offen', 4, '2026-06-21', '2026-08-21', '2026-07-21', '2026-08-21', 'Zusatzangebot · Nr. AN · [imp:vertragssystem_2026-08:13]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:13]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'GE Power & Grid Austria GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-28', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Hochdanner Sanitär- und Heizungs-GmbH', 6000, NULL, 2, 'Offen', 4, '2026-06-28', '2026-08-28', '2026-07-28', '2026-08-28', 'Hochdanner Sanitär- und Heizungs-GmbH · Nr. 12020 · [imp:vertragssystem_2026-08:14]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:14]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Hochdanner Sanitär- und Heizungs-GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dustin Mischak' ORDER BY aktiv DESC, id LIMIT 1), 'Dr. med.Sybille Hettinger- Fachärztin für Augenheilkunde', 6000, NULL, 2, 'Offen', 3, '2026-06-17', '2026-08-17', '2026-08-03', '2026-08-17', 'Kontingentvertrag · Nr. 12251 · [imp:vertragssystem_2026-08:15]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:15]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Dr. med.Sybille Hettinger- Fachärztin für Augenheilkunde'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-02', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'suedwest touristik GmbH', 6000, NULL, 2, 'Offen', 3, '2026-06-02', '2026-08-02', '2026-07-19', '2026-08-02', 'Kontingentpaket · Nr. 12206 · [imp:vertragssystem_2026-08:16]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:16]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'suedwest touristik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'EFFYCOR® GmbH', 9000, NULL, 6, 'Offen', 2, '2026-02-18', '2026-08-17', '2026-06-17', '2026-08-17', 'Social Media Betreuung inkl. Media Day · Nr. 12147 · [imp:vertragssystem_2026-08:17]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:17]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'EFFYCOR® GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Weroform GmbH', 4600, NULL, 2, 'Offen', 3, '2026-06-17', '2026-08-17', '2026-07-17', '2026-08-17', 'Weroform GmbH · Nr. 1722 · [imp:vertragssystem_2026-08:18]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:18]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Weroform GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'BBS Gebr. Berndt GmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-27', '2026-08-27', '2026-08-13', '2026-08-27', 'Kontingentvertrag · Nr. 12292 · [imp:vertragssystem_2026-08:19]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:19]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'BBS Gebr. Berndt GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-08', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'ELEKTRIZITÄTSWERK GÖSTING V. FRANZ GmbH', 4400, NULL, 2, 'Offen', 3, '2026-06-08', '2026-08-08', '2026-07-08', '2026-08-08', 'Kontingentmodell · Nr. AN26-3530 · [imp:vertragssystem_2026-08:20]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:20]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'ELEKTRIZITÄTSWERK GÖSTING V. FRANZ GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-04', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'VR-Bank Erding eG', 9000, NULL, 3, 'Offen', 2, '2026-05-05', '2026-08-04', '2026-07-04', '2026-08-04', 'Kontingentvertrag · Nr. 2602481 · [imp:vertragssystem_2026-08:21]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:21]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'VR-Bank Erding eG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-03', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Mager & Wedemeyer Werkzeugmaschinen GmbH', 4600, NULL, 2, 'Offen', 4, '2026-06-03', '2026-08-03', '2026-07-20', '2026-08-03', 'Kontingentpaket · Nr. 11459 · [imp:vertragssystem_2026-08:22]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:22]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Mager & Wedemeyer Werkzeugmaschinen GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-14', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Hermann Otto GmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-15', '2026-08-14', '2026-07-31', '2026-08-14', 'Kontingentvertrag · Nr. 2604018 · [imp:vertragssystem_2026-08:23]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:23]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Hermann Otto GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'halcö Alfred Hörtnagl GmbH', 5000, NULL, 2, 'Offen', 3, '2026-06-15', '2026-08-15', '2026-07-15', '2026-08-15', 'Kontingentmodell · Nr. AN26-3073 · [imp:vertragssystem_2026-08:24]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:24]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'halcö Alfred Hörtnagl GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Malergeschäft Näther GmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-29', '2026-08-29', '2026-08-15', '2026-08-29', 'Kontingentvertrag · Nr. 12326 · [imp:vertragssystem_2026-08:25]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:25]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Malergeschäft Näther GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'INTER-TREU Prachner Wirtschaftsprüfungs- und Steuerberatungsgesellschaft', 3750, NULL, 2, 'Offen', 4, '2026-06-21', '2026-08-21', '2026-06-21', '2026-08-21', 'Kontingentmodell · Nr. AN · [imp:vertragssystem_2026-08:26]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:26]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'INTER-TREU Prachner Wirtschaftsprüfungs- und Steuerberatungsgesellschaft'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'sicht-pack Hagner GmbH', 0, NULL, 1, 'Offen', 4, '2026-07-26', '2026-08-26', '2026-08-12', '2026-08-26', 'Kontingentpaket · Nr. 2 · [imp:vertragssystem_2026-08:27]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:27]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'sicht-pack Hagner GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Senioren-Pflegeheim...aus gutem Grund GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-27', '2026-08-27', '2026-08-13', '2026-08-27', 'RaaS · Nr. TB-14281 · [imp:vertragssystem_2026-08:28]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:28]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Senioren-Pflegeheim...aus gutem Grund GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-11', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Spital STS AG - Spital Zweisimmen', 13500, NULL, 3, 'Offen', 2, '2026-05-12', '2026-08-11', '2026-07-11', '2026-08-11', 'RaaS · Nr. BK-12386 · [imp:vertragssystem_2026-08:29]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:29]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Spital STS AG - Spital Zweisimmen'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Daniel Adams' ORDER BY aktiv DESC, id LIMIT 1), 'Niedersächsische Landeskrankenhaus AMEOS Klinikum Osnabrück', 13500, NULL, 3, 'Offen', 2, '2026-05-18', '2026-08-17', '2026-07-17', '2026-08-17', 'RaaS · Nr. 20260518 · [imp:vertragssystem_2026-08:30]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:30]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Niedersächsische Landeskrankenhaus AMEOS Klinikum Osnabrück'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-12', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Therapie-Zentrum Plettenberg GmbH', 13500, NULL, 3, 'Offen', 2, '2026-05-13', '2026-08-12', '2026-07-12', '2026-08-12', 'Kontingentpaket · Nr. 20260514-154256583 · [imp:vertragssystem_2026-08:31]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:31]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Therapie-Zentrum Plettenberg GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'newcare homes Großenbrode GmbH', 9000, NULL, 3, 'Offen', 2, '2026-05-28', '2026-08-27', '2026-07-27', '2026-08-27', 'Kontingentvertrag · Nr. 2605062 · [imp:vertragssystem_2026-08:32]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:32]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'newcare homes Großenbrode GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-16', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Deutsche Steinzeug Solar Ceramics GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-17', '2026-08-16', '2026-07-16', '2026-08-16', 'RaaS · Nr. 2605077 · [imp:vertragssystem_2026-08:33]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:33]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Deutsche Steinzeug Solar Ceramics GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-28', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'VITREA Rehazentrum Ulm GmbH', 13500, NULL, 3, 'Offen', 2, '2026-05-29', '2026-08-28', '2026-07-28', '2026-08-28', 'RaaS · Nr. 2605080 · [imp:vertragssystem_2026-08:34]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:34]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'VITREA Rehazentrum Ulm GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-30', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Gebr. Schröder Kabel- und Leitungsbau GmbH', 5800, NULL, 1, 'Offen', 3, '2026-07-30', '2026-08-30', '2026-08-23', '2026-08-30', 'Kontingentpaket · Nr. 2605082 · [imp:vertragssystem_2026-08:35]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:35]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Gebr. Schröder Kabel- und Leitungsbau GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-01', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'hzl nussdorf dr.th.kessler gmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-02', '2026-08-01', '2026-07-01', '2026-08-01', 'RaaS · Nr. AN26-3997 · [imp:vertragssystem_2026-08:36]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:36]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'hzl nussdorf dr.th.kessler gmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-01', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Ambulatorium für Endoskopie und Chirurgie Dr. Mach GmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-02', '2026-08-01', '2026-07-01', '2026-08-01', 'RaaS · Nr. AN26-4035 · [imp:vertragssystem_2026-08:37]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:37]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Ambulatorium für Endoskopie und Chirurgie Dr. Mach GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-02', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Autohaus Neubauer GesmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-03', '2026-08-02', '2026-07-02', '2026-08-02', 'RaaS · Nr. AN26-4070 · [imp:vertragssystem_2026-08:38]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:38]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Autohaus Neubauer GesmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-04', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'Herzgsell GmbH', 5000, NULL, 2, 'Offen', 2, '2026-06-05', '2026-08-04', '2026-07-04', '2026-08-04', 'Kontingentmodell · Nr. AN26-3372 · [imp:vertragssystem_2026-08:39]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:39]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Herzgsell GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-07', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Stein-Zeit Köllnreitner GmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-08', '2026-08-07', '2026-07-07', '2026-08-07', 'RaaS · Nr. AN26-4080 · [imp:vertragssystem_2026-08:40]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:40]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Stein-Zeit Köllnreitner GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-08', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Helios Ventilatoren GmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-09', '2026-08-08', '2026-07-08', '2026-08-08', 'RaaS · Nr. AN26-4052 · [imp:vertragssystem_2026-08:41]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:41]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Helios Ventilatoren GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-08', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Näther & Hübner GmbH Innen-, Außen- und Trockenputz', 6000, NULL, 2, 'Offen', 2, '2026-06-09', '2026-08-08', '2026-07-25', '2026-08-08', 'Kontingentvertrag · Nr. 2606031 · [imp:vertragssystem_2026-08:42]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:42]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Näther & Hübner GmbH Innen-, Außen- und Trockenputz'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-11', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Malergeschäft Näther GmbH', 6000, NULL, 2, 'Offen', 2, '2026-06-12', '2026-08-11', '2026-07-28', '2026-08-11', 'Kontingentvertrag · Nr. 2606031 · [imp:vertragssystem_2026-08:43]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:43]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Malergeschäft Näther GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-08', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Bonifatius Seniorendienste GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-09', '2026-08-08', '2026-07-08', '2026-08-08', 'Poolvertrag · Nr. BK-12462 · [imp:vertragssystem_2026-08:44]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:44]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Bonifatius Seniorendienste GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-09', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Katzler GmbH & Co. KG', 6000, NULL, 2, 'Offen', 2, '2026-06-10', '2026-08-09', '2026-07-09', '2026-08-09', 'RaaS · Nr. AN26-4104 · [imp:vertragssystem_2026-08:45]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:45]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Katzler GmbH & Co. KG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-09', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Joshua Arendt' ORDER BY aktiv DESC, id LIMIT 1), 'Wohngemeinschaft Heidehort GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-10', '2026-08-09', '2026-07-09', '2026-08-09', 'Poolvertrag · Nr. BK-12480 · [imp:vertragssystem_2026-08:46]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:46]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Wohngemeinschaft Heidehort GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-09', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'SWW Stahlbau Westerwald GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-10', '2026-08-09', '2026-07-09', '2026-08-09', 'Kontingentpaket · Nr. 2606041 · [imp:vertragssystem_2026-08:47]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:47]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'SWW Stahlbau Westerwald GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-09', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Prantl Roppen Erd- und Leitungsbau GmbH', 5220, NULL, 2, 'Offen', 2, '2026-06-10', '2026-08-09', '2026-07-09', '2026-08-09', 'RaaS · Nr. AN26-4101 · [imp:vertragssystem_2026-08:48]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:48]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Prantl Roppen Erd- und Leitungsbau GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-10', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'S&P Steuerberatungsgesellschaft mbH', 9000, NULL, 2, 'Offen', 2, '2026-06-11', '2026-08-10', '2026-07-27', '2026-08-10', 'Kontingentpaket · Nr. JK-13354 · [imp:vertragssystem_2026-08:49]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:49]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'S&P Steuerberatungsgesellschaft mbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-11', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Tiroler Hospiz Betriebsgesellschaft m.b.H.', 3000, NULL, 1, 'Offen', 3, '2026-07-11', '2026-08-11', '2026-07-28', '2026-08-11', 'Kontingentmodell · Nr. AB26-2058 · [imp:vertragssystem_2026-08:50]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:50]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Tiroler Hospiz Betriebsgesellschaft m.b.H.'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-10', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'zimmermann bau-gmbh', 4500, NULL, 2, 'Offen', 2, '2026-06-11', '2026-08-10', '2026-07-10', '2026-08-10', 'RaaS · Nr. AN26-4140 · [imp:vertragssystem_2026-08:51]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:51]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'zimmermann bau-gmbh'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-10', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Erich Neter GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-11', '2026-08-10', '2026-07-10', '2026-08-10', 'Poolvertrag · Nr. TR-14315 · [imp:vertragssystem_2026-08:52]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:52]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Erich Neter GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-11', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Erler Naturholzbau GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-12', '2026-08-11', '2026-07-11', '2026-08-11', 'RaaS · Nr. AN26-4144 · [imp:vertragssystem_2026-08:53]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:53]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Erler Naturholzbau GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-10', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Claus Hansen Malereibetrieb GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-11', '2026-08-10', '2026-07-27', '2026-08-10', 'Kontingentpaket · Nr. 2606034 · [imp:vertragssystem_2026-08:54]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:54]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Claus Hansen Malereibetrieb GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-11', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'eberharterbau GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-12', '2026-08-11', '2026-07-11', '2026-08-11', 'RaaS · Nr. AN26-4111 · [imp:vertragssystem_2026-08:55]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:55]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'eberharterbau GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-14', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'Längle Oberflächentechnik GmbH', 4800, NULL, 2, 'Offen', 2, '2026-06-15', '2026-08-14', '2026-07-14', '2026-08-14', 'RaaS · Nr. AN26-4060 · [imp:vertragssystem_2026-08:56]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:56]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Längle Oberflächentechnik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'Rusa GmbH', 5000, NULL, 2, 'Offen', 2, '2026-06-16', '2026-08-15', '2026-07-15', '2026-08-15', 'Kontingentmodell · Nr. AN26-3704 · [imp:vertragssystem_2026-08:57]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:57]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Rusa GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'bad2000 GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-16', '2026-08-15', '2026-07-15', '2026-08-15', 'RaaS · Nr. AN26-4168 · [imp:vertragssystem_2026-08:58]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:58]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'bad2000 GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Helmut Hinz GmbH & Co.', 500, NULL, 1, 'Offen', 3, '2026-07-26', '2026-08-26', '2026-08-12', '2026-08-26', 'Kontingentpaket · Nr. RN 10440 · [imp:vertragssystem_2026-08:59]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:59]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Helmut Hinz GmbH & Co.'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'ergo: elektronik GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-16', '2026-08-15', '2026-07-15', '2026-08-15', 'Kontingentvertrag · Nr. MS-14364 · [imp:vertragssystem_2026-08:60]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:60]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'ergo: elektronik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'MAIER-PAPIER GmbH', 4800, NULL, 2, 'Offen', 2, '2026-06-16', '2026-08-15', '2026-07-15', '2026-08-15', 'RaaS · Nr. AN26-4058 · [imp:vertragssystem_2026-08:61]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:61]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'MAIER-PAPIER GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-14', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'Robert Leitner Elektrotechnik GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-15', '2026-08-14', '2026-07-14', '2026-08-14', 'RaaS · Nr. AN25-4158 · [imp:vertragssystem_2026-08:62]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:62]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Robert Leitner Elektrotechnik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-16', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Bäckerei Ritter Lackner GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-17', '2026-08-16', '2026-07-16', '2026-08-16', 'RaaS · Nr. AN26-3974 · [imp:vertragssystem_2026-08:63]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:63]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Bäckerei Ritter Lackner GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'OBENAUF Generalunternehmung GmbH', 5000, NULL, 2, 'Offen', 2, '2026-06-18', '2026-08-17', '2026-07-17', '2026-08-17', 'Kontingentmodell · Nr. AB26-2083 · [imp:vertragssystem_2026-08:64]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:64]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'OBENAUF Generalunternehmung GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'Rödl GmbH Wirtschaftsprüfungsgesellschaft Steuerberatungsgesellschaft', 5400, NULL, 2, 'Offen', 2, '2026-06-18', '2026-08-17', '2026-07-17', '2026-08-17', 'RaaS · Nr. AN26-4211 · [imp:vertragssystem_2026-08:65]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:65]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Rödl GmbH Wirtschaftsprüfungsgesellschaft Steuerberatungsgesellschaft'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'ZYNP Europe GmbH', 4500, NULL, 1, 'Offen', 2, '2026-07-17', '2026-08-17', '2026-08-10', '2026-08-17', 'Kontingentpaket · Nr. 2606104 · [imp:vertragssystem_2026-08:66]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:66]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'ZYNP Europe GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'Swissport Cargo Services Austria GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-18', '2026-08-17', '2026-07-17', '2026-08-17', 'RaaS · Nr. AB26-2084 · [imp:vertragssystem_2026-08:67]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:67]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Swissport Cargo Services Austria GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-18', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'A + S Anlagenbau und Service GmbH', 9000, NULL, 2, 'Offen', 1, '2026-06-19', '2026-08-18', '2026-08-04', '2026-08-18', 'Kontingentpaket · Nr. 2606117 · [imp:vertragssystem_2026-08:68]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:68]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'A + S Anlagenbau und Service GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-17', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Ernst Hinze GmbH & Co. KG', 9000, NULL, 2, 'Offen', 2, '2026-06-18', '2026-08-17', '2026-08-03', '2026-08-17', 'Kontingentpaket · Nr. 20260507-133421952 · [imp:vertragssystem_2026-08:69]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:69]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Ernst Hinze GmbH & Co. KG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'Christian Huber Karosseriefachbetrieb GmbH', 4400, NULL, 2, 'Offen', 2, '2026-06-22', '2026-08-21', '2026-07-21', '2026-08-21', 'RaaS · Nr. AN26-4242 · [imp:vertragssystem_2026-08:70]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:70]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Christian Huber Karosseriefachbetrieb GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-22', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Seniorenstift Ingelfingen GmbH', 5800, NULL, 1, 'Offen', 2, '2026-07-22', '2026-08-22', '2026-08-15', '2026-08-22', 'Kontingentvertrag · Nr. MS-14380 · [imp:vertragssystem_2026-08:71]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:71]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Seniorenstift Ingelfingen GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Helmuth Schiller GesmbH', 4050, NULL, 2, 'Offen', 1, '2026-06-22', '2026-08-21', '2026-08-07', '2026-08-21', 'RaaS · Nr. An26-4204 · [imp:vertragssystem_2026-08:72]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:72]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Helmuth Schiller GesmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-22', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'PFISTERER Gesellschaft m.b.H.', 5400, NULL, 2, 'Offen', 2, '2026-06-23', '2026-08-22', '2026-07-22', '2026-08-22', 'RaaS · Nr. AN26-4283 · [imp:vertragssystem_2026-08:73]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:73]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'PFISTERER Gesellschaft m.b.H.'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-22', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Pöttinger Landtechnik GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-23', '2026-08-22', '2026-07-22', '2026-08-22', 'RaaS · Nr. AN26-4172 · [imp:vertragssystem_2026-08:74]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:74]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Pöttinger Landtechnik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-23', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'S & G Stahlbauservice GmbH & Co. KG', 9000, NULL, 2, 'Offen', 1, '2026-06-24', '2026-08-23', '2026-08-09', '2026-08-23', 'Kontingentpaket · Nr. 2606124 · [imp:vertragssystem_2026-08:75]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:75]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'S & G Stahlbauservice GmbH & Co. KG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-23', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'WIDMOSER Wirtschaftsprüfungs- und Steuerberatungsgesellschaft mbH', 5400, NULL, 2, 'Offen', 2, '2026-06-24', '2026-08-23', '2026-07-23', '2026-08-23', 'RaaS · Nr. AN26-4280 · [imp:vertragssystem_2026-08:76]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:76]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'WIDMOSER Wirtschaftsprüfungs- und Steuerberatungsgesellschaft mbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-23', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'RS Rohrlaser Stanztec GmbH', 5100, NULL, 2, 'Offen', 2, '2026-06-24', '2026-08-23', '2026-07-23', '2026-08-23', 'Raas · Nr. AB26-2096 · [imp:vertragssystem_2026-08:77]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:77]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'RS Rohrlaser Stanztec GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'Holzbau Heim GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-25', '2026-08-24', '2026-07-24', '2026-08-24', 'RaaS · Nr. AN26-4304 · [imp:vertragssystem_2026-08:78]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:78]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Holzbau Heim GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'Herbert KNEITZ GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-25', '2026-08-24', '2026-07-24', '2026-08-24', 'RaaS · Nr. AN26-4281 · [imp:vertragssystem_2026-08:79]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:79]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Herbert KNEITZ GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-23', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Schemberg GmbH & Co. KG', 9000, NULL, 2, 'Offen', 2, '2026-06-24', '2026-08-23', '2026-07-23', '2026-08-23', 'Kontingentpaket · Nr. 2606161 · [imp:vertragssystem_2026-08:80]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:80]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Schemberg GmbH & Co. KG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-22', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Bildungs- und Kooperationsgesellschaft Burgenlandkreis mbH', 9000, NULL, 2, 'Offen', 2, '2026-06-23', '2026-08-22', '2026-07-22', '2026-08-22', 'Poolvertrag · Nr. BK-12511 · [imp:vertragssystem_2026-08:81]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:81]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Bildungs- und Kooperationsgesellschaft Burgenlandkreis mbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Karl Traub Gebäudetechnik GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-25', '2026-08-24', '2026-07-24', '2026-08-24', 'Kontingentpaket · Nr. 2606160 · [imp:vertragssystem_2026-08:82]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:82]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Karl Traub Gebäudetechnik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'rehalife GmbH', 9000, NULL, 2, 'Offen', 2, '2026-06-25', '2026-08-24', '2026-07-24', '2026-08-24', 'Kontingentvertrag · Nr. BK-12515 · [imp:vertragssystem_2026-08:83]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:83]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'rehalife GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'AnlagenPlan Planungs- und Bauleitungsbüro für elektro- und haustechnische Anlagen GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-25', '2026-08-24', '2026-07-24', '2026-08-24', 'RaaS · Nr. AB26-2100 · [imp:vertragssystem_2026-08:84]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:84]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'AnlagenPlan Planungs- und Bauleitungsbüro für elektro- und haustechnische Anlagen GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-25', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'SWACRIT systems GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-26', '2026-08-25', '2026-07-25', '2026-08-25', 'RaaS · Nr. AN26-4319 · [imp:vertragssystem_2026-08:85]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:85]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'SWACRIT systems GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-25', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'DialogDirect Marketing GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-26', '2026-08-25', '2026-07-25', '2026-08-25', 'RaaS · Nr. AN26-4298 · [imp:vertragssystem_2026-08:86]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:86]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'DialogDirect Marketing GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-25', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'Norbert Pilz GmbH', 4800, NULL, 2, 'Offen', 2, '2026-06-26', '2026-08-25', '2026-07-25', '2026-08-25', 'RaaS · Nr. AN26-4330 · [imp:vertragssystem_2026-08:87]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:87]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Norbert Pilz GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Spezialklinik Neukirchen GmbH & Co. KG', 5800, NULL, 2, 'Offen', 1, '2026-06-25', '2026-08-24', '2026-08-10', '2026-08-24', 'RaaS · Nr. BK-12525 · [imp:vertragssystem_2026-08:88]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:88]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Spezialklinik Neukirchen GmbH & Co. KG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-28', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'SANIPLUS Krethen e.U.', 5400, NULL, 2, 'Offen', 2, '2026-06-29', '2026-08-28', '2026-07-28', '2026-08-28', 'RaaS · Nr. AB26-2102 · [imp:vertragssystem_2026-08:89]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:89]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'SANIPLUS Krethen e.U.'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-24', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'GEMA - Technik GmbH', 9000, NULL, 2, 'Offen', 1, '2026-06-25', '2026-08-24', '2026-08-10', '2026-08-24', 'Kontingentpaket · Nr. 2606131 · [imp:vertragssystem_2026-08:90]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:90]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'GEMA - Technik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-28', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Matthias Niedermoser' ORDER BY aktiv DESC, id LIMIT 1), 'Karl Flanyek GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-29', '2026-08-28', '2026-07-28', '2026-08-28', 'RaaS · Nr. AN26-4331 · [imp:vertragssystem_2026-08:91]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:91]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Karl Flanyek GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'Hoch- und Tiefbau GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-30', '2026-08-29', '2026-07-29', '2026-08-29', 'RaaS · Nr. AN26-4300 · [imp:vertragssystem_2026-08:92]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:92]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Hoch- und Tiefbau GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-25', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Otto Hauch GmbH & Co. KG', 9000, NULL, 2, 'Offen', 1, '2026-06-26', '2026-08-25', '2026-08-11', '2026-08-25', 'Kontingentpaket · Nr. 2606151 · [imp:vertragssystem_2026-08:93]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:93]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Otto Hauch GmbH & Co. KG'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-29', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Krüger + Voigt Internationale Spedition GmbH', 8000, NULL, 2, 'Offen', 2, '2026-06-30', '2026-08-29', '2026-07-29', '2026-08-29', 'Kontingentpaket · Nr. 2606203 · [imp:vertragssystem_2026-08:94]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:94]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Krüger + Voigt Internationale Spedition GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-31', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Pretterhofer Gastronomie und Kältetechnik GmbH', 5400, NULL, 2, 'Offen', 2, '2026-07-01', '2026-08-31', '2026-07-31', '2026-08-31', 'RaaS · Nr. AB26-2106 · [imp:vertragssystem_2026-08:95]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:95]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Pretterhofer Gastronomie und Kältetechnik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-31', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Stefan Morawitz' ORDER BY aktiv DESC, id LIMIT 1), 'Paul Koppenwallner GmbH', 5400, NULL, 2, 'Offen', 2, '2026-07-01', '2026-08-31', '2026-07-31', '2026-08-31', 'RaaS · Nr. AN26-4356 · [imp:vertragssystem_2026-08:96]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:96]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Paul Koppenwallner GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-31', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Spedition und Logistik Haaren Keimeier und Finke GmbH', 9000, NULL, 2, 'Offen', 2, '2026-07-01', '2026-08-31', '2026-07-31', '2026-08-31', 'Kontingentpaket · Nr. 2606220 · [imp:vertragssystem_2026-08:97]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:97]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Spedition und Logistik Haaren Keimeier und Finke GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-01', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Alexander Korak' ORDER BY aktiv DESC, id LIMIT 1), 'GW St. Pölten Integrative Betriebe GmbH', 5400, NULL, 2, 'Offen', 2, '2026-06-02', '2026-08-01', '2026-07-01', '2026-08-01', 'RaaS · Nr. AN26-4382 · [imp:vertragssystem_2026-08:98]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:98]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'GW St. Pölten Integrative Betriebe GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-21', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Ralf Hardung Kaminbau GmbH', 5800, NULL, 1, 'Offen', 1, '2026-07-08', '2026-08-21', '2026-08-07', '2026-08-21', 'Kontingentpaket · Nr. 2607011 · [imp:vertragssystem_2026-08:99]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:99]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Ralf Hardung Kaminbau GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-15', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Geschwister Stevens GmbH', 5800, NULL, 1, 'Offen', 2, '2026-07-02', '2026-08-15', '2026-08-01', '2026-08-15', 'Kontingentpaket · Nr. 2607017 · [imp:vertragssystem_2026-08:100]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:100]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Geschwister Stevens GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-07', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'Fritz Logistik GmbH', 5800, NULL, 1, 'Offen', 2, '2026-07-08', '2026-08-07', '2026-07-24', '2026-08-07', 'Kontingentpaket · Nr. 2607078 · [imp:vertragssystem_2026-08:101]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:101]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Fritz Logistik GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-19', '2026-08', (SELECT id FROM companies WHERE name = 'Morawitz' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Lukas Riegler' ORDER BY aktiv DESC, id LIMIT 1), 'Zirngast Fenster-Türen GesmbH', 5000, NULL, 2, 'Offen', 2, '2026-06-20', '2026-08-19', '2026-07-19', '2026-08-19', 'Kontingentmodell · Nr. AB26-2074 · [imp:vertragssystem_2026-08:102]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'Morawitz')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:102]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Zirngast Fenster-Türen GesmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-13', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Rene Friedl' ORDER BY aktiv DESC, id LIMIT 1), 'Karl Ulrich Bauunternehmen GmbH & Co.', 4600, NULL, 2, 'Offen', 4, '2026-06-13', '2026-08-13', '2026-07-30', '2026-08-13', 'Kontingentpaket · Nr. 12070 · [imp:vertragssystem_2026-08:103]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:103]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Karl Ulrich Bauunternehmen GmbH & Co.'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-26', '2026-08', (SELECT id FROM companies WHERE name = 'fach.digital' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Dustin Mischak' ORDER BY aktiv DESC, id LIMIT 1), 'Ostermann Leverkusen GmbH', 5800, NULL, 1, 'Offen', 1, '2026-07-13', '2026-08-26', '2026-08-12', '2026-08-26', 'Kontingentpaket · Nr. 2607102 · [imp:vertragssystem_2026-08:104]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'fach.digital')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:104]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'Ostermann Leverkusen GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));

INSERT INTO deals_vl (datum, monat, company_id, kam_id, kunde, angebotswert, ae_wert, laufzeit_monate, status, wie_vielt_verlaengerung, vertragsbeginn, ende_laufzeit, ende_kuendigungsfrist, auslaufend_am, kommentar)
SELECT '2026-08-27', '2026-08', (SELECT id FROM companies WHERE name = 'High Office IT' ORDER BY id LIMIT 1), (SELECT id FROM employees WHERE name = 'Adrian Röse' ORDER BY aktiv DESC, id LIMIT 1), 'ZaK Zentrum für ambulante Krankenpflege GmbH', 5800, NULL, 2, 'Offen', 1, '2026-07-28', '2026-08-27', '2026-08-13', '2026-08-27', 'Kontingentvertrag · Nr. BK-12630 · [imp:vertragssystem_2026-08:105]'
WHERE EXISTS (SELECT 1 FROM companies WHERE name = 'High Office IT')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE kommentar LIKE '%[imp:vertragssystem_2026-08:105]%')
  AND NOT EXISTS (SELECT 1 FROM deals_vl WHERE monat = '2026-08' AND kunde = 'ZaK Zentrum für ambulante Krankenpflege GmbH'
                    AND (kommentar IS NULL OR kommentar NOT LIKE '%vertragssystem_2026-08%'));
