-- Migration 049: VL Vertragsdaten (PostgreSQL)
-- 50 UPDATEs (neue Spalten befüllen) + 67 neue INSERTs (Juni/Juli 2026)


-- ── UPDATES (50) ─────────────────────────────────────────────────

-- bgd Werbetechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3171', vertragsbeginn='2026-05-16', ende_laufzeit='2026-07-16', ende_kuendigungsfrist='2026-06-16', wie_vielt_verlaengerung=2, updated_at=NOW() WHERE id=3702;

-- Graf-Dichtungen GmbH
UPDATE deals_vl SET vertragsnummer='11875', vertragsbeginn='2026-05-26', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-07-12', laufzeit_monate=2, angebotswert=4600, updated_at=NOW() WHERE id=1466;

-- HOWE Umwelttechnik GmbH
UPDATE deals_vl SET vertragsnummer='12175', vertragsbeginn='2026-05-16', ende_laufzeit='2026-07-16', ende_kuendigungsfrist='2026-07-02', laufzeit_monate=2, angebotswert=9200, updated_at=NOW() WHERE id=1461;

-- Wartig Nord GmbH
UPDATE deals_vl SET vertragsnummer='12134', vertragsbeginn='2026-05-12', ende_laufzeit='2026-07-12', ende_kuendigungsfrist='2026-06-28', wie_vielt_verlaengerung=2, updated_at=NOW() WHERE id=3572;

-- MR Landkreis Ansbach GmbH
UPDATE deals_vl SET vertragsnummer='12105', vertragsbeginn='2026-05-03', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', wie_vielt_verlaengerung=2, updated_at=NOW() WHERE id=3786;

-- Mag. Birgit Eichberger Steuerberatung
UPDATE deals_vl SET vertragsnummer='AN26-3344', vertragsbeginn='2026-05-03', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', updated_at=NOW() WHERE id=3611;

-- Bardowicks.Haus und Holzbau GmbH
UPDATE deals_vl SET vertragsnummer='11687', vertragsbeginn='2026-05-23', ende_laufzeit='2026-07-23', ende_kuendigungsfrist='2026-07-09', laufzeit_monate=2, angebotswert=6000, updated_at=NOW() WHERE id=1463;

-- Novoferm Austria GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3317', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-04', ende_kuendigungsfrist='2026-06-04', updated_at=NOW() WHERE id=3640;

-- M. Kratzer Sanitär Heizung Spenglerei GmbH
UPDATE deals_vl SET vertragsnummer='12216', vertragsbeginn='2026-05-30', ende_laufzeit='2026-07-30', ende_kuendigungsfrist='2026-07-16', wie_vielt_verlaengerung=1, angebotswert=6000, updated_at=NOW() WHERE id=3853;

-- Fahrner GmbH
UPDATE deals_vl SET vertragsnummer='AN25-5179', vertragsbeginn='2026-05-13', ende_laufzeit='2026-07-13', ende_kuendigungsfrist='2026-06-13', wie_vielt_verlaengerung=2, updated_at=NOW() WHERE id=3972;

-- Elektro Rapold GmbH (→ Elektro Rapold GmbH )
UPDATE deals_vl SET vertragsnummer='ab', vertragsbeginn='2026-05-17', ende_laufzeit='2026-07-17', ende_kuendigungsfrist='2026-06-17', updated_at=NOW() WHERE id=3601;

-- Karl Strauß GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3402', vertragsbeginn='2026-05-18', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-06-18', updated_at=NOW() WHERE id=3644;

-- AGU Architektengruppe U-Bahn Ziviltechniker GmbH (→ AGU Architektengruppe U-Bahn ZT GmbH)
UPDATE deals_vl SET vertragsnummer='AN26-3239', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', updated_at=NOW() WHERE id=3605;

-- BSU Sanierungsunion Berlin GmbH
UPDATE deals_vl SET vertragsnummer='11470', vertragsbeginn='2026-05-20', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-07-06', wie_vielt_verlaengerung=1, angebotswert=4600, updated_at=NOW() WHERE id=3850;

-- WK Pulverbeschichtung Ges.m.b.H.
UPDATE deals_vl SET vertragsnummer='AN26-3311', vertragsbeginn='2026-05-20', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-06-20', updated_at=NOW() WHERE id=3621;

-- Eco Wirtschaftstreuhand Steuerberatung - ecostb GmbH (→ ECO Wirtschaftstreuhand Steuerberatung  - ecostb GmbH)
UPDATE deals_vl SET vertragsnummer='AN26-3438', vertragsbeginn='2026-03-23', ende_laufzeit='2026-07-22', ende_kuendigungsfrist='2026-06-22', updated_at=NOW() WHERE id=3646;

-- KST-Motorenversuch GmbH & Co. KG
UPDATE deals_vl SET vertragsnummer='12235', vertragsbeginn='2026-05-23', ende_laufzeit='2026-07-23', ende_kuendigungsfrist='2026-07-09', wie_vielt_verlaengerung=1, updated_at=NOW() WHERE id=3584;

-- Medek & Schörner GmbH
UPDATE deals_vl SET vertragsnummer='AN25-4862', vertragsbeginn='2026-05-26', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=NOW() WHERE id=3624;

-- Hubers Landhendl GmbH (→ Hubers Landhendl GmbH  )
UPDATE deals_vl SET vertragsnummer='AN26-3476', vertragsbeginn='2026-03-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', wie_vielt_verlaengerung=1, updated_at=NOW() WHERE id=3666;

-- Kinder- und Jugendärzte Dr. med. Holger Meinicke und Dr. med. Björn Klawitter
UPDATE deals_vl SET vertragsnummer='12197', vertragsbeginn='2026-05-12', ende_laufzeit='2026-07-11', ende_kuendigungsfrist='2026-06-27', wie_vielt_verlaengerung=1, updated_at=NOW() WHERE id=3579;

-- Sanibau Handelsgesellschaft m.b.H. (→ Sanibau Handelsgesellschaft m.b.H. / warten mit RE / Juli )
UPDATE deals_vl SET vertragsnummer='AN26-3425', vertragsbeginn='2026-04-14', ende_laufzeit='2026-07-13', ende_kuendigungsfrist='2026-06-13', wie_vielt_verlaengerung=1, laufzeit_monate=3, updated_at=NOW() WHERE id=3731;

-- INDUSTRIE- UND TANKANLAGEN Führer & Weingartner GmbH (→ Industrie- und Tankanlagen Führer & Weingartner GmbH)
UPDATE deals_vl SET vertragsnummer='12284', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-19', wie_vielt_verlaengerung=1, updated_at=NOW() WHERE id=3569;

-- Bauer GmbH Landwirtschaftliche Beregnungsanlagen
UPDATE deals_vl SET vertragsnummer='11947', vertragsbeginn='2026-05-13', ende_laufzeit='2026-07-13', ende_kuendigungsfrist='2026-06-29', wie_vielt_verlaengerung=3, updated_at=NOW() WHERE id=3578;

-- St. Martin Pflegeheim GmbH
UPDATE deals_vl SET vertragsnummer='JK-13319', vertragsbeginn='2026-04-20', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', wie_vielt_verlaengerung=1, updated_at=NOW() WHERE id=3568;

-- sicht-pack Hagner GmbH
UPDATE deals_vl SET vertragsnummer='2', vertragsbeginn='2026-06-25', ende_laufzeit='2026-07-25', ende_kuendigungsfrist='2026-07-11', laufzeit_monate=1, angebotswert=0, updated_at=NOW() WHERE id=1456;

-- Autohaus Louis Dresen GmbH
UPDATE deals_vl SET vertragsnummer='12337', vertragsbeginn='2026-05-13', ende_laufzeit='2026-07-12', ende_kuendigungsfrist='2026-06-28', wie_vielt_verlaengerung=1, updated_at=NOW() WHERE id=3581;

-- Kieser Training GmbH
UPDATE deals_vl SET vertragsnummer='12286', vertragsbeginn='2026-05-11', ende_laufzeit='2026-07-10', ende_kuendigungsfrist='2026-06-26', wie_vielt_verlaengerung=1, updated_at=NOW() WHERE id=3576;

-- DOG Deutsche Oelfabrik Gesellschaft für chemische Erzeugnisse mbH & Co. KG
UPDATE deals_vl SET vertragsnummer='12345', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-07-04', laufzeit_monate=2, angebotswert=6000, updated_at=NOW() WHERE id=1474;

-- Alpsolar Klimadesign OG
UPDATE deals_vl SET vertragsnummer='AN26-3642', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', updated_at=NOW() WHERE id=3613;

-- Energy3000 solar GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3828', vertragsbeginn='2026-05-05', ende_laufzeit='2026-07-04', ende_kuendigungsfrist='2026-06-04', updated_at=NOW() WHERE id=3590;

-- KWSG Elektrotechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3821', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', updated_at=NOW() WHERE id=3630;

-- Autohaus Oberhofer Josef GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3652', vertragsbeginn='2026-05-07', ende_laufzeit='2026-07-06', ende_kuendigungsfrist='2026-06-06', updated_at=NOW() WHERE id=3614;

-- Ton & Bild Medientechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3857', vertragsbeginn='2026-05-07', ende_laufzeit='2026-07-06', ende_kuendigungsfrist='2026-06-06', updated_at=NOW() WHERE id=3593;

-- Heizung-Sanitär Schöpf GmbH (→ Heizung Sanitär Schöpf GmbH)
UPDATE deals_vl SET vertragsnummer='AN26-3865', vertragsbeginn='2026-05-11', ende_laufzeit='2026-07-10', ende_kuendigungsfrist='2026-06-10', updated_at=NOW() WHERE id=3632;

-- BIO-AKTIV Günther Johann Wasser- und Wärmetechnik (→ BIO-AKTIV Günther Johann)
UPDATE deals_vl SET vertragsnummer='AN26-3876', vertragsbeginn='2026-05-12', ende_laufzeit='2026-07-11', ende_kuendigungsfrist='2026-06-11', updated_at=NOW() WHERE id=3633;

-- DIMOCO Payments GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3605', vertragsbeginn='2026-05-12', ende_laufzeit='2026-07-11', ende_kuendigungsfrist='2026-06-11', updated_at=NOW() WHERE id=3597;

-- Wilhelm Ungeheuer Söhne GmbH
UPDATE deals_vl SET vertragsnummer='12150', vertragsbeginn='2026-03-03', ende_laufzeit='2026-07-02', ende_kuendigungsfrist='2026-06-18', wie_vielt_verlaengerung=1, updated_at=NOW() WHERE id=1280;

-- Holzbau Lengauer-Stockner GmbH (→ Holzbau lengauer-Stockner GmbH)
UPDATE deals_vl SET vertragsnummer='AN26-3917', vertragsbeginn='2026-05-18', ende_laufzeit='2026-07-17', ende_kuendigungsfrist='2026-06-17', updated_at=NOW() WHERE id=3618;

-- Schönberger Alternative Haustechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3931', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-06-18', updated_at=NOW() WHERE id=3620;

-- FRÖSCHL-BAU GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3742', vertragsbeginn='2026-05-20', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', updated_at=NOW() WHERE id=3645;

-- SPS Klimatechnische Verkaufsu. Beratungs GmbH
UPDATE deals_vl SET vertragsnummer='20260519-073438903', vertragsbeginn='2026-06-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-07-17', laufzeit_monate=2, angebotswert=9000, updated_at=NOW() WHERE id=1478;

-- RIKA KOMPRESSOREN GMBH (→ RIKA KOMPRESSOREN GmbH)
UPDATE deals_vl SET vertragsnummer='AN26-3962', vertragsbeginn='2026-05-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-06-20', updated_at=NOW() WHERE id=3622;

-- Gärtnerei Rischer GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3914', vertragsbeginn='2026-05-26', ende_laufzeit='2026-07-25', ende_kuendigungsfrist='2026-06-25', updated_at=NOW() WHERE id=3608;

-- Tirolpack GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3965', vertragsbeginn='2026-05-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-05-26', updated_at=NOW() WHERE id=3625;

-- REFORM Fenster GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3989', vertragsbeginn='2026-05-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=NOW() WHERE id=3626;

-- SBT Steuerberatungs GmbH & Co KG (→ SBT Steuerberatungs GmbH)
UPDATE deals_vl SET vertragsnummer='AN26-4000', vertragsbeginn='2026-05-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=NOW() WHERE id=3648;

-- Cargomind (Austria) GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3878', vertragsbeginn='2026-05-29', ende_laufzeit='2026-07-28', ende_kuendigungsfrist='2026-06-28', updated_at=NOW() WHERE id=3649;

-- Genius Steuerberatung GmbH (→ Genius Steuerberatungs GmbH)
UPDATE deals_vl SET vertragsnummer='AN26-4010', vertragsbeginn='2026-05-29', ende_laufzeit='2026-07-28', ende_kuendigungsfrist='2026-06-28', updated_at=NOW() WHERE id=3627;

-- Wintersport Tirol AG & Co - Stubaier Bergbahnen KG (→ Wintersport Tirol AG)
UPDATE deals_vl SET vertragsnummer='AN26-3944', vertragsbeginn='2026-06-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-06-30', updated_at=NOW() WHERE id=3610;

-- Klingler Installationen GmbH (→ Klingler Installationen)
UPDATE deals_vl SET vertragsnummer='AN26-3213', vertragsbeginn='2026-06-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-06-30', updated_at=NOW() WHERE id=3628;


-- ── INSERTS (67) ─────────────────────────────────────────────────

-- mare pflege GmbH Tagespflege Haus Lebensfreude (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-22','2026-06',2,6,'mare pflege GmbH Tagespflege Haus Lebensfreude','Kontingenvertrag',9000,NULL,3,3,'Offen','18851','2026-04-21','2026-07-21','2026-06-21',FALSE,FALSE,0,NOW(),NOW());

-- DRK Pflegedienste Steinburg gGmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-23','2026-06',2,7,'DRK Pflegedienste Steinburg gGmbH','Kontingentvertrag',9000,NULL,3,3,'Offen','18691','2026-04-22','2026-07-22','2026-06-22',FALSE,FALSE,0,NOW(),NOW());

-- MEDIAN Klinik am Südpark Bad Nauheim (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-10','2026-06',2,7,'MEDIAN Klinik am Südpark Bad Nauheim','Active-Sourcing',9000,NULL,3,3,'Offen','18850','2026-04-09','2026-07-09','2026-06-09',FALSE,FALSE,0,NOW(),NOW());

-- Hohenhonnef GmbH Gemeinnützige Ges. der Cornelius-Helferich-Stiftung (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-10','2026-06',2,7,'Hohenhonnef GmbH Gemeinnützige Ges. der Cornelius-Helferich-Stiftung','Kontingentvertrag',10500,NULL,3,2,'Offen','18991','2026-04-09','2026-07-09','2026-06-09',FALSE,FALSE,0,NOW(),NOW());

-- Caritas Wohnen und Pflege gGmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-16','2026-06',2,7,'Caritas Wohnen und Pflege gGmbH','Karriereseite',1500,NULL,3,2,'Offen','JA 11939','2026-04-15','2026-07-15','2026-06-15',FALSE,FALSE,0,NOW(),NOW());

-- Simon Stephan - Spenglerei Stephan (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-19','2026-06',3,41,'Simon Stephan - Spenglerei Stephan','Kontingentmodell',4000,NULL,2,4,'Offen','AN25-4463','2026-05-18','2026-07-18','2026-06-18',FALSE,FALSE,0,NOW(),NOW());

-- Xerra GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-29','2026-06',3,43,'Xerra GmbH','Kontingentmodell',2000,NULL,1,6,'Offen','AN25-4264','2026-06-28','2026-07-28','2026-06-28',FALSE,FALSE,0,NOW(),NOW());

-- M&R Bau GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-12','2026-06',3,39,'M&R Bau GmbH','Einmalige Kampagne',2000,NULL,1,9,'Offen','AM25-5311','2026-06-11','2026-07-11','2026-06-11',FALSE,FALSE,0,NOW(),NOW());

-- Dipl. Ing. Wilhelm Sedlak Gesellschaft m.b.H. (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-28','2026-06',3,43,'Dipl. Ing. Wilhelm Sedlak Gesellschaft m.b.H.','Kontingentmodell',2000,NULL,1,10,'Offen','AN','2026-06-27','2026-07-27','2026-06-27',FALSE,FALSE,0,NOW(),NOW());

-- MEDICLIN Müritz-Klinikum (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-01','2026-07',2,8,'MEDICLIN Müritz-Klinikum','Kontingentvertrag',9000,NULL,3,0,'Offen','2602105','2026-05-01','2026-07-31','2026-06-30',FALSE,FALSE,0,NOW(),NOW());

-- HENN GmbH Hoch- und Tiefbau (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-10','2026-07',1,33,'HENN GmbH Hoch- und Tiefbau','Kontingentpaket',6000,NULL,2,1,'Offen','12110','2026-05-23','2026-07-23','2026-07-09',FALSE,FALSE,0,NOW(),NOW());

-- Sauter Gebäudetechnik GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-28','2026-06',1,7,'Sauter Gebäudetechnik GmbH','Kontingentvertrag',4600,NULL,2,2,'Offen','1668','2026-05-11','2026-07-11','2026-06-27',FALSE,FALSE,0,NOW(),NOW());

-- Krankenhaus Düren gem. GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-13','2026-06',2,7,'Krankenhaus Düren gem. GmbH','Kontingentvertrag',9000,NULL,3,1,'Offen','2602097','2026-04-13','2026-07-12','2026-06-12',FALSE,FALSE,0,NOW(),NOW());

-- Stiftung St. Thomaehof (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-01','2026-07',2,6,'Stiftung St. Thomaehof','Kontingentvertrag',9000,NULL,3,0,'Offen','2603057','2026-05-01','2026-07-31','2026-06-30',FALSE,FALSE,0,NOW(),NOW());

-- Ballmeyer Kälte u. Klima GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-04','2026-07',1,4,'Ballmeyer Kälte u. Klima GmbH','Kontingentpaket',6000,NULL,2,1,'Offen','12114','2026-05-17','2026-07-17','2026-07-03',FALSE,FALSE,0,NOW(),NOW());

-- mosy GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-03','2026-07',2,7,'mosy GmbH','Kontingentpaket',6000,NULL,2,1,'Offen','12224','2026-05-16','2026-07-16','2026-07-02',FALSE,FALSE,0,NOW(),NOW());

-- Die Brücke Konzeptpflege GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-18','2026-07',1,8,'Die Brücke Konzeptpflege GmbH','Kontingentvertrag',6000,NULL,2,0,'Offen','11533','2026-06-01','2026-07-31','2026-07-17',FALSE,FALSE,0,NOW(),NOW());

-- Stiftung Pro Gemeinsinn gGmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-08','2026-06',2,6,'Stiftung Pro Gemeinsinn gGmbH','Kontingentvertrag',13500,NULL,3,1,'Offen','TB-12243','2026-04-08','2026-07-07','2026-06-07',FALSE,FALSE,0,NOW(),NOW());

-- KSP CNC-Technik GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-20','2026-06',2,8,'KSP CNC-Technik GmbH','Kontingentvertrag',6000,NULL,2,1,'Offen','2604017','2026-05-04','2026-07-03','2026-06-19',FALSE,FALSE,0,NOW(),NOW());

-- Wismarer Werkstätten GmbH - Gemeinnützige Einrichtung für Menschen mit Behinderung (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-09','2026-06',2,7,'Wismarer Werkstätten GmbH - Gemeinnützige Einrichtung für Menschen mit Behinderung','Kontingentvertrag',13500,NULL,3,1,'Offen','TB-12275','2026-04-09','2026-07-08','2026-06-08',FALSE,FALSE,0,NOW(),NOW());

-- Sentius Seniorenhaus I GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-15','2026-06',2,7,'Sentius Seniorenhaus I GmbH','Kontingentvertrag',10200,NULL,3,1,'Offen','2604067','2026-04-15','2026-07-14','2026-06-14',FALSE,FALSE,0,NOW(),NOW());

-- Dorow Heizung Lüftung Sanitär GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-07','2026-07',1,8,'Dorow Heizung Lüftung Sanitär GmbH','Kontingentvertrag',6000,NULL,2,0,'Offen','12320','2026-05-21','2026-07-20','2026-07-06',FALSE,FALSE,0,NOW(),NOW());

-- I.D.V. Isolier- und Dämmstoff-Vertriebs-GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-01','2026-07',1,4,'I.D.V. Isolier- und Dämmstoff-Vertriebs-GmbH','Kontingentpaket',6000,NULL,2,0,'Offen','12328','2026-05-15','2026-07-14','2026-06-30',FALSE,FALSE,0,NOW(),NOW());

-- Service 4 Care GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-24','2026-06',2,7,'Service 4 Care GmbH','Kontingentvertrag',12000,NULL,3,1,'Offen','TB-18506','2026-04-24','2026-07-23','2026-06-23',FALSE,FALSE,0,NOW(),NOW());

-- Rheinwohnungsbau GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-20','2026-06',1,8,'Rheinwohnungsbau GmbH','Poolvertrag',13500,NULL,3,1,'Offen','JK-13326','2026-04-20','2026-07-19','2026-06-19',FALSE,FALSE,0,NOW(),NOW());

-- Neurologisches Rehabilitationszentrum Godeshöhe GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-20','2026-06',2,7,'Neurologisches Rehabilitationszentrum Godeshöhe GmbH','Schnellbewerberbutton',1500,NULL,3,1,'Offen','2604086','2026-04-20','2026-07-19','2026-06-19',FALSE,FALSE,0,NOW(),NOW());

-- Rommel-Klinik (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-01','2026-07',2,7,'Rommel-Klinik','Poolvertrag',13500,NULL,3,0,'Offen','BK-12288','2026-05-01','2026-07-31','2026-06-30',FALSE,FALSE,0,NOW(),NOW());

-- Lammetal GmbH Gemeinnützige Lebenshilfe Einrichtungen (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-21','2026-06',2,7,'Lammetal GmbH Gemeinnützige Lebenshilfe Einrichtungen','Poolvertrag',13500,NULL,3,1,'Offen','JK-13324','2026-04-21','2026-07-20','2026-06-20',FALSE,FALSE,0,NOW(),NOW());

-- Seniorenzentrum Hirschkamp GmbH & Co. KG (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-21','2026-06',2,4,'Seniorenzentrum Hirschkamp GmbH & Co. KG','Poolvertrag',13500,NULL,3,1,'Offen','TB-14250','2026-04-21','2026-07-20','2026-06-20',FALSE,FALSE,0,NOW(),NOW());

-- Arbeiter-Samariter-Bund Regionalverband Saalekreis Süd e. V. (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-21','2026-06',2,7,'Arbeiter-Samariter-Bund Regionalverband Saalekreis Süd e. V.','Poolvertrag',13500,NULL,3,1,'Offen','JK-13323','2026-04-21','2026-07-20','2026-06-20',FALSE,FALSE,0,NOW(),NOW());

-- ASB Südbaden | Arbeiter-Samariter-Bund BW Region Südbaden (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-22','2026-06',2,6,'ASB Südbaden | Arbeiter-Samariter-Bund BW Region Südbaden','Poolvertrag',13500,NULL,3,1,'Offen','TB-14272','2026-04-22','2026-07-21','2026-06-21',FALSE,FALSE,0,NOW(),NOW());

-- Spitalstiftung Konstanz Verwaltung (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-20','2026-06',2,6,'Spitalstiftung Konstanz Verwaltung','Poolvertrag',13500,NULL,3,1,'Offen','2604094','2026-04-20','2026-07-19','2026-06-19',FALSE,FALSE,0,NOW(),NOW());

-- Wohnpark St. Elisabeth (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-27','2026-06',2,8,'Wohnpark St. Elisabeth','Poolvertrag',13500,NULL,3,1,'Offen','TB-14278','2026-04-27','2026-07-26','2026-06-26',FALSE,FALSE,0,NOW(),NOW());

-- Rehaklinik Tschugg AG (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-27','2026-06',2,7,'Rehaklinik Tschugg AG','Poolvertrag',13500,NULL,3,1,'Offen','BK-12313','2026-04-27','2026-07-26','2026-06-26',FALSE,FALSE,0,NOW(),NOW());

-- Schlosserei Schliebach GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-01','2026-07',1,4,'Schlosserei Schliebach GmbH','Kontingentpaket',8000,NULL,2,0,'Offen','12361','2026-05-15','2026-07-14','2026-06-30',FALSE,FALSE,0,NOW(),NOW());

-- Braumann Haustechnik GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-04','2026-06',3,41,'Braumann Haustechnik GmbH','Kontingentmodell',4000,NULL,2,1,'Offen','AN26-4633','2026-05-04','2026-07-03','2026-06-03',FALSE,FALSE,0,NOW(),NOW());

-- Intersport Kaltenbrunner/PRO-Sport Handelsgesellschaft m.b.H. (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-06','2026-06',3,42,'Intersport Kaltenbrunner/PRO-Sport Handelsgesellschaft m.b.H.','Kontingentmodell',0,NULL,2,1,'Offen','AN26-3433','2026-05-06','2026-07-05','2026-06-05',FALSE,FALSE,0,NOW(),NOW());

-- FMG | Fahrzeugbau – Maschinenbau GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-08','2026-06',3,39,'FMG | Fahrzeugbau – Maschinenbau GmbH','Kontingentmodell',5000,NULL,2,1,'Offen','AN26-3717','2026-05-08','2026-07-07','2026-06-07',FALSE,FALSE,0,NOW(),NOW());

-- Triptiser Edelstahl GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-02','2026-07',2,33,'Triptiser Edelstahl GmbH','Poolvertrag',4500,NULL,1,1,'Offen','MS-14296','2026-06-08','2026-07-08','2026-07-01',FALSE,FALSE,0,NOW(),NOW());

-- SCM Group Austria Zweigniederlassung Österreich (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-11','2026-06',3,41,'SCM Group Austria Zweigniederlassung Österreich','Einmalige Kampagne',3000,NULL,2,1,'Offen','AN25-4801','2026-05-11','2026-07-10','2026-06-10',FALSE,FALSE,0,NOW(),NOW());

-- PBS Deutschland GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-08','2026-07',1,4,'PBS Deutschland GmbH','Kontingentpaket',6000,NULL,2,0,'Offen','12339','2026-05-22','2026-07-21','2026-07-07',FALSE,FALSE,0,NOW(),NOW());

-- TWF International GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-13','2026-06',3,35,'TWF International GmbH','Kontingentmodell',4000,NULL,2,1,'Offen','AN25-3812','2026-05-13','2026-07-12','2026-06-12',FALSE,FALSE,0,NOW(),NOW());

-- Casa Con Property Management GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-26','2026-06',1,8,'Casa Con Property Management GmbH','Kontingentpaket',9000,NULL,2,1,'Offen','20260510-164928177','2026-05-10','2026-07-09','2026-06-25',FALSE,FALSE,0,NOW(),NOW());

-- VOGT NDT GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-30','2026-06',1,33,'VOGT NDT GmbH','Kontingentpaket',9000,NULL,2,1,'Offen','20260514-135225190','2026-05-14','2026-07-13','2026-06-29',FALSE,FALSE,0,NOW(),NOW());

-- Kühlanlagenbau Fritz Lachmayr GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-19','2026-06',3,43,'Kühlanlagenbau Fritz Lachmayr GmbH','RaaS',6000,NULL,2,1,'Offen','AN26-3935','2026-05-19','2026-07-18','2026-06-18',FALSE,FALSE,0,NOW(),NOW());

-- KSA Kastenmüller Systems Austria GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-19','2026-06',3,41,'KSA Kastenmüller Systems Austria GmbH','Kontingentmodell',5000,NULL,2,1,'Offen','AN26-3799','2026-05-19','2026-07-18','2026-06-18',FALSE,FALSE,0,NOW(),NOW());

-- Holzbaumeister Strebinger GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-14','2026-07',3,41,'Holzbaumeister Strebinger GmbH','RaaS',4600,NULL,1,1,'Offen','AN26-3946','2026-06-26','2026-07-27','2026-07-13',FALSE,FALSE,0,NOW(),NOW());

-- H.KLEINEBERG GmbH Metallhalbzeughandel (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-05','2026-07',2,8,'H.KLEINEBERG GmbH Metallhalbzeughandel','Kontingentvertrag',5800,NULL,2,0,'Offen','MS-14314','2026-05-19','2026-07-18','2026-07-04',FALSE,FALSE,0,NOW(),NOW());

-- Bauunternehmen Marco Friedrich GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-05','2026-07',1,8,'Bauunternehmen Marco Friedrich GmbH','Kontingentpaket',9000,NULL,2,0,'Offen','20260519-120405080','2026-05-19','2026-07-18','2026-07-04',FALSE,FALSE,0,NOW(),NOW());

-- Biedensand Bäder Lampertheim GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-05','2026-07',1,33,'Biedensand Bäder Lampertheim GmbH','Kontingentpaket',9000,NULL,2,0,'Offen','20260515-075956601','2026-05-19','2026-07-18','2026-07-04',FALSE,FALSE,0,NOW(),NOW());

-- Stumpe-Nevels Nachf. GmbH & Co. KG (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-14','2026-07',2,33,'Stumpe-Nevels Nachf. GmbH & Co. KG','Poolvertrag',5800,NULL,2,0,'Offen','MS-14332','2026-05-21','2026-07-20','2026-07-13',FALSE,FALSE,0,NOW(),NOW());

-- Troxler-Haus Wuppertal e. V. (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-21','2026-06',2,8,'Troxler-Haus Wuppertal e. V.','Poolvertrag',9000,NULL,2,1,'Offen','BK-12408','2026-05-21','2026-07-20','2026-06-20',FALSE,FALSE,0,NOW(),NOW());

-- Nordhoff Inh. Wilhelm Wierlemann e.К. (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-14','2026-07',2,33,'Nordhoff Inh. Wilhelm Wierlemann e.К.','Poolvertrag',5800,NULL,2,0,'Offen','MS-14325','2026-05-21','2026-07-20','2026-07-13',FALSE,FALSE,0,NOW(),NOW());

-- HEFA Hans Eggert Fahl GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-12','2026-07',1,4,'HEFA Hans Eggert Fahl GmbH','Kontingentpaket',4600,NULL,2,0,'Offen','11117','2026-05-26','2026-07-25','2026-07-11',FALSE,FALSE,0,NOW(),NOW());

-- Meile-technik GmbH Heizung-Klima-Sanitär (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-15','2026-07',1,33,'Meile-technik GmbH Heizung-Klima-Sanitär','Kontingentpaket',9000,NULL,2,0,'Offen','20260519-101216450','2026-05-29','2026-07-28','2026-07-14',FALSE,FALSE,0,NOW(),NOW());

-- Hamann GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-12','2026-07',1,33,'Hamann GmbH','Kontingentpaket',9000,NULL,2,0,'Offen','2605001','2026-05-26','2026-07-25','2026-07-11',FALSE,FALSE,0,NOW(),NOW());

-- ITA Tischlermontagen GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-28','2026-06',3,41,'ITA Tischlermontagen GmbH','Kontingentmodell',4000,NULL,2,1,'Offen','AN26-3070','2026-05-28','2026-07-27','2026-06-27',FALSE,FALSE,0,NOW(),NOW());

-- Farm-ING Smart Farm Equipment FlexCo (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-28','2026-06',3,41,'Farm-ING Smart Farm Equipment FlexCo','Kontingentmodell',5000,NULL,2,1,'Offen','AN26-3796','2026-05-28','2026-07-27','2026-06-27',FALSE,FALSE,0,NOW(),NOW());

-- Intensivpflegedienst exzellent care GmbH (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-28','2026-06',2,33,'Intensivpflegedienst exzellent care GmbH','Poolvertrag',5800,NULL,2,1,'Offen','2605068','2026-05-28','2026-07-27','2026-06-27',FALSE,FALSE,0,NOW(),NOW());

-- PRT Rohrtechnik Berlin-Brandenburg GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-01','2026-07',1,4,'PRT Rohrtechnik Berlin-Brandenburg GmbH','Kontingentpaket',4500,NULL,1,0,'Offen','TB-18127','2026-06-08','2026-07-07','2026-06-30',FALSE,FALSE,0,NOW(),NOW());

-- Holzbau Franz Kreiseder GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-01','2026-07',3,43,'Holzbau Franz Kreiseder GmbH','RaaS',6000,NULL,2,0,'Offen','AN26-4009','2026-06-01','2026-07-31','2026-06-30',FALSE,FALSE,0,NOW(),NOW());

-- Gebr. Schröder Kabel- und Leitungsbau GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-23','2026-07',1,33,'Gebr. Schröder Kabel- und Leitungsbau GmbH','Kontingentpaket',5800,NULL,1,1,'Offen','2605082','2026-06-29','2026-07-29','2026-07-22',FALSE,FALSE,0,NOW(),NOW());

-- Gemeinschaftspraxis Dr. med. Hans-Werner Müller-Dethard und Amir Shobeiry (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-26','2026-06',2,33,'Gemeinschaftspraxis Dr. med. Hans-Werner Müller-Dethard und Amir Shobeiry','Poolvertrag',4500,NULL,1,1,'Offen','MS-14304','2026-06-03','2026-07-02','2026-06-25',FALSE,FALSE,0,NOW(),NOW());

-- Tiroler Hospiz Betriebsgesellschaft m.b.H. (2026-06)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-06-27','2026-06',3,39,'Tiroler Hospiz Betriebsgesellschaft m.b.H.','Kontingentmodell',3000,NULL,1,1,'Offen','AB26-2058','2026-06-11','2026-07-10','2026-06-26',FALSE,FALSE,0,NOW(),NOW());

-- Helmut Hinz GmbH & Co. (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-12','2026-07',1,4,'Helmut Hinz GmbH & Co.','Kontingentpaket',500,NULL,1,1,'Offen','RN 10440','2026-06-25','2026-07-25','2026-07-11',FALSE,FALSE,0,NOW(),NOW());

-- ZYNP Europe GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-10','2026-07',1,33,'ZYNP Europe GmbH','Kontingentpaket',4500,NULL,1,0,'Offen','2606104','2026-06-17','2026-07-16','2026-07-09',FALSE,FALSE,0,NOW(),NOW());

-- Seniorenstift Ingelfingen GmbH (2026-07)
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,wie_vielt_verlaengerung,status,vertragsnummer,vertragsbeginn,ende_laufzeit,ende_kuendigungsfrist,upsale_angesprochen,upsale_angenommen,terminiert,created_at,updated_at) VALUES ('2026-07-15','2026-07',2,8,'Seniorenstift Ingelfingen GmbH','Kontingentvertrag',5800,NULL,1,0,'Offen','MS-14380','2026-06-22','2026-07-21','2026-07-14',FALSE,FALSE,0,NOW(),NOW());
