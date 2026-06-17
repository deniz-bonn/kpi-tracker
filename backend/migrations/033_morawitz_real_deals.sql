-- Migration 033: Morawitz Consulting – Echte Deal-Daten (Ersetzt Platzhalterdaten aus 028)

-- 1. Alle Morawitz-Deals loeschen (Platzhalter aus Migration 028)
DELETE FROM deals_nk WHERE company_id = 3;
DELETE FROM deals_bk WHERE company_id = 3;
DELETE FROM deals_vl WHERE company_id = 3;

-- 2. NK Deals (Neukunden) - Echte Kundennamen und Einzelwerte
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-07','2026-01',3,e.id,NULL,'Melkus Mechatronic GmbH',NULL,'Kontingente',8000,8000,2,'Gewonnen',NULL,NULL,'2026-01-07','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-09','2026-01',3,e.id,NULL,'Sortimo Gesellschaft m.b.H.',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-09','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-09','2026-01',3,e.id,NULL,'Johann Radauer GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-09','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-14','2026-01',3,e.id,NULL,'Technopart Gmbh',NULL,'Individuell',6000,6000,2,'Gewonnen',NULL,NULL,'2026-01-14','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-14','2026-01',3,e.id,NULL,'Planegger Holz GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-14','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-14','2026-01',3,e.id,NULL,'Lungauer Holzhandwerker GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-14','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-14','2026-01',3,e.id,NULL,'Transelektronik Messgeräte GmbH',NULL,'Kontingente',5400,5400,2,'Gewonnen',NULL,NULL,'2026-01-14','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-15','2026-01',3,e.id,NULL,'BUPI - Golser Maschinenbau GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-15','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-15','2026-01',3,e.id,NULL,'Anzenberger GmbH ',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-01-15','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-15','2026-01',3,e.id,NULL,'Bernhard Führer GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-15','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-16','2026-01',3,e.id,NULL,'ITA Tischlermontagen GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-16','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-16','2026-01',3,e.id,NULL,'Königshofer GmbH',NULL,'Kontingente',6000,6000,2,'Gewonnen',NULL,NULL,'2026-01-16','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-19','2026-01',3,e.id,NULL,'Ing. Herbert Mailer GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-01-19','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-19','2026-01',3,e.id,NULL,'Artner Handelsgmbh',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-01-19','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-19','2026-01',3,e.id,NULL,'Fliesen Gatterer Handel und Verlegung',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-19','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-20','2026-01',3,e.id,NULL,'GSM Montagetischler',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-20','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-21','2026-01',3,e.id,NULL,'CNC Technik Stritzl GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-21','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-21','2026-01',3,e.id,NULL,'FFT Tape Solutions GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-21','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-21','2026-01',3,e.id,NULL,'Kohlbrat & Bunz GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-21','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-22','2026-01',3,e.id,NULL,'Martin Pichler Ziegelwerk GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-22','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-22','2026-01',3,e.id,NULL,'Automobile Gadermayr GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-22','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-23','2026-01',3,e.id,NULL,'KOSCHUTZ Korrosionsschutz GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-01-23','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-26','2026-01',3,e.id,NULL,'ASC Antriebe Distribution & Service GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-26','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-26','2026-01',3,e.id,NULL,'DGR DatenverarbeitungsgesmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-26','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-27','2026-01',3,e.id,NULL,'Pletzer Anton GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-01-27','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-27','2026-01',3,e.id,NULL,'NUFA Nutzfahrzeuge und Baumaschinen GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-27','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-27','2026-01',3,e.id,NULL,'Alfred Feuerstein GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-27','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-28','2026-01',3,e.id,NULL,'Malerei und Fassaden Stulak ',NULL,'Individuell',3000,3000,2,'Gewonnen',NULL,NULL,'2026-01-28','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-28','2026-01',3,e.id,NULL,'bgd Werbetechnik GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-01-28','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-29','2026-01',3,e.id,NULL,'Tischlerei Grübler GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-29','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-29','2026-01',3,e.id,NULL,'Stern Bau GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-01-29','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-29','2026-01',3,e.id,NULL,'Harbeck Mietkräne GmbH & Co KG',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-29','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-29','2026-01',3,e.id,NULL,'LGV. Personalmanagement',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-29','2026-01'
  FROM employees e WHERE e.name='Dominik Warscha' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-29','2026-01',3,e.id,NULL,'p&w raumdesign gmbh',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-29','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-30','2026-01',3,e.id,NULL,'Haim Elektrotechnik gmbH ',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-30','2026-01'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-30','2026-01',3,e.id,NULL,'Romedius Gastroplaner GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-01-30','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-30','2026-01',3,e.id,NULL,'meinZelt GmbH',NULL,'Kontingente',3600,3600,2,'Gewonnen',NULL,NULL,'2026-01-30','2026-01'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-03','2026-02',3,e.id,NULL,'Zirngast Fenster-Türen GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-03','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-03','2026-02',3,e.id,NULL,'Golfbau Platzer GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-03','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-03','2026-02',3,e.id,NULL,'Austrowaren Alphapack GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-03','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-03','2026-02',3,e.id,NULL,'Klingler Installationen GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-03','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-04','2026-02',3,e.id,NULL,'Tischlerei Oberhauser ',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-04','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-04','2026-02',3,e.id,NULL,'alu-tech-trade GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-04','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-04','2026-02',3,e.id,NULL,'Radkersburger Metal Forming GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-04','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-04','2026-02',3,e.id,NULL,'PWL Anlagentechnik HandelsgmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-04','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-05','2026-02',3,e.id,NULL,'Ornezeder & Partner GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-05','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-06','2026-02',3,e.id,NULL,'R & K GmbH',NULL,'Kontingente',7500,7500,2,'Gewonnen',NULL,NULL,'2026-02-06','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-09','2026-02',3,e.id,NULL,'Elektro Rapold GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-09','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-10','2026-02',3,e.id,NULL,'Rudolf Köhler GesmbH',NULL,'Kontingente',4850,4850,2,'Gewonnen',NULL,NULL,'2026-02-10','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-10','2026-02',3,e.id,NULL,'Micro-Systeme Entwicklungs und Produktions GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-10','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-10','2026-02',3,e.id,NULL,'K4 Objektpartner GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-10','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-10','2026-02',3,e.id,NULL,'Autocenter Ing. Mühlbacher Mühlbacher GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-10','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-12','2026-02',3,e.id,NULL,'Notariat PUHR & PARTNER',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-12','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-13','2026-02',3,e.id,NULL,'KACO Dichtungstechnik Ges.m.b.H. St. Michael',NULL,'Kontingente',4500,4500,2,'Gewonnen',NULL,NULL,'2026-02-13','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-16','2026-02',3,e.id,NULL,'ITGA Ingenieurbüro Brunner GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-16','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-17','2026-02',3,e.id,NULL,'WK Pulverbeschichtung GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-17','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-17','2026-02',3,e.id,NULL,'Bodenwerkstatt Böttinger & Danielauer GmbH ',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-02-17','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-17','2026-02',3,e.id,NULL,'Weissbacher W. GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-02-17','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-17','2026-02',3,e.id,NULL,'Novoferm Austria GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-17','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-19','2026-02',3,e.id,NULL,'VARIOFORM PET Verpackung Ges.m.b.H.',NULL,'Kontingente',4600,4600,2,'Gewonnen',NULL,NULL,'2026-02-19','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-20','2026-02',3,e.id,NULL,'Fahrner GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-20','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-20','2026-02',3,e.id,NULL,'Mag. Birgit Eichberger Steuerberatung',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-20','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-23','2026-02',3,e.id,NULL,'Dr. Yildirim & Partner Gruppenpraxis für Kinder- und Jugendheilkunde OG',NULL,'Kontingente',6000,6000,3,'Gewonnen',NULL,NULL,'2026-01-23','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-23','2026-02',3,e.id,NULL,'Sparer Klima & kältetechnik GmbH ',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-01-23','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-24','2026-02',3,e.id,NULL,'Innviertler Teigwaren GmbH',NULL,'Kontingente',3000,3000,2,'Gewonnen',NULL,NULL,'2026-02-24','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-24','2026-02',3,e.id,NULL,'Kager Massivbau GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-24','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-24','2026-02',3,e.id,NULL,'MCC Dipl.-Ing. Cerin Consulting ZT GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-02-24','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-25','2026-02',3,e.id,NULL,'Herzgsell GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-25','2026-02'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-25','2026-02',3,e.id,NULL,'Auto Pieber GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-02-25','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-26','2026-02',3,e.id,NULL,'Holz Hahn GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-02-26','2026-02'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-02','2026-03',3,e.id,NULL,'Tübeg Türenservice Ges.m.b.H.',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-03-02','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-02','2026-03',3,e.id,NULL,'Autohaus Jakob Prügger GmbH',NULL,'Kontingente',6600,6600,2,'Gewonnen',NULL,NULL,'2026-03-02','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-02','2026-03',3,e.id,NULL,'Garten Winkelbauer GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-03-02','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-03','2026-03',3,e.id,NULL,'Produs GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-03-03','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-03','2026-03',3,e.id,NULL,'ETP - Elektrotechnische Planungs GmbH',NULL,'Individuell',2800,2800,2,'Gewonnen',NULL,NULL,'2026-03-03','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-03','2026-03',3,e.id,NULL,'HFP Ingenieurbüro für Gebäudetechnik GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-03-03','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-04','2026-03',3,e.id,NULL,'Zellinger GmbH',NULL,'Kontingente',6600,6600,2,'Gewonnen',NULL,NULL,'2026-03-04','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-05','2026-03',3,e.id,NULL,'Koch und Partner SteuerberatungsmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-03-05','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-05','2026-03',3,e.id,NULL,'Medek & Schörner GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-03-05','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-05','2026-03',3,e.id,NULL,'Ing. Johannes Dornhecker',NULL,'Kontingente',3500,3500,2,'Gewonnen',NULL,NULL,'2026-03-05','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-05','2026-03',3,e.id,NULL,'ATC Engineering GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-03-05','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-06','2026-03',3,e.id,NULL,'Auböck Bau GmbH',NULL,'Kontingente',7500,7500,2,'Gewonnen',NULL,NULL,'2026-03-06','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-06','2026-03',3,e.id,NULL,'Hannl Metallbau GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-03-06','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-06','2026-03',3,e.id,NULL,'WLS-Bau GmbH',NULL,'Kontingente',7500,7500,2,'Gewonnen',NULL,NULL,'2026-03-06','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-06','2026-03',3,e.id,NULL,'Griesser Bauplanung und Projektmanagement GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-03-06','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-09','2026-03',3,e.id,NULL,'Intersport Kaltenbrunner Karl Kaltenbrunner',NULL,'Kontingente',3750,3750,2,'Gewonnen',NULL,NULL,'2026-03-09','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-09','2026-03',3,e.id,NULL,'Installationen Gstrein, Heizung, Sanitär -Gas gmbH',NULL,'Kontingente',2200,2200,2,'Gewonnen',NULL,NULL,'2026-03-09','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-09','2026-03',3,e.id,NULL,'WELCOME Versicherungsmakler GmbH',NULL,'Kontingente',3000,3000,1,'Gewonnen',NULL,NULL,'2026-03-09','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-10','2026-03',3,e.id,NULL,'Etec Elektroechnik GmbH & Co KG',NULL,'Kontingente',2000,2000,2,'Gewonnen',NULL,NULL,'2026-03-10','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-10','2026-03',3,e.id,NULL,'Eco Wirtschaftstreuhand Steuerberatung - ecostb GmbH',NULL,'Kontingente',6000,6000,2,'Gewonnen',NULL,NULL,'2026-03-10','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-10','2026-03',3,e.id,NULL,'AGU Architektengruppe U-Bahn Ziviltechniker GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-03-10','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-11','2026-03',3,e.id,NULL,'Landtechnik im Tullnerfeld Wilhelm Bayerl GmbH',NULL,'Kontingente',3500,3500,2,'Gewonnen',NULL,NULL,'2026-03-11','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-11','2026-03',3,e.id,NULL,'A.ö. Bezirkskrankenhaus Lienz ',NULL,'Kontingente',6000,6000,3,'Gewonnen',NULL,NULL,'2026-03-11','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-12','2026-03',3,e.id,NULL,'TISCHLEREI EDINGER GMBH',NULL,'Kontingente',6600,6600,3,'Gewonnen',NULL,NULL,'2026-03-12','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-17','2026-03',3,e.id,NULL,'Floorex GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-03-17','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-17','2026-03',3,e.id,NULL,'RTS Regionalfernsehen GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-03-17','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-18','2026-03',3,e.id,NULL,'WAMATEC GmbH',NULL,'Kontingente',5700,5700,2,'Gewonnen',NULL,NULL,'2026-03-18','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-19','2026-03',3,e.id,NULL,'Holzbau Mayer GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-03-19','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-20','2026-03',3,e.id,NULL,'Rusegger Hoch- und Tiefbau GmbH',NULL,'Kontingente',6600,6600,3,'Gewonnen',NULL,NULL,'2026-03-20','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-23','2026-03',3,e.id,NULL,'E-Werk Gösting Stromversorgungs GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-03-23','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-25','2026-03',3,e.id,NULL,'Oberaigner Automobile GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-03-25','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-25','2026-03',3,e.id,NULL,'Tyrol Equity AG',NULL,'Kontingente',5100,5100,2,'Gewonnen',NULL,NULL,'2026-03-25','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-26','2026-03',3,e.id,NULL,'Unterkofler Plan & Bau GmbH',NULL,'Kontingente',2200,2200,2,'Gewonnen',NULL,NULL,'2026-03-26','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-27','2026-03',3,e.id,NULL,'Andrä Hagleitner Installationen GmbH & Co. KG',NULL,'Kontingente',5400,5400,2,'Gewonnen',NULL,NULL,'2026-03-27','2026-03'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-30','2026-03',3,e.id,NULL,'Josef Simmerer Transportunternehmen GmbH',NULL,'Kontingente',2200,2200,NULL,'Gewonnen',NULL,NULL,'2026-03-30','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-30','2026-03',3,e.id,NULL,'Auto Meisinger Vorarlberg GmbH',NULL,'Kontingente',4400,4400,NULL,'Gewonnen',NULL,NULL,'2026-03-30','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-30','2026-03',3,e.id,NULL,'Weiss Motoren GmbH',NULL,'Kontingente',4400,4400,NULL,'Gewonnen',NULL,NULL,'2026-03-30','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-30','2026-03',3,e.id,NULL,'halcö Alfred Hörtnagl GmbH',NULL,'Kontingente',5000,5000,NULL,'Gewonnen',NULL,NULL,'2026-03-30','2026-03'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'Bürgler Mooslechner GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'Baumeister Karl Fürholzer Hoch- und Tiefbaugesellschaft m.b.H.',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,NULL,'Bifrangi GmbH',NULL,'Kontingente',12000,12000,3,'Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-02','2026-04',3,e.id,NULL,'Fuchs Sanitär- und Heizungstechnik GmbH',NULL,'Kontingente',4600,4600,2,'Gewonnen',NULL,NULL,'2026-04-02','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-02','2026-04',3,e.id,NULL,'Nilfisk GmbH',NULL,'NK Kampagne',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-02','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-02','2026-04',3,e.id,NULL,'Ing. K. Wöhrer Metallbautechnik GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-02','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-03','2026-04',3,e.id,NULL,'Klimatechnik Seier GmbH',NULL,'Kontingente',2500,2500,2,'Gewonnen',NULL,NULL,'2026-04-03','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-03','2026-04',3,e.id,NULL,'Martin Juffinger Bau GmbH',NULL,'Kontingente',4750,4750,3,'Gewonnen',NULL,NULL,'2026-04-03','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-07','2026-04',3,e.id,NULL,'Hametner GmbH',NULL,'Kontingente',7500,7500,2,'Gewonnen',NULL,NULL,'2026-04-07','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-08','2026-04',3,e.id,NULL,'Innoflow consulting GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-04-08','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-08','2026-04',3,e.id,NULL,'Alpsolar Klimadesign OG',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-08','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-08','2026-04',3,e.id,NULL,'Trinicum GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-08','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-08','2026-04',3,e.id,NULL,'Huber Schaltanlagen GmbH',NULL,'Kontingente',9000,9000,2,'Gewonnen',NULL,NULL,'2026-04-08','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-09','2026-04',3,e.id,NULL,'Geberit Huter GmbH',NULL,'Kontingente',4600,4600,2,'Gewonnen',NULL,NULL,'2026-04-09','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-09','2026-04',3,e.id,NULL,'Horiba GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-09','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-09','2026-04',3,e.id,NULL,'Autohaus Oberhofer Josef GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-09','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-13','2026-04',3,e.id,NULL,'Feiba Engineering & Plants GmbH ',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-13','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-14','2026-04',3,e.id,NULL,'Kumera Antriebstechnik GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-14','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-14','2026-04',3,e.id,NULL,'Sobota Bau & Trockenbau GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-14','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-14','2026-04',3,e.id,NULL,'Franz Löschnig Gesellschaft m.b.H.',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-14','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-14','2026-04',3,e.id,NULL,'Plantec Dr. Christian Rehbichler ZT GmbH',NULL,'Kontingente',7000,7000,2,'Gewonnen',NULL,NULL,'2026-04-14','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-15','2026-04',3,e.id,NULL,'LM HOLZBAU Langeder & Mörtendorfer GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-15','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-15','2026-04',3,e.id,NULL,'RMD Franz Prader GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-04-15','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-15','2026-04',3,e.id,NULL,'Rusa GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-15','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-15','2026-04',3,e.id,NULL,'BCE Beyond Carbon Energy Holding GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-15','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-15','2026-04',3,e.id,NULL,'Thöni Bau',NULL,'Kontingente',4600,4600,2,'Gewonnen',NULL,NULL,'2026-04-15','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-15','2026-04',3,e.id,NULL,'KT-NET Communications GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-15','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-16','2026-04',3,e.id,NULL,'FMG Fahrzeugbau - Maschinenbau GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-16','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-20','2026-04',3,e.id,NULL,'Ötztaler Verkehrsgesellschafts m.b.H.',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-20','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-21','2026-04',3,e.id,NULL,'Gruppenpraxis für Augenheilkunde und Optometrie Bachernegg GmbH',NULL,'Kontingente',5000,5000,NULL,'Gewonnen',NULL,NULL,'2026-04-21','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-21','2026-04',3,e.id,NULL,'Ecker Haubeneder Steuer- und Unternehmensberatung GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-21','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-22','2026-04',3,e.id,NULL,'eFabrik GmbH',NULL,'Kontingente',2500,2500,1,'Gewonnen',NULL,NULL,'2026-04-22','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-22','2026-04',3,e.id,NULL,'kpp consulting gmbh',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-22','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-22','2026-04',3,e.id,NULL,'Pfeifenberger Versicherungsmakler GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-04-22','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-23','2026-04',3,e.id,NULL,'DIMOCO Payments GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-23','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-23','2026-04',3,e.id,NULL,'Pronaturhaus Obritzerger GmbH',NULL,'Kontingente',6600,6600,2,'Gewonnen',NULL,NULL,'2026-04-23','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-24','2026-04',3,e.id,NULL,'JMB Fashion Team',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-04-24','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-24','2026-04',3,e.id,NULL,'Fleischmann & Petschnig Dachdeckungs-GmbH',NULL,'Kontingente',9500,9500,6,'Gewonnen',NULL,NULL,'2026-04-24','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-27','2026-04',3,e.id,NULL,'Farm-ING Smart Farm Equipment FlexCo',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-27','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-27','2026-04',3,e.id,NULL,'Streng Bau GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-27','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-28','2026-04',3,e.id,NULL,'KSA Kastenmüller Systems Austria GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-04-28','2026-04'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-30','2026-04',3,e.id,NULL,'TWF International GmbH',NULL,'Kontingente',4000,4000,2,'Gewonnen',NULL,NULL,'2026-04-30','2026-04'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-04','2026-05',3,e.id,NULL,'Energy3000 solar GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-04','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-04','2026-05',3,e.id,NULL,'TERRAGON Vermessung ZT-GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-05-04','2026-05'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-04','2026-05',3,e.id,NULL,'KWSG Elektrotechnik GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-04','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-05','2026-05',3,e.id,NULL,'Wild GmbH',NULL,'Kontingente',4750,4750,2,'Gewonnen',NULL,NULL,'2026-05-05','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-05','2026-05',3,e.id,NULL,'FRÖSCHL-BAU GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-05-05','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-06','2026-05',3,e.id,NULL,'Huber Schaltanlagen GmbH',NULL,'Kontingente',9000,9000,2,'Gewonnen',NULL,NULL,'2026-05-06','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-06','2026-05',3,e.id,NULL,'Norbert Haderer Ziviltechniker GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-06','2026-05'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-07','2026-05',3,e.id,NULL,'system7 metal technology GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-07','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-07','2026-05',3,e.id,NULL,'Ton&Bild Medientechnik GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-07','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-07','2026-05',3,e.id,NULL,'Peter Rhedey Internationale Transportegesellschaft m.b.H.',NULL,'Kontingente',4850,4850,2,'Gewonnen',NULL,NULL,'2026-05-07','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-08','2026-05',3,e.id,NULL,'Heizung-Sanitär Schöpf GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-08','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-11','2026-05',3,e.id,NULL,'Cargomind (Austria) GmbH',NULL,'Recruiter as a Service',8100,8100,3,'Gewonnen',NULL,NULL,'2026-05-11','2026-05'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-11','2026-05',3,e.id,NULL,'BIO-AKTIV Günther Johann Wasser- und Wärmetechnik GmbH',NULL,'Recruiter as a Service',5130,5130,2,'Gewonnen',NULL,NULL,'2026-05-11','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-13','2026-05',3,e.id,NULL,'Bechter Sanitär Heizung GmbH',NULL,'Recruiter as a Service',4000,4000,2,'Gewonnen',NULL,NULL,'2026-05-13','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-15','2026-05',3,e.id,NULL,'Gärtnerei Rischer GmbH',NULL,'Recruiter as a Service',4000,4000,2,'Gewonnen',NULL,NULL,'2026-05-15','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-18','2026-05',3,e.id,NULL,'Job Immobilien Motor (JIM) Marketing GmbH',NULL,'Recruiter as a Service',4900,4900,2,'Gewonnen',NULL,NULL,'2026-05-18','2026-05'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-18','2026-05',3,e.id,NULL,'Hutter Acustix GmbH',NULL,'Kontingente',4400,4400,2,'Gewonnen',NULL,NULL,'2026-05-18','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-18','2026-05',3,e.id,NULL,'Wittlinger Therapiezentrum GmbH',NULL,'Recruiter as a Service',10800,10800,2,'Gewonnen',NULL,NULL,'2026-05-18','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-18','2026-05',3,e.id,NULL,'Holzbau Lengauer-Stockner GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-18','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-19','2026-05',3,e.id,NULL,'Schönberger Alternativ e Haustechnik GmbH',NULL,'Recruiter as a Service',5130,5130,2,'Gewonnen',NULL,NULL,'2026-05-19','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-19','2026-05',3,e.id,NULL,'Kühlanlagenbau Fritz Lachmayr GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-19','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-19','2026-05',3,e.id,NULL,'Holzbaumeister Strebinger GmbH',NULL,'Recruiter as a Service',4300,4300,1,'Gewonnen',NULL,NULL,'2026-05-19','2026-05'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-19','2026-05',3,e.id,NULL,'Wintersport Tirol AG & Co. Stubaier Bergbahnen KG',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-05-19','2026-05'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-19','2026-05',3,e.id,NULL,'Auto Linser GmbH',NULL,'Recruiter as a Service',4900,4900,2,'Gewonnen',NULL,NULL,'2026-05-19','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-21','2026-05',3,e.id,NULL,'Rika Kompressoren GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-21','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-21','2026-05',3,e.id,NULL,'Tirolpack GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-21','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-22','2026-05',3,e.id,NULL,'VATC-Betriebe GmbH',NULL,'Recruiter as a Service',4900,4900,2,'Gewonnen',NULL,NULL,'2026-05-22','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-27','2026-05',3,e.id,NULL,'REFORM Fenster GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-27','2026-05'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-27','2026-05',3,e.id,NULL,'hzl nussdorf dr.th.kessler gmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-27','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-27','2026-05',3,e.id,NULL,'SBT Steuerberatungs GmbH & Co KG',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-27','2026-05'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-28','2026-05',3,e.id,NULL,'Ketec Gebäudetechnik GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-28','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-29','2026-05',3,e.id,NULL,'Genius Steuerberatung GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-05-29','2026-05'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'ACCESS Logistic GmbH',NULL,'Recruiter as a Service',2700,2700,2,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'Autohaus Berger GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,NULL,'Holzbau Franz Kreiseder GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,NULL,'Ambulatorium für Endoskopie und Chirurgie Dr. Mach GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,NULL,'Getzner Textil AG',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,NULL,'Mag. Martina Märzinger Wirtschaftstreuhand - Steuerberatung GmbH',NULL,'Recruiter as a Service',3800,3800,2,'Gewonnen',NULL,NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-03','2026-06',3,e.id,NULL,'Gutmann Energiesysteme GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-03','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-03','2026-06',3,e.id,NULL,'Längle Oberflächentechnik GmbH',NULL,'Recruiter as a Service',4800,4800,2,'Gewonnen',NULL,NULL,'2026-06-03','2026-06'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-03','2026-06',3,e.id,NULL,'Käserei Plangger GmbH',NULL,'Recruiter as a Service',4050,4050,2,'Gewonnen',NULL,NULL,'2026-06-03','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-03','2026-06',3,e.id,NULL,'Helios Ventilatoren GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-03','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-03','2026-06',3,e.id,NULL,'MEC Electronics Entwicklung und Produktion GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-03','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-03','2026-06',3,e.id,NULL,'Neubauer GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-03','2026-06'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-03','2026-06',3,e.id,NULL,'Eurolyser Diagnostica GmbH',NULL,'Kontingente',5000,5000,2,'Gewonnen',NULL,NULL,'2026-06-03','2026-06'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-08','2026-06',3,e.id,NULL,'Stein-Zeit Köllnreitner GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-08','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-08','2026-06',3,e.id,NULL,'Radshop Obersberger GmbH',NULL,'Recruiter as a Service',4050,4050,2,'Gewonnen',NULL,NULL,'2026-06-08','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-08','2026-06',3,e.id,NULL,'Autohaus Almtal Gundendorfer GmbH',NULL,'Recruiter as a Service',4800,4800,2,'Gewonnen',NULL,NULL,'2026-06-08','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-10','2026-06',3,e.id,NULL,'Cell GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-10','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-10','2026-06',3,e.id,NULL,'eberharterbau GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-10','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,NULL,'Katzler GmbH & Co. KG',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,NULL,'zimmermann bau-gmbh',NULL,'Recruiter as a Service',4050,4050,1,'Gewonnen',NULL,NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,NULL,'sr-enterprise GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,NULL,'Lechner''s Elektro Team GmbH',NULL,'Recruiter as a Service',2700,2700,2,'Gewonnen',NULL,NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-12','2026-06',3,e.id,NULL,'Sochor GmbH',NULL,'NK Kampagne',5000,5000,2,'Gewonnen',NULL,NULL,'2026-06-12','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-12','2026-06',3,e.id,NULL,'ERLER Naturholzbau GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-12','2026-06'
  FROM employees e WHERE e.name='Sükrü Boydas' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-15','2026-06',3,e.id,NULL,'Robert Leitner Elektrotechnik GmbH',NULL,'Recruiter as a Service',5400,5400,2,'Gewonnen',NULL,NULL,'2026-06-15','2026-06'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,automatische_verlaengerung,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-16','2026-06',3,e.id,NULL,'MAIER-PAPIER GmbH',NULL,'Recruiter as a Service',4800,4800,2,'Gewonnen',NULL,NULL,'2026-06-16','2026-06'
  FROM employees e WHERE e.name='Manuel Zimmermann' AND e.company_id=3 LIMIT 1;

-- 3. BK Deals (Key Account) - Echte Kundennamen und Einzelwerte
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-07','2026-01',3,e.id,'SK-Stahlbau',NULL,'Individuell',6000,6000,NULL,'Gewonnen',NULL,'2026-01-07','2026-01'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-08','2026-01',3,e.id,'Mersen Österreich GmbH',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-01-08','2026-01'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-09-01','2026-01',3,e.id,'JJ Technology Holding GmbH',NULL,'Individuell',1000,1000,NULL,'Gewonnen',NULL,'2026-09-01','2026-01'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2025-01-15','2026-01',3,e.id,'HORVATH´s SPEZEREYEN KONTOR GmbH',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2025-01-15','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-27','2026-01',3,e.id,'New Originals Company GmbH',NULL,'Kontingenterweiterung',3000,3000,NULL,'Gewonnen',NULL,'2026-01-27','2026-01'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-28','2026-01',3,e.id,'tz baumanagement gmbh',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-01-28','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2025-01-29','2026-01',3,e.id,'SAPP Management AG',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2025-01-29','2026-01'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-29','2026-01',3,e.id,'Adolf Tobias GmbH',NULL,'Kontingenterweiterung',9600,9600,NULL,'Gewonnen',NULL,'2026-01-29','2026-01'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-30','2026-01',3,e.id,'Gottfried Pölzl',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-01-30','2026-01'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-30','2026-01',3,e.id,'Selectum GmbH',NULL,'Individuell',2000,2000,NULL,'Gewonnen',NULL,'2026-01-30','2026-01'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-02','2026-02',3,e.id,'Adler Apotheke Inh. Mag. pharm. Bernd Milenkovics e.U',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-02-02','2026-02'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-03','2026-02',3,e.id,'Kugelfink GmbH',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-02-03','2026-02'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-04','2026-02',3,e.id,'Harbeck Mietkräne',NULL,'Individuell',1500,1500,NULL,'Gewonnen',NULL,'2026-02-04','2026-02'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-04','2026-02',3,e.id,'harry installiert e.U.',NULL,'Kontingenterweiterung',2000,2000,NULL,'Gewonnen',NULL,'2026-02-04','2026-02'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-04','2026-02',3,e.id,'GSM Montagen',NULL,'Shooting ',4500,4500,NULL,'Gewonnen',NULL,'2026-02-04','2026-02'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-06','2026-02',3,e.id,'Waibel GmbH (Waibel workwear)',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-02-06','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-06','2026-02',3,e.id,'SSP-Tec GmbH',NULL,'Shooting ',4500,4500,NULL,'Gewonnen',NULL,'2026-02-06','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-06','2026-02',3,e.id,'Auto Niedermoser',NULL,'Shooting ',3150,3150,NULL,'Gewonnen',NULL,'2026-02-06','2026-02'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-07','2026-02',3,e.id,'Elektrotechnik Steinlechner',NULL,'Kontingenterweiterung',2000,2000,NULL,'Gewonnen',NULL,'2026-02-07','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-09','2026-02',3,e.id,'Hross & Partner Gesellschaft m. b. H.',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-02-09','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-09','2026-02',3,e.id,'Intertreuhand Prachner GmbH',NULL,'Kontingenterweiterung',15000,15000,NULL,'Gewonnen',NULL,'2026-02-09','2026-02'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-09','2026-02',3,e.id,'Triaflex Arbeitsplatzsysteme GmbH',NULL,'Kontingenterweiterung',2500,2500,NULL,'Gewonnen',NULL,'2026-02-09','2026-02'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-10','2026-02',3,e.id,'Jewa Massivholz',NULL,'Individuell',2500,2500,NULL,'Gewonnen',NULL,'2026-02-10','2026-02'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-11','2026-02',3,e.id,'Lugauer Gesmbh',NULL,'Kontingenterweiterung',5500,5500,NULL,'Gewonnen',NULL,'2026-02-11','2026-02'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-11','2026-02',3,e.id,'GW Cosmetics',NULL,'Neue Stelle',10000,10000,NULL,'Gewonnen',NULL,'2026-02-11','2026-02'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-12','2026-02',3,e.id,'Schwarte Group GmbH',NULL,'Kontingenterweiterung',8000,8000,NULL,'Gewonnen',NULL,'2026-02-12','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-12','2026-02',3,e.id,'Neulengbacher Kommunalservice Ges.m.b.H.',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-02-12','2026-02'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-12','2026-02',3,e.id,'Winterhalter Gastronom',NULL,'Kontingenterweiterung',2500,2500,NULL,'Gewonnen',NULL,'2026-02-12','2026-02'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-18','2026-02',3,e.id,'HR Gebäudehülle GmbH',NULL,'Neue Stelle',2800,2800,NULL,'Gewonnen',NULL,'2026-02-18','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-18','2026-02',3,e.id,'EBG MedAustron GmbH',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-02-18','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-19','2026-02',3,e.id,'Heinle Elektroanlagen',NULL,'Kontingenterweiterung',4500,4500,NULL,'Gewonnen',NULL,'2026-02-19','2026-02'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-12-20','2026-02',3,e.id,'New Originals GmbH',NULL,'Kontingenterweiterung',40000,40000,NULL,'Gewonnen',NULL,'2026-12-20','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-20','2026-02',3,e.id,'Vollmer Werke GmbH',NULL,'Kontingenterweiterung',4600,4600,NULL,'Gewonnen',NULL,'2026-02-20','2026-02'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-20','2026-02',3,e.id,'Blumen B&B GmbH',NULL,'Individuell',600,600,NULL,'Gewonnen',NULL,'2026-02-20','2026-02'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-23','2026-02',3,e.id,'TEADIT International Produktions GmbH',NULL,'Neue Stelle',3000,3000,NULL,'Gewonnen',NULL,'2026-02-23','2026-02'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-26','2026-02',3,e.id,'Dorn Lift GmbH',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-02-26','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-02','2026-03',3,e.id,'Dr. Gabriele Mühlberger',NULL,'Karriereseite',2500,2500,NULL,'Gewonnen',NULL,'2026-03-02','2026-03'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-02','2026-03',3,e.id,'Schmidt Raumausstattung GmbH',NULL,'Neue Stelle',3250,3250,NULL,'Gewonnen',NULL,'2026-03-02','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-03','2026-03',3,e.id,'Karl Strauß GmbH',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-02-03','2026-03'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-04','2026-03',3,e.id,'Sportstätten Klosterneuburg GmbH',NULL,'Neue Stelle',6000,6000,NULL,'Gewonnen',NULL,'2026-03-04','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-04','2026-03',3,e.id,'Autopark Alex Ellinger',NULL,'Kontingenterweiterung',2000,2000,NULL,'Gewonnen',NULL,'2026-03-04','2026-03'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-05','2026-03',3,e.id,'GW Cosmetics GmbH ',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-03-05','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-09-09','2026-03',3,e.id,'ABF Straßensanierung GmbH',NULL,'Shooting ',4000,4000,NULL,'Gewonnen',NULL,'2026-09-09','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-10','2026-03',3,e.id,'Quo Transporte',NULL,'Karriereseite',3500,3500,NULL,'Gewonnen',NULL,'2026-03-10','2026-03'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-10','2026-03',3,e.id,'Mühlegger GmbH',NULL,'Individuell',600,600,NULL,'Gewonnen',NULL,'2026-03-10','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-12','2026-03',3,e.id,'AGU Architekturengruppe',NULL,'Schnellbewerberbutton',1000,1000,NULL,'Gewonnen',NULL,'2026-03-12','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-16','2026-03',3,e.id,'LGV Personalmanagement',NULL,'Schnellbewerberbutton',300,300,NULL,'Gewonnen',NULL,'2026-03-16','2026-03'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-17','2026-03',3,e.id,'Reisenhofer Isolier- und Brandschutztechnik',NULL,'Google Ads',9000,9000,NULL,'Gewonnen',NULL,'2026-03-17','2026-03'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-17','2026-03',3,e.id,'DIE WOHNRAUM SANIERER + INSTALLATEURE GMBH / Rechberger Immobilien GmbH',NULL,'Neue Stelle',3700,3700,NULL,'Gewonnen',NULL,'2026-03-17','2026-03'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-18','2026-03',3,e.id,'Lipp-Stahlbau',NULL,'Neue Stelle',1500,1500,NULL,'Gewonnen',NULL,'2026-03-18','2026-03'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-23','2026-03',3,e.id,'ABF Straßensanierung GmbH',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-03-23','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-24','2026-03',3,e.id,'tz baumanagement gmbh',NULL,'Kontingenterweiterung',2000,2000,NULL,'Gewonnen',NULL,'2026-03-24','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-25','2026-03',3,e.id,'Sanibau GmbH',NULL,'Individuell',8700,8700,NULL,'Gewonnen',NULL,'2026-03-25','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-26','2026-03',3,e.id,'Mischtechnik Hoffmann & Partner GmbH',NULL,'Kontingenterweiterung',2000,2000,NULL,'Gewonnen',NULL,'2026-03-26','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-26','2026-03',3,e.id,'Engl Glas GmbH',NULL,'Neue Stelle',1200,1200,NULL,'Gewonnen',NULL,'2026-03-26','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-27','2026-03',3,e.id,'Kager Massivbau GmbH',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-03-27','2026-03'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-30','2026-03',3,e.id,'Heinle Elektroanlagen',NULL,'Kontingenterweiterung',6000,6000,NULL,'Gewonnen',NULL,'2026-03-30','2026-03'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-30','2026-03',3,e.id,'Hross & Partner Gesellschaft m. b. H.',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-03-30','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-30','2026-03',3,e.id,'Lora-GmbH',NULL,'Neue Stelle',5100,5100,NULL,'Gewonnen',NULL,'2026-03-30','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-02','2026-04',3,e.id,'Albers kxt GmbH',NULL,'Schnellbewerberbutton',3600,3600,NULL,'Gewonnen',NULL,'2026-04-02','2026-04'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-06','2026-04',3,e.id,'smart:ex Krexner Haustechnik GmbH',NULL,'Individuell',1500,1500,NULL,'Gewonnen',NULL,'2026-04-06','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-07','2026-04',3,e.id,'Scm Group AT',NULL,'Individuell',800,800,NULL,'Gewonnen',NULL,'2026-04-07','2026-04'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-07','2026-04',3,e.id,'Scm Group DE',NULL,'Neue Stelle',3900,3900,NULL,'Gewonnen',NULL,'2026-04-07','2026-04'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-10','2026-04',3,e.id,'DGR Datenverarbeitungs GmbH ',NULL,'Neue Stelle',4000,4000,NULL,'Gewonnen',NULL,'2026-04-10','2026-04'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-10','2026-04',3,e.id,'Blasl GmbH',NULL,'Kontingenterweiterung',3000,3000,NULL,'Gewonnen',NULL,'2026-04-10','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-13','2026-04',3,e.id,'Bernhard Kinzl GmbH',NULL,'Kontingenterweiterung',1000,1000,NULL,'Gewonnen',NULL,'2026-04-13','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-13','2026-04',3,e.id,'Ing. Garten Dornhecker',NULL,'Shooting ',4000,4000,NULL,'Gewonnen',NULL,'2026-04-13','2026-04'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-14','2026-04',3,e.id,'Fensterbau Salzburg GesmbH',NULL,'Kontingenterweiterung',1600,1600,NULL,'Gewonnen',NULL,'2026-04-14','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-14','2026-04',3,e.id,'Tiroler Hospiz-Gemeinschaft ',NULL,'Shooting ',4000,4000,NULL,'Gewonnen',NULL,'2026-04-14','2026-04'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-16','2026-04',3,e.id,'QUO Transport GmbH',NULL,'Social Media Content',13000,13000,NULL,'Gewonnen',NULL,'2026-04-16','2026-04'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-17','2026-04',3,e.id,'Sparer Klima & Kältetechnik GmbH',NULL,'NK Kampagne',8000,8000,NULL,'Gewonnen',NULL,'2026-04-17','2026-04'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-20','2026-04',3,e.id,'EPN FRISEUR Sophia Neumann e.U.',NULL,'Kontingenterweiterung',2000,2000,NULL,'Gewonnen',NULL,'2026-04-20','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-21','2026-04',3,e.id,'MK Sportartikel GmbH',NULL,'Kontingenterweiterung',3500,3500,NULL,'Gewonnen',NULL,'2026-04-21','2026-04'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-23','2026-04',3,e.id,'Braumann Haustechnik',NULL,'Karriereseite',3500,3500,NULL,'Gewonnen',NULL,'2026-04-23','2026-04'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-27','2026-04',3,e.id,'Rusa GmbH',NULL,'Shooting ',4500,4500,NULL,'Gewonnen',NULL,'2026-04-27','2026-04'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-04','2026-05',3,e.id,'Elco Austria',NULL,'Shooting ',4000,4000,NULL,'Gewonnen',NULL,'2026-05-04','2026-05'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-05','2026-05',3,e.id,'CLEANTEC hygiene technology gmbh',NULL,'Kontingenterweiterung',5000,5000,NULL,'Gewonnen',NULL,'2026-05-05','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-05','2026-05',3,e.id,'Mayer Hallen + Bausysteme GmbH',NULL,'Google Ads',3000,3000,NULL,'Gewonnen',NULL,'2026-05-05','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-05','2026-05',3,e.id,'ELEKTRIZITÄTSWERK GÖSTING V. FRANZ GmbH',NULL,'Karriereseite',4212,4212,NULL,'Gewonnen',NULL,'2026-05-05','2026-05'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-05','2026-05',3,e.id,'Thöni Hoch und Tiefbau',NULL,'Individuell',4500,4500,NULL,'Gewonnen',NULL,'2026-05-05','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-06','2026-05',3,e.id,'F&M Zechner Sonnenschutz',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-05-06','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-06','2026-05',3,e.id,'Tiroler Hospiz-Gemeinschaft',NULL,'Neue Stelle',3000,3000,NULL,'Gewonnen',NULL,'2026-05-06','2026-05'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-07','2026-05',3,e.id,'ABF Straßensanierungs GmbH ',NULL,'Social Media Content',12000,12000,NULL,'Gewonnen',NULL,'2026-05-07','2026-05'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-08','2026-05',3,e.id,'Schwarte Group GmbH DE',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-05-08','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-08','2026-05',3,e.id,'Sobota Bau & Trockenbau GmbH',NULL,'Social Media Content',4500,4500,NULL,'Gewonnen',NULL,'2026-05-08','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-08','2026-05',3,e.id,'Plantec Dr. Christian Rehbichler ZT GmbH',NULL,'Shooting ',4300,4300,NULL,'Gewonnen',NULL,'2026-05-08','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-11','2026-05',3,e.id,'GESTRA Spiel- und Freizeiteinrichtungen GmbH',NULL,'Kontingenterweiterung',4400,4400,NULL,'Gewonnen',NULL,'2026-05-11','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-11','2026-05',3,e.id,'ITA Montagen',NULL,'Kontingenterweiterung',2000,2000,NULL,'Gewonnen',NULL,'2026-05-11','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-15','2026-05',3,e.id,'Goldwechselhaus GmbH',NULL,'Kontingenterweiterung',9000,9000,NULL,'Gewonnen',NULL,'2026-05-15','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-15','2026-05',3,e.id,'Albers KXT Gmbh',NULL,'Kontingenterweiterung',1500,1500,NULL,'Gewonnen',NULL,'2026-05-15','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-15','2026-05',3,e.id,'Intertreuhand Prachner',NULL,'Kontingenterweiterung',2000,2000,NULL,'Gewonnen',NULL,'2026-05-15','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-18','2026-05',3,e.id,'Luger Ges.m.b.H.',NULL,'Kontingenterweiterung',11400,11400,NULL,'Gewonnen',NULL,'2026-05-18','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-26','2026-05',3,e.id,'Adolf Tobias Gesellschaft m.b.H.',NULL,'Kontingenterweiterung',9600,9600,NULL,'Gewonnen',NULL,'2026-05-26','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-27','2026-05',3,e.id,'Inter-treuhand Prachner',NULL,'Individuell',7500,7500,NULL,'Gewonnen',NULL,'2026-05-27','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-27','2026-05',3,e.id,'Winkler Transporte ',NULL,'Kontingenterweiterung',3600,3600,NULL,'Gewonnen',NULL,'2026-05-27','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-28','2026-05',3,e.id,'EAS Stöckl',NULL,'Individuell',600,600,NULL,'Gewonnen',NULL,'2026-05-28','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-28','2026-05',3,e.id,'Franz Löschnig Gesellschaft m.b.H. / Sekundaras Eisenhandel',NULL,'Kontingenterweiterung',4400,4400,NULL,'Gewonnen',NULL,'2026-05-28','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-01','2026-06',3,e.id,'Sortimo Gesellschaft m.b.H.',NULL,'Kontingenterweiterung',2500,2500,1,'Gewonnen',NULL,'2026-06-01','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,'Energy3000 GmbH',NULL,'Neue Stelle',4860,4860,2,'Gewonnen',NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-07','2026-06',3,e.id,'Hubers Landhendl GmbH',NULL,'Kontingenterweiterung',8000,8000,2,'Gewonnen',NULL,'2026-01-07','2026-06'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,'Bifrangi GmbH',NULL,'Social Media Content',4500,4500,3,'Gewonnen',NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,'Smart:ex Krexner Haustechnik GmbH',NULL,'Neue Stelle',4500,4500,3,'Gewonnen',NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,'Elektrotechnik Steinlechner',NULL,'Kontingenterweiterung',2000,2000,2,'Gewonnen',NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,'ITGA Ingenieurbüro Brunner GmbH',NULL,'Kontingenterweiterung',7200,7200,6,'Gewonnen',NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-08','2026-06',3,e.id,'Goldwechselhaus GmbH',NULL,'Kontingenterweiterung',15000,15000,5,'Gewonnen',NULL,'2026-06-08','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-09','2026-06',3,e.id,'Prantl Roppen Erd- und Leitungsbau GmbH',NULL,'Kontingenterweiterung',4620,4620,1,'Gewonnen',NULL,'2026-06-09','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-09','2026-06',3,e.id,'Heinle Elektroanlagen GmbH',NULL,'Kontingenterweiterung',14000,14000,7,'Gewonnen',NULL,'2026-06-09','2026-06'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,'Erdbau Arno Schafferer GmbH',NULL,'Kontingenterweiterung',3600,3600,NULL,'Gewonnen',NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,'Zirngast Fenster-Türen GesmbH',NULL,'Kontingenterweiterung',5000,5000,NULL,'Gewonnen',NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,'Oö. Boden- und Baustoffprüfstelle GmbH',NULL,'Kontingenterweiterung',8800,8800,NULL,'Gewonnen',NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-12','2026-06',3,e.id,'Liska Schwimmbadtechnik GmbH ',NULL,'Kontingenterweiterung',4000,4000,NULL,'Gewonnen',NULL,'2026-06-12','2026-06'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-15','2026-06',3,e.id,'Quo Transporte',NULL,'Kontingenterweiterung',4000,4000,2,'Gewonnen',NULL,'2026-06-15','2026-06'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-15','2026-06',3,e.id,'Inter-Treuhand Prachner GmbH',NULL,'Individuell',1500,1500,NULL,'Gewonnen',NULL,'2026-06-15','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-16','2026-06',3,e.id,'Engl-Glas GmbH',NULL,'Kontingenterweiterung',1200,1200,NULL,'Gewonnen',NULL,'2026-06-16','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-16','2026-06',3,e.id,'ELSNER Pflege Mag. Christian H. Elsner',NULL,'Kontingenterweiterung',24000,24000,NULL,'Gewonnen',NULL,'2026-06-16','2026-06'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-16','2026-06',3,e.id,'HOLL Schlosserei & Sicherheitstechnik GmbH',NULL,'Kontingenterweiterung',9000,9000,NULL,'Gewonnen',NULL,'2026-06-16','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;

-- 4. VL Deals (Verlaengerungen) - Echte Kundennamen und Einzelwerte
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-05','2026-01',3,e.id,'INTERTREU SteuerberatungsGmbH ',NULL,4000,4000,2,2,'2026-02-06','Gewonnen',NULL,NULL,'2026-01-05','2026-01'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-06','2026-01',3,e.id,'Trugina & Partner Ingenieurbüro für KuW GmbH  ',NULL,4000,4000,2,1,'2026-02-07','Gewonnen',NULL,NULL,'2026-01-06','2026-01'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-14','2026-01',3,e.id,'TIP Trailer Services Austria GmbH ',NULL,4400,4400,2,1,'2026-02-15','Gewonnen',NULL,NULL,'2026-01-14','2026-01'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-23','2026-01',3,e.id,'Atzlinger GmbH ',NULL,6300,6300,3,1,'2026-02-24','Gewonnen',NULL,NULL,'2026-01-23','2026-01'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-10','2026-01',3,e.id,'BVS Wassertechnik GmbH  ',NULL,4000,4000,2,2,'2026-02-11','Gewonnen',NULL,NULL,'2026-01-10','2026-01'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-19','2026-01',3,e.id,'Citrocasa GmbH  ',NULL,4000,4000,2,1,'2026-02-20','Gewonnen',NULL,NULL,'2026-01-19','2026-01'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-23','2026-01',3,e.id,'Malerei Robert Wimmer GmbH ',NULL,4000,4000,2,1,'2026-02-24','Gewonnen',NULL,NULL,'2026-01-23','2026-01'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-23','2026-01',3,e.id,'Bauer Kompressoren Ges.m.b.H.',NULL,4000,4000,2,1,'2026-02-24','Gewonnen',NULL,NULL,'2026-01-23','2026-01'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2025-12-30','2026-01',3,e.id,'TECE Österreich GmbH ',NULL,4000,4000,2,1,'2026-01-31','Gewonnen',NULL,NULL,'2025-12-30','2026-01'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-24','2026-01',3,e.id,'Gebrüder Metzinger GmbH ',NULL,6000,6000,3,1,'2026-02-25','Gewonnen',NULL,NULL,'2026-01-24','2026-01'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2025-12-30','2026-01',3,e.id,'TBB Bauer & Bauer GmbH ',NULL,4000,4000,2,1,'2026-01-31','Gewonnen',NULL,NULL,'2025-12-30','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-08','2026-01',3,e.id,'Glavassevich Wintergärtner GmbH ',NULL,4000,4000,2,1,'2026-02-08','Gewonnen',NULL,NULL,'2026-01-08','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-11','2026-01',3,e.id,'Hubers Landhendl GmbH  ',NULL,4000,4000,2,1,'2026-02-12','Gewonnen',NULL,NULL,'2026-01-11','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-12','2026-01',3,e.id,'E. Kneidinger GmbH  ',NULL,4000,4000,2,1,'2026-02-13','Gewonnen',NULL,NULL,'2026-01-12','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-15','2026-01',3,e.id,'Zorn & Nowy - ZT GmbH  ',NULL,4000,4000,2,2,'2026-02-16','Gewonnen',NULL,NULL,'2026-01-15','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-18','2026-01',3,e.id,'Mairaum GmbH ',NULL,4000,4000,2,1,'2026-02-19','Gewonnen',NULL,NULL,'2026-01-18','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-19','2026-01',3,e.id,'Elektrotausendsassa Inh. Christoph Poscharnik e.U.  ',NULL,4000,4000,2,1,'2026-02-20','Gewonnen',NULL,NULL,'2026-01-19','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-20','2026-01',3,e.id,'Stahlbau Puntigam GmbH  ',NULL,4000,4000,2,1,'2026-02-21','Gewonnen',NULL,NULL,'2026-01-20','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-26','2026-01',3,e.id,'Rappersberger GmbH  ',NULL,4000,4000,2,1,'2026-02-27','Gewonnen',NULL,NULL,'2026-01-26','2026-01'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-01','2026-01',3,e.id,'Slw Soziale Dienste GmbH ',NULL,5250,5250,3,1,'2026-02-02','Gewonnen',NULL,NULL,'2026-01-01','2026-01'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-14','2026-01',3,e.id,'VKM GmbH  ',NULL,4000,4000,2,1,'2026-02-15','Gewonnen',NULL,NULL,'2026-01-14','2026-01'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-01-20','2026-01',3,e.id,'Dr. med. dent. Evren Orun ',NULL,4000,4000,2,1,'2026-02-21','Gewonnen',NULL,NULL,'2026-01-20','2026-01'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2025-12-30','2026-01',3,e.id,'Gleitbau GmbH  ',NULL,6800,6800,4,1,'2026-01-31','Gewonnen',NULL,NULL,'2025-12-30','2026-01'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-01','2026-02',3,e.id,'Forstdienst Lebensräume im Grünen GmbH',NULL,4000,4000,2,1,'2026-03-01','Gewonnen',NULL,NULL,'2026-02-01','2026-02'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-14','2026-02',3,e.id,'Axamer Lizum GmbH',NULL,4000,4000,2,2,'2026-03-13','Gewonnen',NULL,NULL,'2026-02-14','2026-02'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-25','2026-02',3,e.id,'Nestec Scharf IT-Solutions OG',NULL,4800,4800,2,2,'2026-03-24','Gewonnen',NULL,NULL,'2026-02-25','2026-02'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-06','2026-02',3,e.id,'Haustechnik Fichtinger GmbH',NULL,4000,4000,2,1,'2026-03-05','Gewonnen',NULL,NULL,'2026-02-06','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-17','2026-02',3,e.id,'GIS Industrieautomation GmbH',NULL,8000,8000,4,1,'2026-03-16','Gewonnen',NULL,NULL,'2026-02-17','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-28','2026-02',3,e.id,'Sortimo Gesellschaft m.b.H.',NULL,4000,4000,2,1,'2026-03-28','Gewonnen',NULL,NULL,'2026-02-28','2026-02'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-14','2026-02',3,e.id,'EAS Elektro Anlagen Stöckl GmbH',NULL,4000,4000,2,1,'2026-03-13','Gewonnen',NULL,NULL,'2026-02-14','2026-02'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-02-28','2026-02',3,e.id,'Dietzel GmbH',NULL,4000,4000,2,4,'2026-03-30','Gewonnen',NULL,NULL,'2026-02-28','2026-02'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-07','2026-03',3,e.id,'Karl Wohllaib GmbH',NULL,4000,4000,2,1,'2026-04-07','Gewonnen',NULL,NULL,'2026-03-07','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-08','2026-03',3,e.id,'INTERTREU SteuerberatungsgmbH',NULL,4000,4000,2,2,'2026-04-09','Gewonnen',NULL,NULL,'2026-03-08','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-11','2026-03',3,e.id,'Planegger Holz GmbH',NULL,4000,4000,2,1,'2026-04-12','Gewonnen',NULL,NULL,'2026-03-11','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-12','2026-03',3,e.id,'Martin Pichler Ziegelwerke GmbH',NULL,4000,4000,2,1,'2026-04-12','Gewonnen',NULL,NULL,'2026-03-12','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-16','2026-03',3,e.id,'Harbeck Mietkräne GmbH & Co KG',NULL,4000,4000,2,1,'2026-04-17','Gewonnen',NULL,NULL,'2026-03-16','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-17','2026-03',3,e.id,'TIP TRAILER Services Austria GmbH',NULL,4400,4400,2,2,'2026-04-18','Gewonnen',NULL,NULL,'2026-03-17','2026-03'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-10','2026-03',3,e.id,'Alfred Feuerstein GmbH',NULL,4000,4000,2,1,'2026-04-10','Gewonnen',NULL,NULL,'2026-03-10','2026-03'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-16','2026-03',3,e.id,'bgd Werbetechnik GmbH',NULL,5000,5000,2,1,'2026-04-17','Gewonnen',NULL,NULL,'2026-03-16','2026-03'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-18','2026-03',3,e.id,'Waema - Wärmetechnik und Maschinenbau GmbH',NULL,4000,4000,2,1,'2026-04-19','Gewonnen',NULL,NULL,'2026-03-18','2026-03'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-10','2026-03',3,e.id,'Pincolits Battery Recycling GmbH',NULL,4000,4000,2,1,'2026-04-10','Gewonnen',NULL,NULL,'2026-03-10','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-10','2026-03',3,e.id,'Johann Radauer GmbH',NULL,4000,4000,2,1,'2026-04-11','Gewonnen',NULL,NULL,'2026-03-10','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-13','2026-03',3,e.id,'KOSCHUTZ Korissionschutz GmbH',NULL,5000,5000,2,1,'2026-04-13','Gewonnen',NULL,NULL,'2026-04-13','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-18','2026-03',3,e.id,'Zirngast Fenster-Türen GmbH',NULL,5000,5000,2,1,'2026-04-18','Gewonnen',NULL,NULL,'2026-03-18','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-24','2026-03',3,e.id,'Kohlbrat & Bunz GmbH',NULL,4000,4000,2,1,'2026-04-24','Gewonnen',NULL,NULL,'2026-03-24','2026-03'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-01','2026-03',3,e.id,'Mabeko GmbH',NULL,35880,35880,12,1,'2027-06-01','Gewonnen',NULL,NULL,'2026-03-01','2026-03'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-03','2026-03',3,e.id,'slw Soziale Dienste GmbH',NULL,5250,5250,3,2,'2026-04-04','Gewonnen',NULL,NULL,'2026-03-03','2026-03'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-25','2026-03',3,e.id,'Micro-Systeme Entwicklungs und Produktions GmbH ',NULL,5000,5000,2,1,'2026-04-25','Gewonnen',NULL,NULL,'2026-03-25','2026-03'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-26','2026-03',3,e.id,'KACO Dichtungstechnik Ges.m.b.H.',NULL,4500,4500,2,1,'2026-04-26','Gewonnen',NULL,NULL,'2026-03-26','2026-03'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-08','2026-04',3,e.id,'SK-Stahlbau / Kovoreal - Holic',NULL,6900,6900,3,1,'2026-05-07','Gewonnen',NULL,NULL,'2026-04-08','2026-04'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-13','2026-04',3,e.id,'Axamer Lizum GmbH & Co KG',NULL,4000,4000,2,3,'2026-05-12','Gewonnen',NULL,NULL,'2026-04-13','2026-04'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-16','2026-04',3,e.id,'Elektro Rapold GmbH',NULL,5000,5000,2,1,'2026-05-15','Gewonnen',NULL,NULL,'2026-04-16','2026-04'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-18','2026-04',3,e.id,'AGU Architektengruppe U-Bahn Ziviltechniker GmbH',NULL,4400,4400,2,1,NULL,'Gewonnen',NULL,NULL,'2026-04-18','2026-04'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-12','2026-04',3,e.id,'Exterstahl GmbH',NULL,4600,4600,2,1,'2026-05-11','Gewonnen',NULL,NULL,'2026-04-12','2026-04'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-04','2026-04',3,e.id,'PWL Anlagentechnik Handelsgesellschaft m.b.H.',NULL,4000,4000,2,1,'2026-05-03','Gewonnen',NULL,NULL,'2026-04-04','2026-04'
  FROM employees e WHERE e.name='Arton Mustafa' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-02','2026-04',3,e.id,'Fliesen Gatterer Handel und Verlegung',NULL,4000,4000,2,2,'2026-05-01','Gewonnen',NULL,NULL,'2026-04-02','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-03','2026-04',3,e.id,'Novoferm Austria GmbH',NULL,5000,5000,2,1,'2026-05-02','Gewonnen',NULL,NULL,'2026-04-03','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-03','2026-04',3,e.id,'EBG MedAustron GmbH',NULL,4000,4000,2,1,'2026-05-02','Gewonnen',NULL,NULL,'2026-04-03','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-09','2026-04',3,e.id,'Schwarte Group GmbH DE',NULL,8000,8000,4,1,'2026-05-08','Gewonnen',NULL,NULL,'2026-04-09','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-16','2026-04',3,e.id,'Karl Strauß GmbH',NULL,4000,4000,2,1,'2026-05-16','Gewonnen',NULL,NULL,'2026-04-16','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-21','2026-04',3,e.id,'Eco Wirtschaftstreuhand Steuerberatung - ecostb GmbH',NULL,6000,6000,4,1,'2026-05-21','Gewonnen',NULL,NULL,'2026-04-21','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-25','2026-04',3,e.id,'WELCOME Versicherungsmakler GmbH ',NULL,3000,3000,1,1,'2026-05-08','Gewonnen',NULL,NULL,'2026-04-25','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-30','2026-04',3,e.id,'GIS Industrieautomation GmbH (Stellen laufen gleichz.)',NULL,8000,8000,4,2,'2026-05-30','Gewonnen',NULL,NULL,'2026-04-30','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-30','2026-04',3,e.id,'ATC Engineering GmbH',NULL,4400,4400,2,2,'2026-05-30','Gewonnen',NULL,NULL,'2026-04-30','2026-04'
  FROM employees e WHERE e.name='Daniel Saliba' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-01','2026-04',3,e.id,'Stern Bau GmbH',NULL,4400,4400,2,1,'2026-04-30','Gewonnen',NULL,NULL,'2026-04-01','2026-04'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-02','2026-04',3,e.id,'Mag. Birgit Eichberger Steuerberatung',NULL,5000,5000,2,1,'2026-05-01','Gewonnen',NULL,NULL,'2026-04-02','2026-04'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-03','2026-04',3,e.id,'Bodenwerkstatt Böttinger & Danielauer GmbH',NULL,4400,4400,2,1,'2026-05-02','Gewonnen',NULL,NULL,'2026-04-03','2026-04'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-17','2026-04',3,e.id,'Weissbacher W. GmbH',NULL,4400,4400,2,1,'2026-05-16','Gewonnen',NULL,NULL,'2026-04-17','2026-04'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-19','2026-04',3,e.id,'WK Pulverbeschichtung Ges.m.b.H.',NULL,5000,5000,2,1,'2026-05-18','Gewonnen',NULL,NULL,'2026-04-19','2026-04'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-25','2026-04',3,e.id,'Medek & Schörner GmbH',NULL,5000,5000,2,1,'2026-05-24','Gewonnen',NULL,NULL,'2026-04-25','2026-04'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-08','2026-04',3,e.id,'K4 Objektpartner GmbH',NULL,4000,4000,2,1,'2026-05-07','Gewonnen',NULL,NULL,'2026-04-08','2026-04'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-03-03','2026-04',3,e.id,'slw Soziale Dienste GmbH',NULL,5250,5250,3,2,'2026-04-04','Gewonnen',NULL,NULL,'2026-03-03','2026-04'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-04-12','2026-04',3,e.id,'Elektro Krepper Gesellschaft m.b.H.',NULL,18000,18000,12,NULL,'2026-05-23','Gewonnen',NULL,NULL,'2026-04-12','2026-04'
  FROM employees e WHERE e.name='Albert Drezgaj' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,'Tischlerei Edinger GmbH',NULL,6600,6600,3,1,'2026-05-31','Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-11','2026-05',3,e.id,'INTERTREU Steuerberatungsgesellschaft m.b.H.',NULL,4000,4000,2,2,'2026-06-10','Gewonnen',NULL,NULL,'2026-05-11','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-13','2026-05',3,e.id,'Sanibau Handelsgesellschaft m.b.H. / warten mit RE / Juli ',NULL,7500,7500,3,1,'2026-06-12','Gewonnen',NULL,NULL,'2026-05-13','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-15','2026-05',3,e.id,'halcö Alfred Hörtnagl GmbH',NULL,5000,5000,2,1,'2026-06-14','Gewonnen',NULL,NULL,'2026-05-15','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-30','2026-05',3,e.id,'Rechberger Bau GmbH',NULL,4000,4000,2,2,'2026-06-30','Gewonnen',NULL,NULL,'2026-05-30','2026-05'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-07','2026-05',3,e.id,'HANNL Metallbau GmbH',NULL,4400,4400,2,1,'2026-06-05','Gewonnen',NULL,NULL,'2026-05-07','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-23','2026-05',3,e.id,'HFP Ingenieurbüro für Gebäudetechnik GmbH',NULL,5000,5000,2,1,'2026-06-22','Gewonnen',NULL,NULL,'2026-05-23','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-23','2026-05',3,e.id,'Baumeister Karl Fürholzer Hoch- und TiefbaugesmbH',NULL,5000,5000,2,1,'2026-06-22','Gewonnen',NULL,NULL,'2026-05-23','2026-05'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-07','2026-05',3,e.id,'Elektrizitätswerk Gösting V. Franz GmbH',NULL,4400,4400,2,1,'2026-06-06','Gewonnen',NULL,NULL,'2026-05-07','2026-05'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-20','2026-05',3,e.id,'Zirngast Fenster-Türen GmbH',NULL,5000,5000,2,2,'2026-06-28','Gewonnen',NULL,NULL,'2026-05-20','2026-05'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-26','2026-05',3,e.id,'Kohlbrat & Bunz GmbH',NULL,4000,4000,2,2,'2026-06-25','Gewonnen',NULL,NULL,'2026-05-26','2026-05'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-30','2026-05',3,e.id,'Kumera Antriebstechnik GmbH',NULL,4400,4400,2,1,'2026-06-29','Gewonnen',NULL,NULL,'2026-05-30','2026-05'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-01','2026-05',3,e.id,'Ing. Johannes Dornhecker ',NULL,3500,3500,2,1,'2026-05-31','Gewonnen',NULL,NULL,'2026-05-01','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-08','2026-05',3,e.id,'floorex GmbH - warten mit RE',NULL,4000,4000,2,1,'2026-06-07','Gewonnen',NULL,NULL,'2026-05-08','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-14','2026-05',3,e.id,'Weiss Motoren GmbH',NULL,4400,4400,2,1,'2026-06-13','Gewonnen',NULL,NULL,'2026-05-14','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-23','2026-05',3,e.id,'Fuchs Sanitär- und Heizungstechnik GmbH',NULL,4600,4600,2,1,'2026-06-22','Gewonnen',NULL,NULL,'2026-05-23','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-28','2026-05',3,e.id,'Trinicum GmbH',NULL,5000,5000,2,1,'2026-06-27','Gewonnen',NULL,NULL,'2026-05-28','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-30','2026-05',3,e.id,'Feiba Engineering & Plants GmbH ',NULL,5000,5000,2,1,'2026-06-29','Gewonnen',NULL,NULL,'2026-05-30','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-05-30','2026-05',3,e.id,'Bürgler & Mooslechner GmbH',NULL,4400,4400,2,1,'2026-06-30','Gewonnen',NULL,NULL,'2026-05-30','2026-05'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-05','2026-06',3,e.id,'Horiba GmbH ',NULL,5000,5000,2,1,'2026-07-04','Gewonnen',NULL,NULL,'2026-06-05','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-07','2026-06',3,e.id,'Ton & Bild Medientechnik GmbH',NULL,5400,5400,2,1,'2026-07-06','Gewonnen',NULL,NULL,'2026-06-07','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-10','2026-06',3,e.id,'Exterstahl GmbH',NULL,4600,4600,2,2,'2026-07-09','Gewonnen',NULL,NULL,'2026-06-10','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,'DIMOCO Payments GmbH',NULL,2500,2500,2,1,'2026-07-10','Gewonnen',NULL,NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-12','2026-06',3,e.id,'Gestra Spiel- und Freizeiteinrichtungen',NULL,4400,4400,2,1,'2026-07-11','Gewonnen',NULL,NULL,'2026-06-12','2026-06'
  FROM employees e WHERE e.name='Alexander Korak' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-03','2026-06',3,e.id,'Alpsolar Klimadesign OG',NULL,5000,5000,2,1,'2026-07-02','Gewonnen',NULL,NULL,'2026-06-03','2026-06'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-05','2026-06',3,e.id,'Autohaus Oberhofer Josef GmbH',NULL,4400,4400,2,1,'2026-07-04','Gewonnen',NULL,NULL,'2026-06-05','2026-06'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-16','2026-06',3,e.id,'Weissbacher W. GmbH',NULL,4400,4400,2,2,'2026-07-15','Gewonnen',NULL,NULL,'2026-06-16','2026-06'
  FROM employees e WHERE e.name='Lukas Riegler' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-04','2026-06',3,e.id,'KWSG Elektrotechnik GmbH',NULL,5400,5400,2,1,'2026-07-03','Gewonnen',NULL,NULL,'2026-06-04','2026-06'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-08','2026-06',3,e.id,'Heizung Sanitär Schöpf GmbH',NULL,5400,5400,2,1,'2026-07-07','Gewonnen',NULL,NULL,'2026-06-08','2026-06'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-11','2026-06',3,e.id,'BIO-AKTIV Günther Johann',NULL,5400,5400,2,1,'2026-07-10','Gewonnen',NULL,NULL,'2026-06-11','2026-06'
  FROM employees e WHERE e.name='Matthias Niedermoser' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,'EBG MedAustron GmbH',NULL,4000,4000,2,2,'2026-07-01','Gewonnen',NULL,NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-02','2026-06',3,e.id,'Novoferm Austria GmbH',NULL,5000,5000,2,2,'2026-07-01','Gewonnen',NULL,NULL,'2026-06-02','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,abgerechnet,kommentar,gewonnen_datum,gewonnen_monat)
  SELECT '2026-06-12','2026-06',3,e.id,'TWF Baumaschinentechnik GmbH',NULL,4000,4000,2,1,'2026-07-11','Gewonnen',NULL,NULL,'2026-06-12','2026-06'
  FROM employees e WHERE e.name='Stefan Morawitz' AND e.company_id=3 LIMIT 1;

-- 5. ae_gesamt_monthly korrigieren (nur Jan-Mai, Jun nutzt Live-Deals)
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 37,
  nk_at_ae  = 160000,
  nk_gesamt = nk_gesamt - nk_at_ae + 160000,
  bk_gesamt = bk_gesamt - 75400,
  vl_gesamt = vl_gesamt + 0,
  gesamt    = gesamt - nk_at_ae + 160000 - 75400 + 0
WHERE monat = '2026-01';
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 33,
  nk_at_ae  = 153050,
  nk_gesamt = nk_gesamt - nk_at_ae + 153050,
  bk_gesamt = bk_gesamt - 189540,
  vl_gesamt = vl_gesamt + 0,
  gesamt    = gesamt - nk_at_ae + 153050 - 189540 + 0
WHERE monat = '2026-02';
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 38,
  nk_at_ae  = 173550,
  nk_gesamt = nk_gesamt - nk_at_ae + 173550,
  bk_gesamt = bk_gesamt - 106300,
  vl_gesamt = vl_gesamt - 7350,
  gesamt    = gesamt - nk_at_ae + 173550 - 106300 - 7350
WHERE monat = '2026-03';
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 42,
  nk_at_ae  = 215150,
  nk_gesamt = nk_gesamt - nk_at_ae + 215150,
  bk_gesamt = bk_gesamt - 45580,
  vl_gesamt = vl_gesamt + 4400,
  gesamt    = gesamt - nk_at_ae + 215150 - 45580 + 4400
WHERE monat = '2026-04';
UPDATE ae_gesamt_monthly SET
  nk_at_anz = 32,
  nk_at_ae  = 174560,
  nk_gesamt = nk_gesamt - nk_at_ae + 174560,
  bk_gesamt = bk_gesamt - 13000,
  vl_gesamt = vl_gesamt + 0,
  gesamt    = gesamt - nk_at_ae + 174560 - 13000 + 0
WHERE monat = '2026-05';