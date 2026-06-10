-- Migration 012: Re-import deals from Excel source-of-truth (10.06.2026)
-- Replaces all 2026 deal data with verified Google Sheet data
-- NOTE: deals_bk and deals_vl use kam_id (not closer_id)

DELETE FROM deals_nk WHERE monat LIKE '2026-%'
;
DELETE FROM deals_bk WHERE monat LIKE '2026-%'
;
DELETE FROM deals_vl WHERE monat LIKE '2026-%'
;
DELETE FROM ae_gesamt_monthly WHERE monat LIKE '2026-%'
;

INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-14','2026-01',1,9,'Cold Calling','H2O Versorgungstechnik GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-14','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-15','2026-01',1,9,'Cold Calling','MOB Märkische Oberflächenanlagen & Behälterbau GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-15','2026-01',1,9,'Cold Calling','Altek GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-15','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-16','2026-01',1,9,'Cold Calling','Hochdanner Sanitär- und Heizungs-GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-16','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-16','2026-01',1,12,'Mail','Ka-Ro electronics Fertigungs-GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-19','2026-01',1,12,'Cold Calling','PB Gelatins GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-19','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,9,'Cold Calling','BG Gastro Holding GmbH',NULL,'No-Brainer Recruiting',4600.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,12,'Cold Calling','FUCHS Bau Ost GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,12,'Cold Calling','Dr. med. Alexandra Borgmann Fachärztin für Innere Medizin Fachärztin für Innere Medizin',NULL,'No-Brainer Recruiting',5000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,9,'Cold Calling','BSU Projekt Service GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-20','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-21','2026-01',1,9,'Cold Calling','MDH AG Mamisch Dental Health',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-21','2026-01',1,9,'Cold Calling','Diehl GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-21','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-23','2026-01',1,9,'Ad','PBG Handwerker GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-26','2026-01',1,9,'Cold Calling','Digatron Power Electronics GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-26','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-26','2026-01',1,9,'Cold Calling','Grün-System-Bau GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-26','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-26','2026-01',1,12,'Mail','Bauunternehmung Tholen GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-28','2026-01',1,9,'Cold Calling','WERIT-Kunststoffwerke W. Schneider GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-28','2026-01',1,9,'Cold Calling','Dr. Ecklebe GmbH',NULL,'No-Brainer Recruiting',15000.0,2,'Gewonnen',15000.0,'2026-01-28','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-29','2026-01',1,9,'Ad','Polland Gartengestaltung GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-30','2026-01',1,12,'Cold Calling','Werner''s Metzgerei GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-30','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-30','2026-01',1,9,'Ad','NEUHAUSER GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-30','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-30','2026-01',1,9,'Cold Calling','H+E Haustechnik und Elektro GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-01-30','2026-01')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-02','2026-02',1,9,'Cold Calling','VPT Kompressoren GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-02','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-02','2026-02',1,9,'Mail','HLW GmbH Tank- und Fahrzeugbau',NULL,'No-Brainer Recruiting',11500.0,2,'Gewonnen',11500.0,'2026-02-02','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-03','2026-02',1,9,'Mail','Bäckerei & Konditorei Diefenbach GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-03','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-03','2026-02',1,9,'Mail','HolyPoly GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-03','2026-02',1,9,'Ad','Andreas Seise Gebäudetechnik GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-04','2026-02',1,9,'Cold Calling','Petry AG',NULL,'No-Brainer Recruiting',6900.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-04','2026-02',1,9,'Mail','AmbiPark GmbH',NULL,'No-Brainer Recruiting',4600.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,12,'Mail','AMS Brendel GmbH Steuerberatungsgesellschaft',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-05','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,9,'Mail','Habicht + Sporer GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-05','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,9,'Cold Calling','MR Landkreis Ansbach GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-05','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,9,'Cold Calling','MATTHIAS TRÖPGEN Bauunternehmung GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-06','2026-02',1,9,'Mail','Henn GmbH Bauunternehmung',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-06','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-09','2026-02',1,9,'Cold Calling','Ballmeyer Kälte u. Klima GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-09','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-10','2026-02',1,9,'Mail','Laudon GmbH & Co. KG',NULL,'No-Brainer Recruiting',6000.0,2,'Gewonnen',6000.0,'2026-02-10','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-10','2026-02',1,9,'Ad','Karl Bachl Hoch – und Tiefbau GmbH & Co. KG',NULL,'No-Brainer Recruiting',11500.0,2,'Gewonnen',11500.0,'2026-02-10','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-10','2026-02',1,12,'Ad','Vaventus AG Kälte Klima Lüftung',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-10','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-10','2026-02',1,12,'Cold Calling','Märkl Bau GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-10','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-11','2026-02',1,9,'Cold Calling','Diehn Heizungstechnik GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-11','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-11','2026-02',1,9,'Cold Calling','B+S Soziale Dienste FHH GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-11','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-11','2026-02',1,12,'Mail','Christian Merle Zahnarztpraxis',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-12','2026-02',1,9,'Mail','Klaistower Hofbäckerei GmbH',NULL,'No-Brainer Recruiting',5000.0,2,'Gewonnen',5000.0,'2026-02-12','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-12','2026-02',1,9,'Cold Calling','Auto Amthauer GmbH Hanau',NULL,'No-Brainer Recruiting',5000.0,2,'Gewonnen',5000.0,'2026-02-12','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-12','2026-02',1,12,'Mail','Wartig Nord GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-12','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-12','2026-02',1,9,'Cold Calling','Zöller-Bau GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-16','2026-02',1,9,'Cold Calling','Energieversorgung Main-Spessart GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-16','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-16','2026-02',1,9,'Cold Calling','IDS Systemumschlag GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-17','2026-02',1,9,'Cold Calling','Daume',NULL,'No-Brainer Recruiting',5000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-18','2026-02',1,9,'Mail','Gartencenter Heinrich Ramme GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-18','2026-02',1,12,'Mail','topline Bürosysteme Förtsch und Gimpl GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-18','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-18','2026-02',1,9,'Mail','GSD Gesellschaft für Sparkassendienstleistungen mbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-19','2026-02',1,9,'Mail','Autohaus Wolfrum GmbH Naila',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-19','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-19','2026-02',1,9,'Mail','BEN Buchele Elektromotorenwerke GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-20','2026-02',1,9,'Mail','Andries GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-20','2026-02',1,9,'Cold Calling','Alterauge GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-20','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-20','2026-02',1,12,'Cold Calling','Bardowicks.Haus und Holzbau GmbH',NULL,'No-Brainer Recruiting',6000.0,2,'Gewonnen',6000.0,'2026-02-20','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-20','2026-02',1,9,'Mail','Autohaus Hammdorf Wolfenbüttel',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-23','2026-02',1,9,'Mail','HOWE Umwelttechnik GmbH',NULL,'No-Brainer Recruiting',10800.0,2,'Gewonnen',10800.0,'2026-02-23','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-23','2026-02',1,9,'Cold Calling','Bruno Brenner, Garten- und Landschaftsbau GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-23','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-25','2026-02',1,9,'Ad','dekarbo GmbH',NULL,'No-Brainer Recruiting',5000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,9,'Mail','PS Union GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-26','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,12,'Mail','Nord-Spedetion GmbH & Co.KG',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,9,'Mail','Jesko Gärtner Zahnarzt',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,12,'Mail','ZAB Zentrale Akademie für Berufe im Gesundheitswesen GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-26','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,9,'Mail','Autohaus Peter Ebner',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-27','2026-02',1,12,'Ad','EMG Energie-Management GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-02-27','2026-02')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-02','2026-03',1,9,'Mail','Schnurr GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-02','2026-03',1,12,'Mail','Trans-Service GmbH Schwarzenberg',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-02','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-02','2026-03',1,12,'Mail','Dr. Boris Henkel und Dr. Jeanette Henkel-Gutjahr Zahnarztpraxis',NULL,'No-Brainer Recruiting',5000.0,2,'Gewonnen',5000.0,'2026-03-02','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-03','2026-03',1,9,'Mail','Groschopp AG Drives & More',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-03','2026-03',1,12,'Cold Calling','M. Kratzer Sanitär Heizung Spenglerei GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-03','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-03','2026-03',1,12,'Mail','Kur- und Sporthotel Appartementhaus GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-04','2026-03',1,9,'Mail','Autohaus Olenik GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-04','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-04','2026-03',1,12,'Ad','Jens Gottschalk GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-04','2026-03',1,9,'Mail','Autohaus Olenik GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-04','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-04','2026-03',1,12,'Cold Calling','Gebr. Schnur GmbH',NULL,'No-Brainer Recruiting',4600.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,12,'Mail','ProDEKon Blechtechnik GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,12,'Cold Calling','mosy GmbH',NULL,'No-Brainer Recruiting',6000.0,2,'Gewonnen',6000.0,'2026-03-05','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,12,'Mail','Apotheker Walter Bouhon GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,9,'Mail','Proff Sanitärinstallation GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-05','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,12,'Cold Calling','IGW Ingenieure GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-06','2026-03',1,9,'Cold Calling','GEMTEC AG',NULL,'No-Brainer Recruiting',10900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-06','2026-03',1,9,'Cold Calling','Fensterbau Rutsch GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-06','2026-03',1,9,'Mail','Ehrenfels Heizung & Bad GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-06','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-09','2026-03',1,12,'Mail','Industriebau Haldensleben GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-09','2026-03',1,9,'Cold Calling','ASCANETZ GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-09','2026-03',1,12,'Cold Calling','FLACHGLAS Sachsen GmbH',NULL,'No-Brainer Recruiting',5000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-09','2026-03',1,9,'Empfehlung','Veit Höver GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-09','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-09','2026-03',1,9,'Cold Calling','AWOcura gGmbH',NULL,'Individuell',13500.0,2,'Gewonnen',13500.0,'2026-03-09','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-10','2026-03',1,9,'Cold Calling','StaMaTec R. Puder Stahl und Maschinenbautechnik GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-11','2026-03',1,9,'Mail','Autohaus Wiese OHG',NULL,'No-Brainer Recruiting',6900.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-11','2026-03',1,12,'Mail','Dr. med. Sybille Hettinger Fachärztin für Augenheilkunde',NULL,'No-Brainer Recruiting',3000.0,2,'Gewonnen',3000.0,'2026-03-11','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-11','2026-03',1,12,'Cold Calling','Fahrzeugbau Jahn GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-12','2026-03',1,12,'Cold Calling','SWAP (Sachsen) GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-12','2026-03',1,12,'Mail','phaeno - gemeinnützige GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-13','2026-03',1,12,'Mail','TTL Tapeten-Teppichbodenland Nord Handelsgesellschaft mbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-13','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-13','2026-03',1,9,'Mail','Dr. med. Jens-Joachim Brücher Dermatologische Praxis',NULL,'Kontingente',12000.0,4,'Gewonnen',12000.0,'2026-03-13','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-17','2026-03',1,12,'Cold Calling','Meyer-Tochtrop Bauunternehmen GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-17','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-18','2026-03',1,9,'Mail','Innotherm Heizsysteme GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-18','2026-03',1,12,'Mail','Laboratoire Biosthetique Kosmetik GmbH & Co. KG',NULL,'No-Brainer Recruiting',12000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-20','2026-03',1,9,'Mail','Industrie- und Tankanlagen Führer&Weingartner GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-20','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-20','2026-03',1,12,'Mail','Kieser Training GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-20','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-23','2026-03',1,12,'Mail','Kring & Huppertz GmbH Garten und Landschaftsbau',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-23','2026-03',1,9,'Empfehlung','Allianz Versicherungshaus Hiller',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-23','2026-03',1,9,'Cold Calling','Procuritas Seniorenzentrum Reinigungs GmbH',NULL,'Individuell',13500.0,2,'Gewonnen',13500.0,'2026-03-23','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-17','2026-03',1,9,'Cold Calling','Stiftung Pro Gemeinsinn gGmbH',NULL,'Individuell',13500.0,2,'Gewonnen',13500.0,'2026-03-17','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-24','2026-03',1,12,'Mail','BBS Brand- und Wasserschadensanierung Gebrüder Berndt GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-24','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-25','2026-03',1,9,'Cold Calling','Dr. Ulrich-Lange-Stiftung GmbH',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-03-25','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-25','2026-03',1,12,'Cold Calling','Baukonzept Neubrandenburg GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-25','2026-03',1,12,'Cold Calling','Stadtbäckerei Kühl GmbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-26','2026-03',1,9,'Cold Calling','Ramgraber GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-26','2026-03',1,12,'Mail','Hermann Otto GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-26','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-26','2026-03',1,12,'Cold Calling','C. Schrade GmbH',NULL,'No-Brainer Recruiting',6000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-26','2026-03',1,9,'Cold Calling','Oberberg GmbH',NULL,'Individuell',13500.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-27','2026-03',1,9,'Mail','Kaiser-Karl-Klinik GmbH',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-27','2026-03',1,12,'Cold Calling','WiWa Wilko Wagner GmbH',NULL,'Individuell',12000.0,4,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-27','2026-03',1,12,'Cold Calling','Kälte Klima Grässlin GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-03-27','2026-03')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-01','2026-04',1,11,'Cold Calling','Dorow Heizung Lüftung Sanitär GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-04-01','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-01','2026-04',1,12,'Cold Calling','Evangelisches Johannesstift Wichernkrankenhaus gGmbH',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-01','2026-04',1,12,'Empfehlung','Eloquendo GmbH',NULL,'Individuell',12000.0,4,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-02','2026-04',1,12,'Mail','INTEC Engineering GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-02','2026-04',1,9,'Cold Calling','St. Elisabeth Wohn- und Pflegeheim',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-02','2026-04',1,12,'Follow Up','Ev. Altenheim St. Jacobistift',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-02','2026-04',1,9,'Follow Up','Wismarer Werkstätten GmbH',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-02','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-07','2026-04',1,9,'Follow Up','Neu­ro­lo­gi­sche Kli­nik Sel­zer GmbH',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-07','2026-04',1,9,'Mail','Sonnhalden | Genossenschaft Regionales Pflegeheim',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-07','2026-04',1,12,'Mail','Golfclub Nippenburg GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-07','2026-04',1,12,'Cold Calling','Malergeschäft Näther GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-04-07','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,12,'Cold Calling','I.D.V. Isolier- und Dämmstoff-Vertriebs-GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-04-08','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,12,'Cold Calling','Energietechnik Bremen GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,9,'Mail','Seniorensitz am Deister GmbH',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,12,'Cold Calling','DOG Deutsche Oelfabrik Gesellschaft für chemische Erzeugnisse mbH & Co. KG',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-04-09','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,12,'Mail','Autohaus Hunold GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,12,'Mail','Karl Kühnlein GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,12,'Mail','Autohaus Louis Dresen GmbH',NULL,'Individuell',8000.0,2,'Gewonnen',8000.0,'2026-04-09','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,9,'Follow Up','Kolping Bildung Deutschland gGmbH',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,9,'Follow Up','Diakonie im Landkreis Karlsruhe gemeinnützige GmbH',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,9,'Follow Up','Spitex Region Frauenfeld',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-04-09','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-10','2026-04',1,12,'Cold Calling','DRK-Kreisverband Merseburg-Querfurt e.V.',NULL,'Individuell',9000.0,2,'Gewonnen',9000.0,'2026-04-10','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-10','2026-04',1,12,'Follow Up','Behandlungszentrum Aschau GmbH',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-10','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-13','2026-04',1,9,'Follow Up','Walther Dachziegel GmbH',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-13','2026-04',1,12,'Mail','Uni Klinik Mainz',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-13','2026-04',1,9,'Empfehlung','Mörk GmbH & Co. KG',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,9,'Follow Up','Klinikum Peine AöR',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,12,'Cold Calling','Arbeiterwohlfahrt Ortsverein Viernheim e. V.',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,9,'Mail','Lebenshilfe Fürth e.V.',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-14','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,12,'Mail','Grundbaulabor Bremen, Ingenieurgesellschaft für Geotechnik mbH',NULL,'No-Brainer Recruiting',8000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,12,'Cold Calling','SIMAKA Energie- und Umwelttechnik GmbH',NULL,'No-Brainer Recruiting',6900.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,9,'Mail','Radiologie München eGbR',NULL,'SM + MD',14000.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-15','2026-04',1,9,'Cold Calling','Seniorenzentrum Hirschkamp',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-15','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-15','2026-04',1,12,'Empfehlung','Reifen Fricke GmbH',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-16','2026-04',1,9,'Mail','Lebenshilfe Bruchsal',NULL,'Individuell',27000.0,6,'Gewonnen',27000.0,'2026-04-16','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-16','2026-04',1,12,'Empfehlung','HELIOS Klinik Rottweil',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-16','2026-04',1,12,'Follow Up','Arbeiter-Samariter-Bund Regionalverband Saalekreis Süd e. V.',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-16','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-17','2026-04',1,9,'Cold Calling','Ev. Pflegeheim Lutherstift gGmbH',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-17','2026-04',1,9,'Follow Up','Arbeiter-Samariter-Bund Baden-Württemberg e.V.',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-17','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-17','2026-04',1,9,'Mail','Sankt Vincentius Krankenhaus',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-17','2026-04',1,9,'Follow Up','Lebenshilfe Bonn',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-17','2026-04',1,9,'Follow Up','Diakoneo Krannkenhaus Rangau',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-17','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-20','2026-04',1,12,'Mail','Rheinwohnungsbau Dienstleistungen GmbH',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-20','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,9,'Mail','Heizungs- und Sanitärtechnik Klante Klante GmbH',NULL,'Individuell',12000.0,3,'Gewonnen',12000.0,'2026-04-21','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,9,'Empfehlung','Schlosserei Schliebach GmbH',NULL,'No-Brainer Recruiting',8000.0,2,'Gewonnen',8000.0,'2026-04-21','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,12,'Mail','Klinikum Stuttgart',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,12,'Follow Up','Caritas Trägergesellschaft Saarbrücken mbH cts',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-22','2026-04',1,9,'Cold Calling','Wolfsteiner Altenheim-Stiftung gemeinnützige Betriebsgesellschaft mbH',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-01','2026-04',1,12,'Cold Calling','Behandlungszentrum Aschau GmbH',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-04-01','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-22','2026-04',1,9,'Cold Calling','Lebenshilfe Kreisvereinigung Saarlouis e.V.',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,9,'Follow Up','Elan-Fitness GmbH',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,9,'Cold Calling','Wohnpark St.Elisabeth',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-23','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,12,'Empfehlung','Krügle & Höhl GmbHSteinmetz- und Bildhauermeisterbetrieb',NULL,'No-Brainer Recruiting',6900.0,2,'Gewonnen',6900.0,'2026-04-23','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,12,'Ad','PSORISOL Hautklinik GmbH',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-24','2026-04',1,12,'Cold Calling','Klinikum Fichtelgebirge gGmbH',NULL,'Kontingente',17600.0,4,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-24','2026-04',1,9,'Ad','Senioren-Pflegeheim...aus gutem Grund GmbH',NULL,'Individuell',9000.0,2,'Gewonnen',9000.0,'2026-04-24','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,9,'Ad','Pflegeteam 4You GmbH',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,9,'Mail','PflegeMobil Erlangen GmbH',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,12,'Cold Calling','radprax Krankenhaus Plettenberg GmbH',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-27','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,12,'Mail','St. Josefskrankenhaus Heidelberg GmbH & Co. KG',NULL,'Individuell',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,9,'Mail','Krone gebäudemanagement und technologie gmbh',NULL,'Individuell',13500.0,3,'Gewonnen',13500.0,'2026-04-27','2026-04')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,9,'Mail','Sozialstation Wendlingen am Neckar e.V.',NULL,'Individuell',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,12,'Mail','KIRSCHNER HOLDING GmbH',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-04','2026-05',1,12,'Cold Calling','Casa Con Property Management GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-04','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,9,'Cold Calling','Kampfmittelbergung Zimmermann GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,9,'Cold Calling','Vogg Haustechnik GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,9,'Cold Calling','Planung Hiller GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-06','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,12,'Cold Calling','Weilke Logistik GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-06','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,9,'Cold Calling','Hermanns & Kreutz GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,9,'Cold Calling','Ernst Hinze GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-06','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,9,'Cold Calling','Metal Check GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,9,'Cold Calling','Liveco Veranstaltungstechnik GmbH',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-08','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,9,'Cold Calling','Speedmaster GmbH',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-08','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,9,'Cold Calling','FASTER GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,12,'Cold Calling','Lausitzer Stahlbau Ruhland GmbH',NULL,'No-Brainer Recruiting',8000.0,2,'Gewonnen',8000.0,'2026-05-11','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,9,'Cold Calling','T+S Helmrath Logistik GmbH',NULL,'Kontingente',10500.0,3,'Gewonnen',10500.0,'2026-05-12','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,12,'Cold Calling','Spinnler Werkzeugbau GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,12,'Cold Calling','Kaupp + Diether GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,9,'Cold Calling','ESTA-Bildungswerk gemeinnützige GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,12,'Cold Calling','Heizung und Wasser Adolf und Eberhard Baur GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-13','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,12,'Cold Calling','Kirschenhofer Maschinen GmbH',NULL,'Kontingente',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,11,'Cold Calling','Tüns Werbetechnik GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,12,'Cold Calling','VOGT NDT GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-13','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-15','2026-05',1,12,'Cold Calling','Aufzugtechnik Süd GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,9,'Cold Calling','Antonics GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,9,'Cold Calling','Simon Glas GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,12,'Cold Calling','BFT Immobilien GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,12,'Cold Calling','GPI Aachen GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-18','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,12,'Cold Calling','Biedensand Bäder Lampertheim GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-18','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,12,'Cold Calling','SRG Schaltanlagen GmbH & Co. KG',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,9,'Cold Calling','SPS Klimatechnische Verkaufsu. Beratungs GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-18','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,12,'Cold Calling','Bauunternehmen Marco Friedrich GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-19','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,12,'Cold Calling','Meile-technik GmbH Heizung-Klima-Sanitär',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-20','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,9,'Cold Calling','Sunshine Wintergarten GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,9,'Cold Calling','PRT Rohrtechnik Berlin-Brandenburg GmbH',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-20','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,9,'Cold Calling','Ingenieurbüro Mayer AG',NULL,'Kontingente',27000.0,6,'Gewonnen',27000.0,'2026-05-21','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,9,'Cold Calling','HERBERT Tire Tooling GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,9,'Cold Calling','ZYNP Europe GmbH',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-21','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,9,'Cold Calling','Gipser Schmid GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,9,'Cold Calling','ImmoProjekt Wohn- und Gewerbeobjekte GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,12,'Cold Calling','Hamann GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-21','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,12,'Cold Calling','Tank - Technik - Handel Meiwes GmbH',NULL,'Kontingente',9000.0,4,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-27','2026-05',1,9,'Cold Calling','TE-LOH Germany GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-27','2026-05',1,9,'Cold Calling','bash-tec GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,12,'Cold Calling','SBB Cargo International AG',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,9,'Cold Calling','hw Wenisch Haustechnik GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,9,'Cold Calling','ITALMOTO Vertriebsgesellschaft mbH',NULL,'Kontingente',5800.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,9,'Cold Calling','Gebr. Schröder Kabel- und Leitungsbau GmbH',NULL,'Kontingente',5800.0,1,'Gewonnen',5800.0,'2026-05-29','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,12,'Cold Calling','IWS GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-29','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-04','2026-05',1,9,'Cold Calling','Behindertenhilfe Norden gemeinnützige GmbH',NULL,'Individuell',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-04','2026-05',1,25,'Follow Up','Reha-Klinik Hausbaden',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-04','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-04','2026-05',1,25,'Cold Calling','Senevita AG Bern',NULL,'Kontingente',27000.0,6,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-04','2026-05',1,25,'Empfehlung','Hamburger Hospiz am Deich gGmbH',NULL,'Kontingente',4500.0,1,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,25,'Follow Up','Diakonisches Werk an der Saar gGmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,25,'Follow Up','AllDent Holding GmbH',NULL,'Kontingente',16500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,25,'Mail','Alten- und Pflegeheim St. Michael Kongregation der Barmherzigen Schwestern vom hl. Vinzenz von Paul Deal',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,25,'Follow Up','Gesellschaft für diakonische Altenhilfe Gießen und Linden gGmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-06','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,25,'Cold Calling','Spitex Region Kreuzlingen',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,25,'Mail','Altenheim & Pflegeheim Stoltenhof',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-06','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,25,'Follow Up','DRK-Kreisverband Halle-Saalkreis-Mansfelder Land e.V.',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-06','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,25,'Empfehlung','rehaklinik-montafon',NULL,'Kontingente',18000.0,4,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,25,'Follow Up','ASB-Ortsverband Brandenburg an der Havel e.V.',NULL,'Kontingente',4500.0,1,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,25,'Cold Calling','Stiftung Alters- und Pflegeheim Weggis',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-07','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,27,'Mail','Paul Wältring Vieh- und Fleischhandels GmbH',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-07','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,27,'Mail','CABINET Schranksysteme AG',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-07','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,25,'Mail','Diakonie Kliniken Hunsrück gGmbH',NULL,'Kontingente',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,25,'Mail','Christliche Bürgerhilfe Sozialstation gGmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-08','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,25,'Cold Calling','Seniorenhaus Berghof GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-11','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,25,'Cold Calling','BS Ambulanter Pflegedienst UG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,25,'Cold Calling','Diabetes-Klinik Bad Mergentheim GmbH & Co. KG',NULL,'Kontingente',27000.0,3,'Gewonnen',27000.0,'2026-05-11','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,25,'Mail','Tabea Diakonie - Pflege Heiligenstadt gGmbH',NULL,'Kontingente',6000.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,25,'Cold Calling','Schweizer Paraplegiker-Zentrum',NULL,'Kontingente',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,27,'Cold Calling','E+S Sozialkonzepte gGmbH',NULL,'Kontingente',4500.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,25,'Cold Calling','Wohn- und Pflegeheim Sonnmatt AG',NULL,'Kontingente',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,25,'Cold Calling','Spitalzweisimmen',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-12','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,25,'Follow Up','Deutsche Steinzeug Cremer & Breuer AG Deal',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-12','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,25,'Mail','AlexA Seniorendienste GmbH',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-13','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,25,'Cold Calling','Clinica Holistica Engiadina SA',NULL,'Kontingente',26000.0,4,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,25,'Mail','Diakonie-Sozialstation Visselhövede-Bothel gemeinnützige GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,25,'Mail','Ameos Klinikum Osnabrück',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-18','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,25,'Follow Up','Stiftung Haus Tabea',NULL,'Kontingente',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,25,'Follow Up','Krankenhaus Angermünde',NULL,'Kontingente',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,27,'Cold Calling','Neue Burg GmbH',NULL,'Kontingente',5800.0,1,'Gewonnen',5800.0,'2026-05-19','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,25,'Follow Up','T r o x l e r-H a u s W u p p e r t a l e. V. Einrichtungen für Seelenpflegebedürftige',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-20','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,25,'Follow Up','Fachklinik und Seniorenresidenz Main-Taunus gGmbH Varisano',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-20','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,25,'Cold Calling','Spitex Davos',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,25,'Follow Up','AA Alternative Altenhilfe GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,25,'Mail','Helios Klinik Müllheim',NULL,'Kontingente',27000.0,6,'Gewonnen',27000.0,'2026-05-21','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,25,'Mail','Neurologisches Rehabilitationszentrum Quellenhof in Bad Wildbad GmbH',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-21','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,25,'Follow Up','VAMED Rehazentrum Karlsruhe',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-21','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,25,'Mail','Heizungstechnik Service GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-21','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,25,'Mail','Alternativ Wohnen im Alter GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-22','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,24,'Mail','Triptiser Edelstahl GmbH',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-07','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-09','2026-05',1,24,'Mail','Chez Mandarin GmbH',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-09','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,24,'Mail','CABINET Schranksysteme AG',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-08','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,24,'Mail','Heiner Dresrüsse Metallbau GmbH',NULL,'Kontingente',4500.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,24,'Mail','H. KLEINEBERG GmbH',NULL,'Kontingente',5800.0,NULL,'Gewonnen',5800.0,'2026-05-12','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,24,'Mail','Mein Ofenstudio GmbH',NULL,'Kontingente',4500.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,24,'Mail','James Marquardt & Co. GmbH',NULL,'Kontingente',5800.0,NULL,'Gewonnen',5800.0,'2026-05-19','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,24,'Mail','Gemeinschaftspraxis Dr. med. Hans-Werner Müller-Dethard und Amir Shobeiry',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-08','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,24,'Mail','Rauser Tief- und Straßenbau GmbH',NULL,'Kontingente',4500.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,24,'Mail','Physiotherapie und medizinische Fitness GmbH',NULL,'Kontingente',5800.0,NULL,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,24,'Mail','ANNABURGER Nutzfahrzeug GmbH',NULL,'Kontingente',4500.0,1,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,24,'Mail','Neltner Großküchen GmbH',NULL,'Kontingente',5800.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,24,'Mail','Donau-Ries Haustechnik GmbH',NULL,'Kontingente',5800.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,24,'Mail','Peter Rieper GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,24,'Mail','DS Heizung und Sanitär GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-20','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,24,'Mail','Stumpe-Nevels Nachf. GmbH & Co.',NULL,'Kontingente',5800.0,NULL,'Gewonnen',5800.0,'2026-05-21','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,24,'Mail','Christian Reh GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,24,'Mail','Holger Bartels GmbH',NULL,'Kontingente',5800.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,24,'Mail','W+M Flachdachbau GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,24,'Mail','UNI-SERVICE GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,24,'Mail','Lücking & Härtel GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,25,'Mail','Verein für Innere Mission in Bremen e. V.',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-26','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,25,'Mail','Jesse GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,25,'Empfehlung','Deutsches Rotes Kreuz Landesverband Schleswig-Holstein e. V.',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,24,'Mail','Baustoff und Gewässer- sanierungs GmbH Dessau',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,25,'Follow Up','Klinikum Lippe GmbH',NULL,'Kontingente',18000.0,4,'Gewonnen',18000.0,'2026-05-26','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,27,'Cold Calling','Alexander-von-Humboldt-Klinik GRZ Geriatrisches Rehabilitationszentrum Betriebsgesellschaft mbH',NULL,'Kontingente',5800.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-27','2026-05',1,25,'Mail','Intensivpflegedienst exzellent care GmbH',NULL,'Kontingente',5800.0,1,'Gewonnen',5800.0,'2026-05-27','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-27','2026-05',1,24,'Mail','Hörland GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-27','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,25,'Mail','Physiowalk',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-28','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,27,'Mail','Pflegeheim Wohnpark Zippendorf GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,25,'Cold Calling','Cereneo Klinik',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,25,'Cold Calling','ASB Ortsverband Neustadt/Sachsen e.V.',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-28','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,24,'Mail','Der Pflegeluchs GmbH',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-29','2026-05')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,9,'Mail','Kulina Zerspanungstechnik und Maschinenbau GmbH',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-06-01','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,12,'Cold Calling','Jens Gottschalk GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,12,'Cold Calling','Schrage GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,12,'Cold Calling','Meusel & Beck GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,12,'Cold Calling','Artemis Service GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,12,'Cold Calling','S&P Steuerberatungsgesellschaft GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-06-02','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,9,'Cold Calling','Ohland Straßen- und Tiefbau GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-06-05','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,12,'Cold Calling','Ruhrmann GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,12,'Cold Calling','SWW Stahlbau Westerwald GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-06-08','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,9,'Cold Calling','CLIMATECH Service GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,12,'Cold Calling','J. Knittel Söhne Verwaltungsgesellschaft mbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-10','2026-06',1,9,'Cold Calling','Claus Hansen Malereibetrieb GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-10','2026-06',1,12,'Cold Calling','Haar Mecklenburg GmbH & Co. KG',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,27,'Empfehlung','Biedermann Orthopaedietechnik GmbH',NULL,'Kontingente',5800.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,27,'Cold Calling','Vitalis - Häusliche Krankenpflege',NULL,'Kontingente',4500.0,NULL,'Gewonnen',4500.0,'2026-06-01','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,24,'Mail','Ingenieurbüro EUKON',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-06-01','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,24,'Mail','Karosserie- & Lackierzentrum Büchel GmbH & Co.KG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,25,'Mail','CBS Caritas Betriebsträgergesellschaft mbH Speyer',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,25,'Cold Calling','GZO AG Spital Wetzikon',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,27,'Mail','Kost Wärmetechnik GmbH',NULL,'Kontingente',5800.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,27,'Mail','Edling + Hammerschmidt Gebäudetechnik GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,25,'Cold Calling','Arbeiterwohlfahrt Kreisverband Essen e.V.',NULL,'Kontingente',27000.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,27,'Cold Calling','August Karthaus GmbH & Co. KG',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,25,'Follow Up','Sparkasse Barnim Deal',NULL,'Kontingente',17500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,27,'Cold Calling','Haus Abendfrieden',NULL,'Kontingente',5800.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,27,'Mail','Stöhr Bakery GmbH',NULL,'Kontingente',5800.0,NULL,'Gewonnen',5800.0,'2026-06-03','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-04','2026-06',1,25,'Cold Calling','Spitäler Frutigen Meiringen Interlaken AG',NULL,'Kontingente',18000.0,4,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-04','2026-06',1,25,'Follow Up','Kreuzgewölbe GmbH Demenzkompetenzzentrum Sachsen',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-04','2026-06',1,25,'Follow Up','Klinik Helle Mitte',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-04','2026-06',1,25,'Follow Up','AlexA Seniorendienste GmbH Pirna',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-06-04','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-04','2026-06',1,25,'Empfehlung','Deutsches Rotes Kreuz Betreuungsdienste Lübeck gGmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-04','2026-06',1,25,'Cold Calling','Klinik Schöneberg GmbH',NULL,'Kontingente',18000.0,4,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-04','2026-06',1,25,'Follow Up','Geraer Heimbetriebsgesellschaft mbH',NULL,'Kontingente',18000.0,4,'Gewonnen',18000.0,'2026-06-04','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,27,'Mail','Physiotherapie am Rheinpark GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,25,'Follow Up','Deutsches Rotes Kreuz Kreisverband Grafschaft Bentheim e. V.',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,25,'Follow Up','Bonifatius Seniorendienste GmbH',NULL,'kontingente',9000.0,2,'Gewonnen',9000.0,'2026-06-05','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,24,'Mail','Gartenwelt Meißner',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,25,'Follow Up','Diakonische Altenhilfe Siegerland gGmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,25,'Follow Up','PflegeService Wirtz GmbH',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,27,'Mail','activamed Pflegedienst GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,24,'Mail','Manfred Kries GmbH',NULL,'Kontingente',5800.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,25,'Follow Up','Diakonische Gesellschaft Wohnen und Beraten mbH DWB',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,25,'Mail','BÜHR Anlagenbau & Service GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,25,'Mail','Rotor Control GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,25,'Mail','Hoffbauer-Stiftung Potsdam',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,24,'Cold Calling','Senevita Sunnwies',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,24,'Mail','ZABAG AG',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,25,'Follow Up','Seniorenheim am Pfaffenberg GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,25,'Mail','IKB Pflegeteam GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,25,'Mail','Klinik SGM Langenthal',NULL,'Kontingente',27000.0,4,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,24,'Mail','Lutz Technologie GmbH Stefan Lutz',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-06-09','2026-06')
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,27,'Mail','Erich Neter GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-10','2026-06',1,25,'Cold Calling','Reha- und Kurklinik Eden',NULL,'Kontingente',18000.0,4,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-10','2026-06',1,24,'Mail','WWI Cottbus GmbH',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_nk (datum,monat,company_id,closer_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-10','2026-06',1,25,'Mail','Sport- und Rehacentrum Magdeburg',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-07','2026-01',1,3,'Kettenus','11996','Individuell',31110.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-08','2026-01',1,4,'Collin (G.U.T)',NULL,'Kontingente',4500.0,3,'Gewonnen',4500.0,'2026-01-08','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-09','2026-01',1,4,'Elmer zusätzliche drei Standorte',NULL,'Kontingente',3200.0,NULL,'Gewonnen',3200.0,'2026-01-09','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-12','2026-01',1,5,'Jogerst Steintechnologie GmbH','11999','Karriereseite',6000.0,12,'Gewonnen',6000.0,'2026-01-12','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-13','2026-01',1,4,'Diakoneo','12002','Kontingente',6000.0,2,'Gewonnen',6000.0,'2026-01-13','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-13','2026-01',1,3,'Eberhardt Catering','12004','SM + MD',22000.0,12,'Gewonnen',22000.0,'2026-01-13','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-13','2026-01',1,5,'KABO-PLASTIC GmbH','12008','SM + MD',21000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-13','2026-01',1,3,'Amixon','12006','Individuell',28500.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-13','2026-01',1,3,'Gustav Ziegler GmbH','12007','Individuell',13600.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-13','2026-01',1,4,'SÜD-HANSA','11998','Karriereseite',6000.0,NULL,'Gewonnen',6000.0,'2026-01-13','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-14','2026-01',1,5,'Peter Krüger Sanitär und Heiztechnik','12010','SM + MD',22000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-14','2026-01',1,3,'Codex GmbH','12012','Glaubenssätze',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-15','2026-01',1,5,'Gebrüder Reinartz GmbH','12013','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-15','2026-01',1,5,'Peter und Lochner Beratende Ingenieure für Bauwesen GmbH','12016','SM + MD',22500.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-15','2026-01',1,4,'Klaus Hoch- und Tiefbau GmbH','12011','Individuell',45000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-15','2026-01',1,5,'Naumburger Baugesallschaft mbH','12018','Individuell',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-15','2026-01',1,4,'Betonpumpenunion GmbH & Co.KG','12014','Kontingente',6000.0,3,'Gewonnen',6000.0,'2026-01-15','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-15','2026-01',1,3,'Bähr Ingenieure','12017','Individuell',28000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-19','2026-01',1,5,'Jogerst Steintechnologie GmbH','12036','SM + MD',18000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-19','2026-01',1,5,'GM Getränketechnik & Maschinenbau GmbH','12031','SM + KS + MD',27000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-19','2026-01',1,5,'Trispel GmbH','12034','Kontingente',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,3,'AG Niederpöllniz','12038','SM + KS + MD',27000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,5,'SEEDAMM-INDUSTRIEDIENST GmbH','12043','Kontingente',33600.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,4,'Behringer Wohn- und Pflegeheim Wacholderpark GmbH','12039','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,3,'Altek GmbH','12041','Karriereseite',6000.0,12,'Gewonnen',6000.0,'2026-01-20','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,4,'GC Collin KG',NULL,'Kontingente',4500.0,3,'Gewonnen',4500.0,'2026-01-20','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-21','2026-01',1,3,'H2O Versorgungstechnik','12046','Karriereseite',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-21','2026-01',1,4,'Elektro Enzinger GmbH','12049','Kontingente',4600.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-21','2026-01',1,3,'Apikal','12051','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-21','2026-01',1,3,'Toha','12052','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-22','2026-01',1,5,'Naumburger Baugesallschaft mbH','12054','Individuell',8300.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-22','2026-01',1,5,'SEEDAMM-INDUSTRIEDIENST GmbH','12053','Kontingente',6000.0,2,'Gewonnen',6000.0,'2026-01-22','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-23','2026-01',1,4,'Erfurter Gleisbau GmbH','12047','Individuell',24000.0,12,'Gewonnen',24000.0,'2026-01-23','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-26','2026-01',1,4,'Lebensstift gGmbH','12058','Kontingente',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-26','2026-01',1,3,'Carediag GmbH','12061','Karriereseite',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-26','2026-01',1,4,'BM Green Cooling','2026-01-01 00:00:00','Karriereseite',8300.0,12,'Gewonnen',8300.0,'2026-01-26','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-26','2026-01',1,3,'Kettenus','11996','Kontingente',6900.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-26','2026-01',1,3,'Nitsch','11966','Karriereseite',4900.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-27','2026-01',1,5,'Bauer GmbH','12065','SM + KS + MD',28500.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-27','2026-01',1,4,'Drews Marine GmbH','12064','Kontingente',24000.0,12,'Gewonnen',24000.0,'2026-01-27','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-28','2026-01',1,3,'Elements Fitness','12067','Individuell',30000.0,12,'Gewonnen',30000.0,'2026-01-28','2026-01')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-29','2026-01',1,4,'RAPEX Heizung & Klimatechnik GmbH','12069','SM + MD',21000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-30','2026-01',1,4,'Eitle GmbH',NULL,'Kontingente',6000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-03','2026-02',1,4,'H. Ludendorff GmbH','12080','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-03','2026-02',1,5,'HKS Hünxer Kraftwerkservice GmbH','2355','Individuell',24000.0,12,'Gewonnen',24000.0,'2026-02-03','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-04','2026-02',1,4,'Abwasserverband Bergstraße','12096','SM + MD',21000.0,12,'Gewonnen',21000.0,'2026-02-04','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-04','2026-02',1,4,'Pflegezentrum Haus Monika','12098','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-04','2026-02',1,4,'Ulmer GmbH | Bäckerei-Konditorei','12101','Individuell',27000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-06','2026-02',1,4,'Götz Management Holding AG','12107','Kontingente',28800.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-09','2026-02',1,4,'VH Planungsbüro GmbH','12117','Glaubenssätze',36000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-10','2026-02',1,4,'VTA Software & Service GmbH','12115','Kontingente',24000.0,NULL,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-11','2026-02',1,3,'Standex GmbH','12129','Individuell',15200.0,4,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-11','2026-02',1,3,'Sauter Gebäudetechnik GmbH','12127','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-11','2026-02',1,3,'Hans Fischer GmbH','12128','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-12','2026-02',1,3,'Wasserverband Garbsen','12138','SM + KS + MD',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-11','2026-02',1,3,'Hochdanner GmbH','12133','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-12','2026-02',1,3,'Wiechmann GmbH','12136','Kontingente',13800.0,6,'Gewonnen',13800.0,'2026-02-12','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-12','2026-02',1,5,'Wilhem Ungeheuer Söhne GmbH','12150','Kontingente',9200.0,4,'Gewonnen',9200.0,'2026-02-12','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-13','2026-02',1,3,'Waldmann Elektrotechnik GmbH','12140','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-13','2026-02',1,5,'Kunststofftechnik Weißbach GmbH','12143','Shooting',4500.0,NULL,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-13','2026-02',1,3,'Graf Dichtungen GmbH','12144','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-16','2026-02',1,4,'EFFYCOR GmbH','12147','SM + MD',12000.0,6,'Gewonnen',12000.0,'2026-02-16','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-16','2026-02',1,4,'Jugendhilfe und Sozialarbeit e.V JuSeV','12079','Karriereseite',6000.0,NULL,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-17','2026-02',1,5,'Calmund + Riemer GmbH','12154','Social-Media',18000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-18','2026-02',1,3,'Energieversorgung Main-Spessart GmbH','12161','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-18','2026-02',1,5,'SEEDAMM-INDUSTRIEDIENST GmbH','12163','Kontingente',9000.0,3,'Gewonnen',9000.0,'2026-02-18','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-19','2026-02',1,4,'pakt GmbH','12169','Kontingente',8740.0,4,'Gewonnen',8740.0,'2026-02-19','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-23','2026-02',1,31,'Heinz Moritz GmbH','12177','Individuell',27250.0,9,'Gewonnen',27250.0,'2026-02-23','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-23','2026-02',1,4,'Diakoneo','12003','Kontingente',30000.0,12,'Gewonnen',30000.0,'2026-02-23','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-25','2026-02',1,31,'Sicht-pack Hagner GmbH','11968','KS + MD',12500.0,NULL,'Gewonnen',12500.0,'2026-02-25','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,4,'SÜD-HANSA GmbH & Co. KG','12191','Kontingente',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,4,'Weigerstorfer GmbH','12196','Kontingente',8000.0,4,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-27','2026-02',1,4,'BM Green Cooling GmbH','12204','Kontingente',6555.0,3,'Gewonnen',6555.0,'2026-02-27','2026-02')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-02','2026-03',1,4,'ELMER Dienstleistungen GmbH & Co. KG','12202','Individuell',129000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-02','2026-03',1,3,'Bardowicks GmbH','12210','Karriereseite',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-03','2026-03',1,4,'Garten Brenner','12215','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-04','2026-03',1,4,'HKA Essen','1220','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-04','2026-03',1,4,'A.S.T. Aufzüge & Service Thieme Silex GmbH','2026-01-01 00:00:00','Kontingente',2300.0,1,'Gewonnen',2300.0,'2026-03-04','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,3,'BSU','12159','Karriereseite',6000.0,12,'Gewonnen',6000.0,'2026-03-05','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,4,'robatherm GmbH & Co. KG',NULL,'Kontingente',6000.0,2,'Gewonnen',6000.0,'2026-03-05','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-10','2026-03',1,5,'IZOBLOK GmbH','12246','Kontingente',12000.0,6,'Gewonnen',12000.0,'2026-03-10','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-10','2026-03',1,4,'Heinrich Kördel GmbH','12243','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-10','2026-03',1,4,'RAPEX Heizung & Klimatechnik GmbH','12069','SM + MD',21000.0,12,'Gewonnen',21000.0,'2026-03-10','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-10','2026-03',1,5,'SEEDAMM-INDUSTRIEDIENST GmbH','12248','Kontingente',6000.0,2,'Gewonnen',6000.0,'2026-03-10','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-10','2026-03',1,4,'Karl Bachl Hoch- und Tiefbau GmbH & Co. KG','12244','Kontingente',4370.0,2,'Gewonnen',4370.0,'2026-03-10','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-12','2026-03',1,3,'H2O Versorgungstechnik','12258','Karriereseite',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-16','2026-03',1,3,'Hautambulatorium Magdeburg','12265','Karriereseite',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-17','2026-03',1,3,'Bähr Ingenieure','12017','Shooting',4000.0,NULL,'Gewonnen',4000.0,'2026-03-17','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-18','2026-03',1,4,'GT Solar','12276','Kontingente',30000.0,12,'Gewonnen',30000.0,'2026-03-18','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-19','2026-03',1,3,'Altek GmbH','12281','Kontingente',6000.0,2,'Gewonnen',6000.0,'2026-03-19','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-20','2026-03',1,3,'Autohaus Olenik','12285','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-24','2026-03',1,4,'Karl Ulrich Bauunternehmen GmbH & Co.',NULL,'Kontingente',4600.0,2,'Gewonnen',4600.0,'2026-03-24','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-24','2026-03',1,4,'micromod Partikeltechnologie GmbH','12296','Kontingente',4600.0,2,'Gewonnen',4600.0,'2026-03-24','2026-03')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-27','2026-03',1,3,'THIEME GmbH & Co. KG','11732','Karriereseite',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-30','2026-03',1,3,'TechnoTeam','12312','Shooting',3000.0,0,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-31','2026-03',1,3,'Autohaus Hottgenroth','12317','Kontingente',6000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-01','2026-04',1,6,'BBS','DA 526044-2','Karriereseite',10800.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-01','2026-04',1,7,'Knappschaft Klinikum Saar','Telefon','Kontingente',32400.0,12,'Gewonnen',32400.0,'2026-04-01','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-07','2026-04',1,8,'Mediclin Müritz','AG 2604022','Karriereseite',14000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,7,'Kommunalunternehmen Fürstenfeldbruck',NULL,'Kontingente',33600.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,8,'ASB Zwickau','aus VT','Shooting',4000.0,NULL,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,8,'Kälte Klima Grässlin','Mail','SBB',6000.0,12,'Gewonnen',6000.0,'2026-04-09','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,7,'VITREA Hattingen','Telefon','Kontingente',12000.0,4,'Gewonnen',12000.0,'2026-04-09','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,7,'Uniklinik Regensburg','Termin','SBB',6000.0,12,'Gewonnen',6000.0,'2026-04-09','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,7,'Klinkum Fürth',NULL,'Kontingente',14400.0,6,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,6,'ProCuritas',NULL,'Social-Media',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,7,'Schwarzwald Baar Klinikum','WK Termin','SBB',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-10','2026-04',1,7,'Newcare','/','Kontingente',12000.0,3,'Gewonnen',12000.0,'2026-04-10','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-13','2026-04',1,6,'EV. Altenheimat','-','Initiale Kontingenterweiterung',16800.0,12,'Gewonnen',16800.0,'2026-04-13','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-13','2026-04',1,3,'Eberhardt Catering','12346','Individuell',10000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,7,'Helios Wiesbaden',NULL,'Kontingente',60000.0,12,'Gewonnen',60000.0,'2026-04-14','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,6,'Medicare',NULL,'Initiale Kontingenterweiterung',9800.0,7,'Gewonnen',9800.0,'2026-04-14','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,6,'st. Josef Wiesbaden',NULL,'Initiale Kontingenterweiterung',8400.0,6,'Gewonnen',8400.0,'2026-04-14','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,7,'VR Bank',NULL,'SBB',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,4,'Brandt Schokoladen',NULL,'Kontingente',6900.0,3,'Gewonnen',6900.0,'2026-04-14','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,7,'Klinikverbund Südwest',NULL,'Kontingente',33600.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-15','2026-04',1,6,'Sophienstiftung',NULL,'Initiale Kontingenterweiterung',8400.0,6,'Gewonnen',8400.0,'2026-04-15','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-15','2026-04',1,6,'st. Josef Wiesbaden',NULL,'Initiale Kontingenterweiterung',4200.0,3,'Gewonnen',4200.0,'2026-04-15','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-15','2026-04',1,7,'Otto Chemie',NULL,'SBB',1000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-16','2026-04',1,6,'LA Regio',NULL,'Initiale Kontingenterweiterung',16800.0,12,'Gewonnen',16800.0,'2026-04-16','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-16','2026-04',1,7,'Klinikum Main Spessart',NULL,'Initiale Kontingenterweiterung',4200.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-16','2026-04',1,7,'Klinikum Hanau',NULL,'Initiale Kontingenterweiterung',4200.0,3,'Gewonnen',4200.0,'2026-04-16','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-16','2026-04',1,7,'Karl Jaspers Klinik',NULL,'SBB',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-16','2026-04',1,8,'Heimatliebe Bodensee GmbH',NULL,'Shooting',5000.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-17','2026-04',1,8,'Sternenbrücke Hamburg',NULL,'Kontingente',31500.0,12,'Gewonnen',31500.0,'2026-04-17','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-17','2026-04',1,7,'Aphasie Zentrum',NULL,'Kontingente',32400.0,12,'Gewonnen',32400.0,'2026-04-17','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-17','2026-04',1,8,'Mediclin Müritz',NULL,'Kontingente',32400.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-20','2026-04',1,6,'Barmherzige Regensburg',NULL,'Kontingente',13200.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-20','2026-04',1,6,'RBK',NULL,'Initiale Kontingenterweiterung',4200.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-20','2026-04',1,6,'SLK',NULL,'Initiale Kontingenterweiterung',4200.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-20','2026-04',1,6,'Barmherzige Regensburg',NULL,'Kontingente',33600.0,12,'Gewonnen',33600.0,'2026-04-20','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-20','2026-04',1,4,'CBM GmbH','12358','Kontingente',13110.0,6,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,4,'Krumbein','RF-2604001','Kontingente',7000.0,2,'Gewonnen',7000.0,'2026-04-21','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,8,'KSP CNC-Technik GmbH',NULL,'KS + MD',17500.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,8,'Auto Amthauer',NULL,'KS + MD',17500.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,6,'Klinkum Gelsenkirchen',NULL,'Kontingente',33600.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-22','2026-04',1,6,'ProCuritas','MAil GF','Initiale Kontingenterweiterung',27000.0,6,'Gewonnen',27000.0,'2026-04-22','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-22','2026-04',1,8,'Vaventus AG','Telefon','Karriereseite',14000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-22','2026-04',1,4,'EFFYCOR',NULL,'Kontingente',48000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-22','2026-04',1,8,'Kälte Klima Grässlin',NULL,'Kontingente',9000.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,4,'Valet und Ott',NULL,'Kontingente',12000.0,6,'Gewonnen',12000.0,'2026-04-23','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,7,'Dr. Ulrich lange Stiftung',NULL,'Karriereseite',14000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,7,'UniKlinik Regensburg',NULL,'Initiale Kontingenterweiterung',4200.0,4,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,6,'Christliches Krankenhaus Quakenbrück',NULL,'Kontingente',9000.0,3,'Gewonnen',9000.0,'2026-04-23','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-24','2026-04',1,6,'LBS Süd',NULL,'Initiale Kontingenterweiterung',2800.0,2,'Gewonnen',2800.0,'2026-04-24','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-24','2026-04',1,8,'Demenzpflege Bovenden','Telefon','SBB',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-24','2026-04',1,6,'Haus Edelberg',NULL,'Initiale Kontingenterweiterung',120000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-24','2026-04',1,4,'Talk Tools GmbH',NULL,'Kontingente',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,8,'Dorow Heizung GmbH',NULL,'Karriereseite',8000.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,4,'Heinrich Kördel',NULL,'Kontingente',43200.0,12,'Gewonnen',43200.0,'2026-04-27','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,7,'SUAVIA',NULL,'Kontingente',32400.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,7,'AMF',NULL,'Kontingente',28200.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,7,'DRK-Kreisverband Merseburg-Querfurt',NULL,'KS + MD',17500.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,7,'Lammetal GmbH',NULL,'KS + MD',19000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,4,'TTL Tapeten-Teppichbodenland Nord Handelsgesellschaft mbH',NULL,'Kontingente',6900.0,NULL,'Gewonnen',6900.0,'2026-04-28','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,4,'HLW GmbH Tank- und Fahrzeugbau',NULL,'Kontingente',7000.0,NULL,'Gewonnen',7000.0,'2026-04-28','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,8,'Metzger Guttjahr Stiftung','telefon','SBB',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,6,'Caritas Bruchsal',NULL,'Kontingente',27600.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,6,'Caritas krankenhaus Lebach',NULL,'Kontingente',22500.0,5,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,4,'VPT Kompressoren',NULL,'Kontingente',16500.0,6,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,4,'Müller Gerüstbau',NULL,'Kontingente',7000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,4,'pakt GmbH',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-04-28','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-29','2026-04',1,8,'Malerbetrieb Näther',NULL,'Karriereseite',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-29','2026-04',1,7,'Median NRZ Magdeburg',NULL,'Kontingente',7500.0,3,'Gewonnen',7500.0,'2026-04-29','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-29','2026-04',1,6,'Bad Belzig',NULL,'Kontingente',80000.0,12,'Gewonnen',80000.0,'2026-04-29','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-30','2026-04',1,4,'Caritasverband Pforzheim',NULL,'Kontingente',24000.0,12,'Gewonnen',24000.0,'2026-04-30','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-30','2026-04',1,8,'AWO Köln',NULL,'Kontingente',60000.0,24,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-30','2026-04',1,6,'Suedwesttouristik',NULL,'Kontingente',3000.0,1,'Gewonnen',3000.0,'2026-04-30','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-30','2026-04',1,8,'Osma Werm GmbH',NULL,'Kontingente',2300.0,1,'Gewonnen',2300.0,'2026-04-30','2026-04')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-04','2026-05',1,8,'X-tention','AG_2605002','Kontingente',25200.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-04','2026-05',1,8,'Autohaus Louis Dresen','AG_2605003','KS + MD',17500.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,8,'ZAB','Telefon','SBB',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,8,'Meyer-Tochtrop','Telefon','SBB',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,4,'Trispel GmbH',NULL,'Kontingente',13500.0,3,'Gewonnen',13500.0,'2026-05-05','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,7,'Gesundheit Nordhessen',NULL,'Kontingente',17400.0,6,'Gewonnen',17400.0,'2026-05-05','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,6,'Valens',NULL,'Kontingente',68000.0,12,'Gewonnen',68000.0,'2026-05-06','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,6,'GFO Niederrhein',NULL,'Kontingente',6000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,7,'Kutzner',NULL,'SBB',6000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,7,'Median Sonnenwende',NULL,'Kontingente',13000.0,4,'Gewonnen',13000.0,'2026-05-06','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,8,'Dr. Leonhard',NULL,'Kontingente',9000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,6,'KARAWANE',NULL,'Social-Media',15000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,4,'Rocholl',NULL,'Kontingente',13500.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,6,'KMG',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,4,'Altek',NULL,'Kontingente',1500.0,NULL,'Gewonnen',1500.0,'2026-05-08','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,7,'Uniklinik Regensburg',NULL,'Kontingente',60000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,8,'Wohnpark St. Elisabeth',NULL,'KS + MD',12000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,8,'Krügle&Höhl',NULL,'SBB',2000.0,4,'Gewonnen',2000.0,'2026-05-08','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,7,'Caritas Wohnen udn Pflege',NULL,'Shooting',5000.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,8,'Krügle&Höhl',NULL,'Shooting',4000.0,NULL,'Gewonnen',4000.0,'2026-05-08','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,8,'Dorow Heiztechnik',NULL,'SBB',6000.0,12,'Gewonnen',6000.0,'2026-05-08','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,7,'DRK Halle Saale',NULL,'KS + MD',17000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,8,'Reha Klinik Hausbaden',NULL,'KS + MD',17500.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,6,'Agravis',NULL,'Initiale Kontingenterweiterung',12600.0,9,'Gewonnen',12600.0,'2026-05-11','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,6,'Ev. Altenheimat',NULL,'Karriereseite',8000.0,12,'Gewonnen',8000.0,'2026-05-11','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,4,'Spedition Seidel',NULL,'Kontingente',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,7,'Rehaklinik Tschugg',NULL,'KS + MD',19000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-11','2026-05',1,7,'newcare',NULL,'Kontingente',3000.0,1,'Gewonnen',3000.0,'2026-05-11','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,6,'LBS Nordwest',NULL,'SBB',2500.0,2,'Gewonnen',2500.0,'2026-05-12','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,7,'Diakonie Mettmann',NULL,'Kontingente',33600.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,7,'Diakonie Mettmann',NULL,'Shooting',3000.0,1,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,4,'BSU Sanierungsunion Berlin',NULL,'SM + MD',24000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,8,'Izoblok',NULL,'SM + KS + MD',26000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,8,'Demenzpflege Bovenden',NULL,'SM + MD',12000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,7,'Klinikverbund Südwest',NULL,'Kontingente',16200.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,4,'ELMER Dienstleistungs GmbH',NULL,'Kontingente',36000.0,12,'Gewonnen',36000.0,'2026-05-12','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2025-05-13','2026-05',1,7,'ASB Saalekreis',NULL,'KS + MD',19000.0,12,'Gewonnen',19000.0,'2025-05-13','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2025-05-13','2026-05',1,7,'ASB Saalekreis',NULL,'Social-Media',24000.0,12,'Gewonnen',24000.0,'2025-05-13','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,6,'BBS Berndt',NULL,'SBB',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,8,'Paul Wältring',NULL,'KS + MD',11000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,8,'BRK Altötting',NULL,'Kontingente',19300.0,6,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,6,'Altenhilfe Gießen',NULL,'Kontingente',9000.0,2,'Gewonnen',9000.0,'2026-05-13','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-15','2026-05',1,7,'DRK Rhein Main Taunus',NULL,'Kontingente',4200.0,3,'Gewonnen',4200.0,'2026-05-15','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,8,'Casa con Property',NULL,'KS + MD',17500.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,6,'GFO Niederrhein',NULL,'Kontingente',3000.0,1,'Gewonnen',3000.0,'2026-05-18','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,6,'Awo Bonn',NULL,'SBB',6000.0,12,'Gewonnen',6000.0,'2026-05-18','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,8,'Christliche Bürgerhilfe Sozialstation gGmbH',NULL,'KS + MD',11500.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-18','2026-05',1,7,'KB Kunststoffhandel',NULL,'Kontingente',6000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,4,'Seedamm Industriedienst',NULL,'Kontingente',13500.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,8,'Wilhelm Rosebrock',NULL,'SBB',3000.0,6,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,7,'DRK Lüchow Dannenberg',NULL,'SBB',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,8,'Rheinwohnungsbau',NULL,'SM + MD',6000.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,7,'Johanniter Godeshöhe',NULL,'Kontingente',33600.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,7,'Johanniter Godeshöhe',NULL,'Shooting',3000.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,4,'Daikin Fluid Technology',NULL,'Individuell',55500.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,8,'Vaventus AG',NULL,'Kontingente',33600.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,4,'robatherm',NULL,'Kontingente',16000.0,4,'Gewonnen',16000.0,'2026-05-20','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-20','2026-05',1,4,'Talk Tools GmbH',NULL,'Kontingente',7500.0,3,'Gewonnen',7500.0,'2026-05-20','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,6,'Immanuel ML',NULL,'Kontingente',18000.0,6,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,4,'BM Green Cooling GmbH',NULL,'Kontingente',17000.0,4,'Gewonnen',17000.0,'2026-05-21','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,6,'Diakonie Münster',NULL,'SBB',6000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,6,'diakonie Münster',NULL,'Kontingente',13200.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-21','2026-05',1,7,'Median Brandis',NULL,'Kontingente',5000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,7,'Rommel Klinik',NULL,'SM + MD',27000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,4,'Erfurter Gleisbau',NULL,'Kontingente',24000.0,6,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,4,'Industrie und Tankanlagenbau',NULL,'Kontingente',8000.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,6,'Südwest Touristik',NULL,'Kontingente',32400.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,6,'Haus Edelberg',NULL,'Kontingente',9000.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,7,'KH Plettenberg',NULL,'SM + MD',27000.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,8,'Stiftung APW',NULL,'KS + MD',18000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,7,'Seniorenhaus Berghof',NULL,'KS + MD',14600.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-22','2026-05',1,7,'Aphasiezentrum',NULL,'Kontingente',2800.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,6,'Spitalstiftung Konstanz',NULL,'Kontingente',50200.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,7,'Energieversorgung Main Spessart',NULL,'Kontingente',17400.0,6,'Gewonnen',17400.0,'2026-05-26','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,6,'Wichernhaus',NULL,'Kontingente',32400.0,12,'Gewonnen',32400.0,'2026-05-26','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-27','2026-05',1,4,'Sieper',NULL,'Kontingente',4600.0,2,'Gewonnen',4600.0,'2026-05-27','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-27','2026-05',1,8,'Caritas Breisgau',NULL,'SBB',1000.0,2,'Gewonnen',1000.0,'2026-05-27','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-27','2026-05',1,7,'newcare',NULL,'Kontingente',9000.0,3,'Gewonnen',9000.0,'2026-05-27','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,8,'Wilhelm Ungeheuer Söhne GmbH',NULL,'Kontingente',1300.0,2,'Gewonnen',1300.0,'2026-05-28','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,4,'Spedition Seidel',NULL,'Kontingente',9000.0,3,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,4,'Industrie und Tankanlagenbau',NULL,'Kontingente',550.0,1,'Gewonnen',550.0,'2026-05-28','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,4,'ATOS Klinik',NULL,'Kontingente',1500.0,2,'Gewonnen',1500.0,'2026-05-28','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,4,'Proff Sanitärinstallation GmbH & Co. KG',NULL,'Kontingente',550.0,1,'Gewonnen',550.0,'2026-05-28','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,4,'HOWE Umwelttechnik GmbH',NULL,'Kontingente',2750.0,5,'Gewonnen',2750.0,'2026-05-28','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,4,'Thomas Waidner GmbH Werkzeugbau und Metallwaren',NULL,'Kontingente',1650.0,3,'Gewonnen',1650.0,'2026-05-28','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,4,'Kunststofftechnik Weißbach',NULL,'Kontingente',4500.0,1,'Gewonnen',4500.0,'2026-05-29','2026-05')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,4,'Kunststofftechnik Weißbach',NULL,'SM + MD',21000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,7,'Main-Kinzig-Klinik',NULL,'Kontingente',5600.0,4,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,7,'Knappschaft Kliniken',NULL,'Kontingente',2800.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,6,'Heizkurier',NULL,'Karriereseite',11000.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,7,'DRK Schleswig Holstein',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,4,'KST Motorenversuch',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,7,'PflegeNetz GmbH',NULL,'Kontingente',9000.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,7,'Bürgerhospital Frankfurt',NULL,'Kontingente',2800.0,2,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,4,'Emmerich Pumpen',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,4,'Dr. Ecklebe GmbH',NULL,'Kontingente',1650.0,3,'Gewonnen',1650.0,'2026-06-01','2026-06')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,4,'Dr. Ecklebe Engineering GmbH',NULL,'Kontingente',1650.0,3,'Gewonnen',1650.0,'2026-06-01','2026-06')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,7,'DRK Lübeck',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,7,'Lebenshilfe Bruchsal-Bretten',NULL,'Kontingente',9000.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,7,'Martin Bruch',NULL,'Kontingente',2800.0,2,'Gewonnen',2800.0,'2026-06-02','2026-06')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,4,'Holthausen GmbH',NULL,'Kontingente',24000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,4,'Holthausen GmbH',NULL,'SM + MD',21000.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,8,'Stoltenhof',NULL,'KS + MD',12000.0,NULL,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,7,'Friesenwarf',NULL,'Kontingente',32400.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,8,'Standex',NULL,'Kontingente',1300.0,2,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,8,'Werner Wicker Klinik',NULL,'Kontingente',62400.0,24,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,8,'Bauunternehmen Marco Friedrich',NULL,'KS + MD',14500.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,7,'Vitrea Karlsruhe',NULL,'Kontingente',13500.0,3,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,7,'Vitrea Ulm',NULL,'KS + MD',12100.0,12,'Verloren',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,8,'Malerbetrieb Näther',NULL,'KS + MD',13800.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,8,'Malerbetrieb Näther',NULL,'Kontingente',6000.0,2,'Gewonnen',6000.0,'2026-06-08','2026-06')
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,8,'SWALK',NULL,'KS + MD',13800.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,7,'MVZ Gelenkklinik',NULL,'Kontingente',32400.0,12,'Offen',0,NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-02','2026-01',1,3,'Gerresheimer Tettau GmbH','Kontingentvertrag',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-05','2026-01',1,5,'Sozialwerk Heuser Heimbetriebsgesellschaft für Nordrhein-Westfalen mbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-05','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-06','2026-01',1,3,'Audio Design Lautsprecher Vertriebs GmbH','Kontingentvertrag',6000.0,6000.0,2,'Gewonnen','2026-01-06','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-08','2026-01',1,4,'Seidel Transport- und Handelsgesellschaft mbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-08','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-09','2026-01',1,4,'Elmer Gruppe','Kontingentvertrag',9000.0,9000.0,6,'Gewonnen','2026-01-09','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-10','2026-01',1,5,'Holz Kogler GmbH & Co.KG','Kontingentvertrag',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-10','2026-01',1,5,'Peter Krüger Sanitär- und Heizungstechnik','Kontingentvertrag',6000.0,6000.0,2,'Gewonnen','2026-01-10','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-11','2026-01',1,5,'Landhaus-Bau Glinstedt GmbH','Kontingentvertrag',6000.0,6000.0,2,'Gewonnen','2026-01-11','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-12','2026-01',1,3,'GFI Gesellschaft für Feuerschutzund Installationen mbH','Kontingentvertrag',9200.0,9200.0,4,'Gewonnen','2026-01-12','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-14','2026-01',1,4,'AuraIntense24 GmbH','Kontingentvertrag',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-19','2026-01',1,4,'Mager & Wedemeyer Werkzeugmaschinen GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-19','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-19','2026-01',1,3,'OSMA-Werm GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-19','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-21','2026-01',1,3,'Scienion GmbH','Kontingentvertrag',9200.0,9200.0,4,'Gewonnen','2026-01-21','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-24','2026-01',1,4,'Abwasserverband Bergstraße','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-24','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-24','2026-01',1,4,'HSE-Haustechnik GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-24','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-25','2026-01',1,4,'GARANT Türen und Zargen GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-25','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-25','2026-01',1,5,'GM Getränketechnik & Maschinenbau GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-25','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-28','2026-01',1,4,'robatherm GmbH & Co. KG','Kontingentvertrag',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-28','2026-01',1,5,'SBF Spezialleuchten GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-28','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-29','2026-01',1,3,'schoko Pro GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-01-29','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-30','2026-01',1,3,'exceet Card AG','Kontingentvertrag',9200.0,9200.0,4,'Gewonnen','2026-01-30','2026-01')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-30','2026-01',1,3,'Thomas Scherz Dental Keramik GmbH','Kontingentvertrag',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-06','2026-01',1,4,'AuraIntense24 GmbH','Kontis',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2025-12-30','2026-01',1,5,'Ilsenburger Heimstatt für Jung und Alt e.V.','Kontis',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-07','2026-01',1,4,'Höhne GmbH','Kontis',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-09','2026-01',1,5,'Holz Kogler GmbH & Co.KG','Kontis',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-01','2026-01',1,3,'Gerresheimer Tettau GmbH','Kontis',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-13','2026-01',1,4,'ACR Chiller Rent GmbH','Kontis',NULL,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-16','2026-01',1,4,'Seidel Transport- und Handelsgesellschaft mbH','Kontis',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-20','2026-01',1,5,'Landhaus-Bau Glinstedt GmbH','Kontis',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-01','2026-02',1,5,'Logatec GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-01','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-01','2026-02',1,5,'Diakoniestation am Ev. Krankenhaus Lippstadt gGmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-01','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-02','2026-02',1,5,'Gerke-Kälte-Klima GmbH','Kontingente',9000.0,9000.0,6,'Gewonnen','2026-02-02','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-02','2026-02',1,5,'Wilhelm Ungeheuer Söhne GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-02','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-02','2026-02',1,5,'HKS Hünxer Kraftwerkservice GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-02','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-02','2026-02',1,3,'Luban Präzisionszerspanung GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-02','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-03','2026-02',1,4,'TSL GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-03','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-03','2026-02',1,5,'IZOBLOK GmbH','Kontingente',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-03','2026-02',1,5,'Trispel GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-03','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-04','2026-02',1,3,'apikal Anlagenbau GmbH','Kontingente',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-04','2026-02',1,3,'Helmut Haas GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-04','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,3,'pasapa Mensch und Beruf e.V.','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-05','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,5,'BRILLEN BECKER GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-05','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,5,'Heiztechnik Mühlhausen GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-05','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,5,'Niehoff Sitzmöbel GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-05','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-02',1,4,'Jugendhilfe und Sozialarbeit e. V.','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-05','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-08','2026-02',1,4,'DRK-Kreisverband Peine e.V.','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-08','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-08','2026-02',1,5,'Peter und Lochner Beratende Ingenieure für Bauwesen GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-08','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-08','2026-02',1,5,'Wilhelm Rosebrock GmbH & Co.KG','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-08','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-08','2026-02',1,5,'Marienstift Dorfen','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-08','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-09','2026-02',1,3,'Langer E-Technik GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-09','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-10','2026-02',1,4,'EFFYCOR GmbH','Kontingente',9200.0,9200.0,4,'Gewonnen','2026-02-10','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-13','2026-02',1,3,'Technoteam','Social-Media',18000.0,18000.0,12,'Gewonnen','2026-02-13','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-13','2026-02',1,3,'Technoteam','Wartung und Hosting KS',2388.0,2388.0,12,'Gewonnen','2026-02-13','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-14','2026-02',1,4,'KMG Ingenieurgesellschaft für Gebäude- und Versorgungstechnik mbH','Social-Media',18000.0,18000.0,12,'Gewonnen','2026-02-14','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-14','2026-02',1,4,'KMG Ingenieurgesellschaft für Gebäude- und Versorgungstechnik mbH','Wartung und Hosting KS',3600.0,3600.0,12,'Gewonnen','2026-02-14','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-16','2026-02',1,4,'IBES Baugrundinstitut Freiberg GmbH','Kontingente',9200.0,9200.0,4,'Gewonnen','2026-02-16','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-17','2026-02',1,5,'H&H Gerätebau GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-17','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-20','2026-02',1,4,'KMG Ingenieurgesellschaft für Gebäude- und Versorgungstechnik mbH','Kontingente',6900.0,0,3,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-20','2026-02',1,4,'VH Planungsbüro GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-20','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-20','2026-02',1,3,'Adams - Holzbau - Fertigbau GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-20','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-21','2026-02',1,4,'Pflegezentrum Haus Monika GmbH & Co. KG','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-21','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-21','2026-02',1,3,'Peter Blank GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-21','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-21','2026-02',1,5,'Karl Hartinger Kranbetrieb GmbH + Co. KG','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-21','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-21','2026-02',1,4,'Hertner GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-21','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-22','2026-02',1,3,'ASTRAL business intelligence services GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-22','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-24','2026-02',1,4,'VTA Software & Service GmbH','Kontingente',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-24','2026-02',1,4,'Axians Rhön-Montage GmbH','Kontingente',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-24','2026-02',1,4,'Diakoneo Wohnen Himmelkron','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-24','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-25','2026-02',1,3,'W. Nitsch GmbH & Co. KG','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-25','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,5,'MKG GÖBEL Solutions GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-02-26','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,3,'NEEMANN LiteFlexPACKAGING GmbH & Co. KG','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-26','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-26','2026-02',1,5,'Bauer GmbH Landwirtschaftliche Beregnungsanlagen','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-26','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-27','2026-02',1,3,'Waldmann Elektrotechnik GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-02-27','2026-02')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-30','2026-02',1,5,'IZOBLOK GmbH','Kontigente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-01-29','2026-02',1,NULL,'Apikal GmbH',NULL,4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-09','2026-02',1,4,'TSL GmbH','Kontingente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-01','2026-02',1,4,'Axians Rhön-Montage GmbH','Kontingente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2024-02-17','2026-02',1,4,'VTA Software & Service GmbH','Kontingente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-18','2026-02',1,4,'IBES Baugrundinstitut Freiberg GmbH','Kontingente',9200.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-19','2026-02',1,NULL,'KMG Ingenieurgesellschaft für Gebäude- und Versorgungstechnik mbH','Kontingente',6900.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-24','2026-02',1,NULL,'Peter und Lochner Beratende Ingenieure für Bauwesen GmbH','Kontingente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-25','2026-02',1,NULL,'DRK-Kreisverband Peine e.V.','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-01','2026-03',1,4,'Bella-Gardinenkonfektion AG','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-01','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,5,'Sozialwerk Heuser Heimbetriebsgesellschaft für Nordrhein-Westfalen mbH','Kontingentvertrag',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-05','2026-03',1,3,'BALTIC Taucherei- und Bergungsbetrieb Rostock GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-05','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-06','2026-03',1,3,'Audio Design Lautsprecher Vertriebs GmbH','Kontingentvertrag',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-06','2026-03',1,3,'Standex GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-06','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-08','2026-03',1,3,'Aerospace Data Security GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-08','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-08','2026-03',1,3,'Wiechmann & Wiechmann GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-08','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-10','2026-03',1,5,'Peter Krüger Sanitär- und Heizungstechnik','Kontingentvertrag',6000.0,6000.0,2,'Gewonnen','2026-03-10','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-11','2026-03',1,5,'Landhaus-Bau Glinstedt GmbH','Kontingentvertrag',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-12','2026-03',1,3,'GFI Gesellschaft für Feuerschutz und Installationen mbH','Kontingentvertrag',9200.0,9200.0,4,'Gewonnen','2026-03-12','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-13','2026-03',1,5,'x-tention Informationstechnologie GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-13','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-14','2026-03',1,4,'Hermann Bach GmbH & Co. KG','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-14','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-15','2026-03',1,3,'K&P Kälte Klima GbR','Kontingentvertrag',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-19','2026-03',1,4,'Mager & Wedemeyer Werkzeugmaschinen GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-19','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-21','2026-03',1,8,'Scienion GmbH','Kontingentvertrag',9200.0,9200.0,4,'Gewonnen','2026-03-21','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-21','2026-03',1,4,'HKA Häusliche Kranken- und Altenpflege GmbH & Co. KG','Kontingentvertrag',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-23','2026-03',1,4,'Scheuten Glastechnik Heiden GmbH','Kontingentvertrag',6000.0,6000.0,2,'Gewonnen','2026-03-23','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-24','2026-03',1,4,'Abwasserverband Bergstraße','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-24','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-24','2026-03',1,4,'HSE-Haustechnik GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-24','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-25','2026-03',1,4,'GARANT Türen und Zargen GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-25','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-25','2026-03',1,5,'GM Getränketechnik & Maschinenbau GmbH','Kontingentvertrag',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-26','2026-03',1,4,'Gottlieb Binder GmbH & Co. KG','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-26','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-28','2026-03',1,5,'SBF Spezialleuchten GmbH','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-28','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-28','2026-03',1,4,'Kanadevia Inova BioMethan GmbH','Kontingentvertrag',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-29','2026-03',1,4,'Karl Ulrich Bauunternehmen GmbH & Co.','Kontingentvertrag',4600.0,4600.0,2,'Gewonnen','2026-03-29','2026-03')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-10','2026-03',1,NULL,'Sozialwerk Heuser Heimbetriebsgesellschaft für Nordrhein-Westfalen mbH',NULL,NULL,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-02-05','2026-03',1,3,'Audio Design GmbH','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-04','2026-03',1,4,'Jugendhilfe und Sozialarbeit e. V.','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-04','2026-03',1,4,'HKA Häusliche Kranken- und Altenpflege GmbH & Co. KG','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-09','2026-03',1,4,'Hertner GmbH','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-10','2026-03',1,4,'H. Ludendorff GmbH','Kontingente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-20','2026-03',1,4,'Kanadevia Inova BioMethan GmbH','Kontingente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-20','2026-03',1,5,'GM Getränketechnik & Maschinenbau GmbH','Kontingente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-24','2026-03',1,4,'Haus Ilse','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-01','2026-04',1,8,'Diakoniestation am Ev. Krankenhaus Lippstadt gGmbH','Recruiting-Kampagne',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-01','2026-04',1,8,'Logatec GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-01','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-02','2026-04',1,5,'Wilhelm Ungeheuer Söhne GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-02','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-02','2026-04',1,4,'Behringer Wohn- und Pflegeheim Wacholderpark GmbH','Recruiting-Kampagne, Media Day',6000.0,6000.0,2,'Gewonnen','2026-04-02','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-03','2026-04',1,4,'Trispel GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-03','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-04','2026-04',1,8,'Jogerst Stein Technologie GmbH','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-05','2026-04',1,5,'Niehoff Sitzmöbel GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-05','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-05','2026-04',1,8,'Metzger-Gutjahr-Stiftung e.V.','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-05','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-05','2026-04',1,7,'BRILLEN BECKER GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-05','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-06','2026-04',1,4,'Bäckerei & Konditorei Diefenbach GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-06','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,8,'Marienstift Dorfen','Recruiting-Kampagne',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,8,'Peter und Lochner Beratende Ingenieure für Bauwesen GmbH','Recruiting-Kampagne',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,8,'Wilhelm Rosebrock GmbH & Co.KG','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-08','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-10','2026-04',1,4,'ATOS Klinik Stuttgart GmbH','Recruiting-Kampagne, Media Day',6000.0,6000.0,2,'Gewonnen','2026-04-10','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-10','2026-04',1,4,'NEUHAUSER GmbH & Co. KG','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-10','2026-04',1,4,'EFFYCOR GmbH','Recruiting-Kampagne, Media Day, Social Media Betreuung',9200.0,9200.0,4,'Gewonnen','2026-04-10','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-12','2026-04',1,3,'H2O Versorgungstechnik GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-12','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-12','2026-04',1,4,'Grün-System-Bau GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-12','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-12','2026-04',1,3,'GFI Gesellschaft für Feuerschutz und Installationen mbH','Recruiting-Kampagne, Karriere-Seite',9200.0,9200.0,4,'Gewonnen','2026-04-12','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-13','2026-04',1,7,'Hochdanner Sanitär- und Heizungs-GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-13','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-18','2026-04',1,8,'H+E Haustechnik und Elektro GmbH','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-18','2026-04',1,4,'Caritasstift St. Josef gGmbH','Recruiting-Kampagne, Media Day',6000.0,6000.0,2,'Gewonnen','2026-04-18','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-18','2026-04',1,7,'AMS Brendel GmbH Steuerberatungsgesellschaft','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-19','2026-04',1,8,'MR Landkreis Ansbach GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-19','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-19','2026-04',1,8,'AIM Wohnbau GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-19','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-19','2026-04',1,33,'Milchwerke Ingolstadt-Thalmässing eG','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-19','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-19','2026-04',1,8,'H&H Gerätebau GmbH','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-20','2026-04',1,4,'Habicht + Sporer GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-20','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-23','2026-04',1,8,'Karl Hartinger Kranbetrieb GmbH + Co. KG','Recruiting-Kampagne',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-22','2026-04',1,4,'ASTRAL business intelligence services GmbH','Recruiting-Kampagne, Karriere-Seite',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-27','2026-04',1,7,'Martin Sauter Heizungstechnik GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-27','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-25','2026-04',1,33,'W. Nitsch GmbH & Co. KG','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-25','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,4,'MKG GÖBEL Solutions GmbH','Recruiting-Kampagne',4600.0,4600.0,2,'Gewonnen','2026-04-28','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,5,'Bauer GmbH Landwirtschaftliche Beregnungsanlagen','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-28','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,4,'VPT Kompressoren GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-28','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,8,'Wartig Nord GmbH','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-28','2026-04',1,8,'Autohaus Wolfrum GmbH Naila','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-29','2026-04',1,4,'Märkl Bau GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-04-29','2026-04')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-29','2026-04',1,33,'Bruno Brenner, Garten- und Landschaftsbau GmbH','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,5,'Marienstift Dorfen','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-04','2026-04',1,5,'Jogerst Stein','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('0206-02-24','2026-04',1,5,'Peter und Lochner Beratende Ingenieure für Bauwesen GmbH',NULL,2300.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('0206-02-24','2026-04',1,5,'Autohaus Wolfrum GmbH Naila',NULL,3000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-08','2026-04',1,4,'B+S Service GmbH','Recruiting-Kampagne',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-09','2026-04',1,4,'NEUHAUSER GmbH & Co. KG','Recruiting-Kampagne',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-10','2026-04',1,3,'H+E Haustechnik und Elektro GmbH','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-03','2026-04',1,5,'H&H Gerätebau GmbH','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-03-13','2026-04',1,5,'Karl Hartinger Kranbetrieb GmbH + Co. KG','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-15','2026-04',1,4,'ATOS Klinik','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-14','2026-04',1,4,'Bäckerei Diefenbach','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-21','2026-04',1,4,'ASTRAL business intelligence services GmbH','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-22','2026-04',1,4,'HSE-Haustechnik GmbH','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-02','2026-05',1,4,'HOWE Umwelttechnik GmbH','Kontingente',9200.0,9200.0,2,'Gewonnen','2026-05-02','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-04','2026-05',1,8,'Auto Amthauer GmbH Hanau','Kontingente',5000.0,5000.0,2,'Gewonnen','2026-05-04','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,4,'Dr. Ecklebe Engineering GmbH','Kontingente',7500.0,7500.0,3,'Gewonnen','2026-05-05','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,4,'Dr. Ecklebe GmbH','Kontingente',7500.0,7500.0,3,'Gewonnen','2026-05-05','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-05','2026-05',1,33,'BALTIC Taucherei- und Bergungsbetrieb Rostock GmbH','Kontingente',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,8,'Standex GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-05-06','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,8,'Vaventus AG Kälte Klima Lüftung/ Lorenz GmbH','Kontingente',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,4,'BSU Sanierungsunion Berlin GmbH','Kontingente',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-09','2026-05',1,33,'Henn GmbH Bauunternehmung','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-09','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-09','2026-05',1,33,'Bardowicks.Haus und Holzbau GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-09','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-10','2026-05',1,8,'Peter Krüger Sanitär- und Heizungstechnik','Kontingente',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-10','2026-05',1,33,'Autohaus Olenik GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-10','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-10','2026-05',1,33,'Laudon GmbH & Co. KG','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-10','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-12','2026-05',1,33,'Graf-Dichtungen GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-05-12','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,8,'x-tention Informationstechnologie GmbH','Kontingente',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-13','2026-05',1,4,'Karl Bachl Hoch – und Tiefbau GmbH & Co. KG','Kontingente',9200.0,9200.0,4,'Gewonnen','2026-05-13','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-14','2026-05',1,8,'Seniorenpflegezentrum Bovenden GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-14','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-16','2026-05',1,4,'M. Kratzer Sanitär Heizung Spenglerei GmbH','Kontingente',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,8,'Veit Höver GmbH & Co. KG','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-19','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,6,'EMG Energie-Management GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-19','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,4,'Mager & Wedemeyer Werkzeugmaschinen GmbH','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-05-19','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-19','2026-05',1,6,'Süd-West Touristik','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-19','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-23','2026-05',1,4,'Scheuten Glastechnik Heiden GmbH','Kontingente',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-26','2026-05',1,4,'Gottlieb Binder GmbH & Co. KG','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-05-26','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-27','2026-05',1,8,'Domstadt Autohaus GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-27','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-28','2026-05',1,4,'SBF Spezialleuchten GmbH','Kontingente',4600.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-05',1,4,'Karl Ulrich Bauunternehmen GmbH & Co.','Kontingente',4600.0,4600.0,2,'Gewonnen','2026-05-29','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-30','2026-05',1,7,'Energieversorgung Main-Spessart GmbH','Kontingente',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-30','2026-05',1,7,'mosy GmbH','Kontingente',6000.0,6000.0,2,'Gewonnen','2026-05-30','2026-05')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-04-30','2026-05',1,4,'BSU Sanierungsunion Berlin GmbH','Kontingente',4600.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-06','2026-05',1,4,'habicht + sporer GmbH','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-07','2026-05',1,4,'VPT Kompressoren GmbH','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-08','2026-05',1,4,'M. Kratzer Sanitär Heizung Spenglerei GmbH','Kontingente',6000.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,8,'Diakoniestation am Ev. Krankenhaus Lippstadt gGmbH','Recruiting-Kampagne',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-01','2026-06',1,8,'Logatec GmbH','Recruiting-Kampagne',4600.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,8,'Wilhelm Ungeheuer Söhne GmbH','Recruiting-Kampagne',9200.0,9200.0,4,'Gewonnen','2026-06-02','2026-06')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-02','2026-06',1,33,'Weroform GmbH','Recruiting-Kampagne',4600.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,4,'KST-Motorenversuch GmbH & Co. KG','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-03','2026-06',1,8,'Dr. med. Sybille Hettinger Fachärztin für Augenheilkunde','Recruiting-Kampagne',3000.0,3000.0,2,'Gewonnen','2026-06-03','2026-06')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-04','2026-06',1,4,'Rocholl Gartenbau, Landschaftsbau, Sportplatzbau und Tiefbau GmbH','Recruiting-Kampagne, Media Day',10200.0,10200.0,6,'Gewonnen','2026-06-04','2026-06')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,33,'Niehoff Sitzmöbel GmbH','Recruiting-Kampagne',4600.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-05','2026-06',1,8,'Metzger-Gutjahr-Stiftung e.V.','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-06-05','2026-06')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-06','2026-06',1,8,'Trans-Service GmbH Schwarzenberg','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,8,'Wilhelm Rosebrock GmbH & Co.KG','Recruiting-Kampagne',4600.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-08','2026-06',1,8,'Physiotraining Ruwertal GmbH','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,4,'Proff Sanitärinstallation GmbH & Co. KG','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-06-09','2026-06')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,4,'Diehl GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-06-09','2026-06')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-10','2026-06',1,4,'EFFYCOR GmbH','Recruiting-Kampagne, Media Day, Social Media Betreuung',9200.0,0,4,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-12','2026-06',1,33,'Grün-System-Bau GmbH','Recruiting-Kampagne',4600.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-12','2026-06',1,4,'GFI Gesellschaft für Feuerschutz
und Installationen mbH','Recruiting-Kampagne, Karriere-Seite',9200.0,0,4,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-12','2026-06',1,4,'Senioren-Pflegeheim...aus gutem Grund GmbH','RaaS',4500.0,0,1,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-13','2026-06',1,7,'Hochdanner Sanitär- und Heizungs-GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-13','2026-06',1,6,'BBS Brand- und Wasserschadensanierung Gebrüder Berndt GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-09','2026-06',1,8,'Meyer-Tochtrop Bauunternehmen GmbH','Recruiting-Kampagne',6000.0,6000.0,2,'Gewonnen','2026-06-09','2026-06')
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-11','2026-06',1,8,'Malergeschäft Näther GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-12','2026-06',1,8,'ZAB Zentrale Akademie für Berufe im Gesundheitswesen GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-12','2026-06',1,8,'Kälte Klima Grässlin GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-19','2026-06',1,8,'AIM Wohnbau GmbH','Recruiting-Kampagne',4600.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-19','2026-06',1,33,'Milchwerke Ingolstadt-Thalmässing eG','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-19','2026-06',1,4,'Lebenshilfe für Menschen mit geistiger oder anderer Behinderung Fürth e. V.','RaaS',9000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-19','2026-06',1,4,'St. Martin Pflegeheim GmbH','RaaS',9000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-20','2026-06',1,4,'Industrie- und Tankanlagen Führer & Weingartner GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-20','2026-06',1,4,'Seniorenzentrum Hirschkamp GmbH & Co. KG','RaaS',9000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-20','2026-06',1,8,'KSP CNC-Technik GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-21','2026-06',1,8,'Wartig Nord GmbH','Recruiting-Kampagne',6000.0,0,2,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-26','2026-06',1,4,'Diakoneo','Recruiting-Kampagne',30000.0,0,12,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-27','2026-06',1,7,'Martin Sauter Heizungstechnik GmbH','Recruiting-Kampagne',4600.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-27','2026-06',1,4,'Kieser Training GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-28','2026-06',1,4,'MKG GÖBEL Solutions GmbH','Recruiting-Kampagne',4600.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-28','2026-06',1,33,'Bauer GmbH Landwirtschaftliche Beregnungsanlagen','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-28','2026-06',1,4,'Kinder- und Jugendärzte Dr. med. Holger Meinicke und Dr. med. Björn Klawitter','Recruiting-Kampagne',3000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-29','2026-06',1,33,'Bruno Brenner, Garten- und Landschaftsbau GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-29','2026-06',1,8,'Autohaus Louis Dresen GmbH','Recruiting-Kampagne',6000.0,0,2,'Offen',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-06-06','2026-06',1,NULL,'Trans-Service GmbH Schwarzenberg','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;
INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,gewonnen_datum,gewonnen_monat) VALUES ('2026-05-29','2026-06',1,NULL,'KST-Motorenversuch GmbH & Co. KG','Recruiting-Kampagne',2.0,0,NULL,'Verloren',NULL,NULL)
;

-- Rebuild ae_gesamt_monthly from imported deals
-- Migration 013 will overwrite this with AE Gesamt sheet values

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
  COALESCE(nk.bonn_anz, 0), COALESCE(nk.bonn_ae, 0),
  COALESCE(nk.bs_anz,   0), COALESCE(nk.bs_ae,   0),
  COALESCE(nk.at_anz,   0), COALESCE(nk.at_ae,   0),
  COALESCE(nk.ch_anz,   0), COALESCE(nk.ch_ae,   0),
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
    SUM(CASE WHEN COALESCE(e.standort,'') = 'Bonn'         THEN d.ae_wert ELSE 0 END) AS bonn_ae,
    COUNT(CASE WHEN COALESCE(e.standort,'') = 'Bonn'         THEN 1 END)               AS bonn_anz,
    SUM(CASE WHEN COALESCE(e.standort,'') = 'Braunschweig' THEN d.ae_wert ELSE 0 END) AS bs_ae,
    COUNT(CASE WHEN COALESCE(e.standort,'') = 'Braunschweig' THEN 1 END)               AS bs_anz,
    SUM(CASE WHEN COALESCE(e.standort,'') = 'Österreich'   THEN d.ae_wert ELSE 0 END) AS at_ae,
    COUNT(CASE WHEN COALESCE(e.standort,'') = 'Österreich'   THEN 1 END)               AS at_anz,
    SUM(CASE WHEN COALESCE(e.standort,'') = 'Schweiz'      THEN d.ae_wert ELSE 0 END) AS ch_ae,
    COUNT(CASE WHEN COALESCE(e.standort,'') = 'Schweiz'      THEN 1 END)               AS ch_anz,
    SUM(d.ae_wert) AS nk_gesamt
  FROM deals_nk d
  LEFT JOIN employees e ON e.id = d.closer_id
  WHERE d.status = 'Gewonnen' AND d.gewonnen_monat IS NOT NULL
  GROUP BY d.gewonnen_monat
) nk ON nk.monat = m.monat
LEFT JOIN (
  SELECT gewonnen_monat AS monat, SUM(ae_wert) AS bk_gesamt
  FROM deals_bk WHERE status = 'Gewonnen' AND gewonnen_monat IS NOT NULL
  GROUP BY gewonnen_monat
) bk ON bk.monat = m.monat
LEFT JOIN (
  SELECT gewonnen_monat AS monat, SUM(ae_wert) AS vl_gesamt
  FROM deals_vl WHERE status = 'Gewonnen' AND gewonnen_monat IS NOT NULL
  GROUP BY gewonnen_monat
) vl ON vl.monat = m.monat
ORDER BY m.monat
;
