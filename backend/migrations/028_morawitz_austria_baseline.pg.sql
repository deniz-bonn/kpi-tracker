-- Migration 028: Morawitz Consulting Österreich Baseline 2026

-- 1. Österreichische Mitarbeiter (idempotent)
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Stefan Morawitz', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Stefan Morawitz' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Sükrü Boydas', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Sükrü Boydas' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Manuel Zimmermann', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Manuel Zimmermann' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Dominik Warscha', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Dominik Warscha' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Lukas Riegler', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Lukas Riegler' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Arton Mustafa', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Arton Mustafa' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Matthias Niedermoser', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Matthias Niedermoser' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Daniel Saliba', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Daniel Saliba' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Alexander Korak', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Alexander Korak' AND company_id = 3);
INSERT INTO employees (name, company_id, rolle, standort)
  SELECT 'Albert Drezgaj', 3, 'KAM', 'Österreich'
  WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Albert Drezgaj' AND company_id = 3);

-- 2. Bestehende Morawitz-Deals entfernen
DELETE FROM deals_nk WHERE company_id = 3;
DELETE FROM deals_bk WHERE company_id = 3;
DELETE FROM deals_vl WHERE company_id = 3;

-- 3. NK Deals
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #1',NULL,NULL,4332,4332,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #2',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #3',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #4',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #5',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #6',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #7',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #8',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #9',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #10',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #11',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #12',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #13',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #14',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #15',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #16',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #17',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #18',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #19',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #20',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #21',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #22',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #23',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #24',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #25',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #26',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #27',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #28',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,NULL,'AT Import 2026-01 #29',NULL,NULL,4331,4331,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #1',NULL,NULL,4623,4623,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #2',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #3',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #4',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #5',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #6',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #7',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #8',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #9',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #10',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #11',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #12',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #13',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #14',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #15',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #16',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #17',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #18',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #19',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #20',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #21',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #22',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #23',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #24',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #25',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #26',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #27',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #28',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #29',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #30',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #31',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #32',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #33',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,NULL,'AT Import 2026-02 #34',NULL,NULL,4619,4619,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #1',NULL,NULL,5220,5220,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #2',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #3',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #4',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #5',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #6',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #7',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #8',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #9',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #10',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #11',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #12',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #13',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #14',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #15',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #16',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #17',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #18',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #19',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #20',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #21',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #22',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #23',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #24',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #25',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #26',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #27',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #28',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #29',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #30',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,NULL,'AT Import 2026-03 #31',NULL,NULL,5206,5206,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #1',NULL,NULL,5070,5070,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #2',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #3',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #4',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #5',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #6',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #7',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #8',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #9',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #10',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #11',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #12',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #13',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #14',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #15',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #16',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #17',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #18',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #19',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #20',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #21',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #22',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #23',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #24',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #25',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #26',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #27',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #28',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #29',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #30',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #31',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #32',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #33',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #34',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #35',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #36',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #37',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #38',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #39',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #40',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #41',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'AT Import 2026-04 #42',NULL,NULL,5030,5030,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #1',NULL,NULL,5648,5648,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #2',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #3',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #4',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #5',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #6',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #7',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #8',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #9',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #10',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #11',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #12',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #13',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #14',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #15',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #16',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #17',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #18',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #19',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #20',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #21',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #22',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #23',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #24',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #25',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #26',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #27',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #28',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #29',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #30',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #31',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #32',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,NULL,'AT Import 2026-05 #33',NULL,NULL,5641,5641,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #1',NULL,NULL,4934,4934,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #2',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #3',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #4',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #5',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #6',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #7',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #8',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #9',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #10',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #11',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #12',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #13',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #14',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #15',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #16',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #17',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #18',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #19',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #20',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #21',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #22',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #23',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #24',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #25',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #26',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #27',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #28',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'AT Import 2026-06 #29',NULL,NULL,4922,4922,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;

-- 4. BK Deals
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,'AT Import BK 2026-01',NULL,NULL,117000,117000,NULL,'Gewonnen',NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,'AT Import BK 2026-02',NULL,NULL,336690,336690,NULL,'Gewonnen',NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,'AT Import BK 2026-03',NULL,NULL,188650,188650,NULL,'Gewonnen',NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,'AT Import BK 2026-04',NULL,NULL,107480,107480,NULL,'Gewonnen',NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,'AT Import BK 2026-05',NULL,NULL,121512,121512,NULL,'Gewonnen',NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,'AT Import BK 2026-06',NULL,NULL,133680,133680,NULL,'Gewonnen',NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;

-- 5. VL Deals
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,'AT Import VL 2026-01',NULL,100750,100750,NULL,NULL,NULL,'Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,'AT Import VL 2026-02',NULL,36800,36800,NULL,NULL,NULL,'Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,'AT Import VL 2026-03',NULL,117380,117380,NULL,NULL,NULL,'Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,'AT Import VL 2026-04',NULL,126350,126350,NULL,NULL,NULL,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,'AT Import VL 2026-05',NULL,90200,90200,NULL,NULL,NULL,'Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,'AT Import VL 2026-06',NULL,67400,67400,NULL,NULL,NULL,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;

-- 6. ae_gesamt_monthly: Österreich-Anteile addieren (idempotent)
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 29,
  nk_at_ae  = 125600,
  nk_gesamt = nk_gesamt - nk_at_ae + 125600,
  bk_gesamt = bk_gesamt + CASE WHEN nk_at_anz = 0 THEN 117000 ELSE 0 END,
  vl_gesamt = vl_gesamt + CASE WHEN nk_at_anz = 0 THEN 100750 ELSE 0 END,
  gesamt    = gesamt    + CASE WHEN nk_at_anz = 0 THEN 343350 ELSE 0 END
WHERE monat = '2026-01';
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 34,
  nk_at_ae  = 157050,
  nk_gesamt = nk_gesamt - nk_at_ae + 157050,
  bk_gesamt = bk_gesamt + CASE WHEN nk_at_anz = 0 THEN 336690 ELSE 0 END,
  vl_gesamt = vl_gesamt + CASE WHEN nk_at_anz = 0 THEN 36800 ELSE 0 END,
  gesamt    = gesamt    + CASE WHEN nk_at_anz = 0 THEN 530540 ELSE 0 END
WHERE monat = '2026-02';
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 31,
  nk_at_ae  = 161400,
  nk_gesamt = nk_gesamt - nk_at_ae + 161400,
  bk_gesamt = bk_gesamt + CASE WHEN nk_at_anz = 0 THEN 188650 ELSE 0 END,
  vl_gesamt = vl_gesamt + CASE WHEN nk_at_anz = 0 THEN 117380 ELSE 0 END,
  gesamt    = gesamt    + CASE WHEN nk_at_anz = 0 THEN 467430 ELSE 0 END
WHERE monat = '2026-03';
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 42,
  nk_at_ae  = 211300,
  nk_gesamt = nk_gesamt - nk_at_ae + 211300,
  bk_gesamt = bk_gesamt + CASE WHEN nk_at_anz = 0 THEN 107480 ELSE 0 END,
  vl_gesamt = vl_gesamt + CASE WHEN nk_at_anz = 0 THEN 126350 ELSE 0 END,
  gesamt    = gesamt    + CASE WHEN nk_at_anz = 0 THEN 445130 ELSE 0 END
WHERE monat = '2026-04';
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 33,
  nk_at_ae  = 186160,
  nk_gesamt = nk_gesamt - nk_at_ae + 186160,
  bk_gesamt = bk_gesamt + CASE WHEN nk_at_anz = 0 THEN 121512 ELSE 0 END,
  vl_gesamt = vl_gesamt + CASE WHEN nk_at_anz = 0 THEN 90200 ELSE 0 END,
  gesamt    = gesamt    + CASE WHEN nk_at_anz = 0 THEN 397872 ELSE 0 END
WHERE monat = '2026-05';