-- Migration 050: VL Vertragsdaten UPDATE (namen-basiert, SQLite)
-- Setzt neue Vertragsspalten für bestehende Datensätze anhand von company_id + kunde
-- ID-unabhängig, daher robust nach DELETE+INSERT Migrationen

-- Domicura Pflegedienste
UPDATE deals_vl SET vertragsnummer='TB-18370', vertragsbeginn='2025-07-01', ende_laufzeit='2026-07-01', ende_kuendigungsfrist='2026-05-01', updated_at=datetime('now') WHERE company_id=2 AND kunde='Domicura Pflegedienste' AND vertragsnummer IS NULL;

-- Klinik Nordseeküste GmbH
UPDATE deals_vl SET vertragsnummer='18715', vertragsbeginn='2025-07-15', ende_laufzeit='2026-07-14', ende_kuendigungsfrist='2026-05-14', updated_at=datetime('now') WHERE company_id=2 AND kunde='Klinik Nordseeküste GmbH' AND vertragsnummer IS NULL;

-- kbo-Inn-Salzach-Klinikum GmbH
UPDATE deals_vl SET vertragsnummer='nV', vertragsbeginn='2023-08-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-04-30', updated_at=datetime('now') WHERE company_id=2 AND kunde='kbo-Inn-Salzach-Klinikum GmbH' AND vertragsnummer IS NULL;

-- mare pflege GmbH Tagespflege Haus Lebensfreude
UPDATE deals_vl SET vertragsnummer='18851', vertragsbeginn='2026-04-21', ende_laufzeit='2026-07-21', ende_kuendigungsfrist='2026-06-21', updated_at=datetime('now') WHERE company_id=2 AND kunde='mare pflege GmbH Tagespflege Haus Lebensfreude' AND vertragsnummer IS NULL;

-- DRK Pflegedienste Steinburg gGmbH
UPDATE deals_vl SET vertragsnummer='18691', vertragsbeginn='2026-04-22', ende_laufzeit='2026-07-22', ende_kuendigungsfrist='2026-06-22', updated_at=datetime('now') WHERE company_id=2 AND kunde='DRK Pflegedienste Steinburg gGmbH' AND vertragsnummer IS NULL;

-- MEDIAN Klinik am Südpark Bad Nauheim
UPDATE deals_vl SET vertragsnummer='18850', vertragsbeginn='2026-04-09', ende_laufzeit='2026-07-09', ende_kuendigungsfrist='2026-06-09', updated_at=datetime('now') WHERE company_id=2 AND kunde='MEDIAN Klinik am Südpark Bad Nauheim' AND vertragsnummer IS NULL;

-- Heilpädagogisch-Psychotherapeutische Kinder- und Jugendhilfe e.V.
UPDATE deals_vl SET vertragsnummer='JA 11921', vertragsbeginn='2025-12-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-04-30', updated_at=datetime('now') WHERE company_id=2 AND kunde='Heilpädagogisch-Psychotherapeutische Kinder- und Jugendhilfe e.V.' AND vertragsnummer IS NULL;

-- MEDIAN Klinik Flechtingen
UPDATE deals_vl SET vertragsnummer='18901', vertragsbeginn='2026-01-15', ende_laufzeit='2026-07-14', ende_kuendigungsfrist='2026-05-14', updated_at=datetime('now') WHERE company_id=2 AND kunde='MEDIAN Klinik Flechtingen' AND vertragsnummer IS NULL;

-- Hohenhonnef GmbH Gemeinnützige Ges. der Cornelius-Helferich-Stiftung
UPDATE deals_vl SET vertragsnummer='18991', vertragsbeginn='2026-04-09', ende_laufzeit='2026-07-09', ende_kuendigungsfrist='2026-06-09', updated_at=datetime('now') WHERE company_id=2 AND kunde='Hohenhonnef GmbH Gemeinnützige Ges. der Cornelius-Helferich-Stiftung' AND vertragsnummer IS NULL;

-- Caritas Wohnen und Pflege gGmbH
UPDATE deals_vl SET vertragsnummer='JA 11939', vertragsbeginn='2026-04-15', ende_laufzeit='2026-07-15', ende_kuendigungsfrist='2026-06-15', updated_at=datetime('now') WHERE company_id=2 AND kunde='Caritas Wohnen und Pflege gGmbH' AND vertragsnummer IS NULL;

-- Simon Stephan - Spenglerei Stephan
UPDATE deals_vl SET vertragsnummer='AN25-4463', vertragsbeginn='2026-05-18', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-06-18', updated_at=datetime('now') WHERE company_id=3 AND kunde='Simon Stephan - Spenglerei Stephan' AND vertragsnummer IS NULL;

-- Xerra GmbH
UPDATE deals_vl SET vertragsnummer='AN25-4264', vertragsbeginn='2026-06-28', ende_laufzeit='2026-07-28', ende_kuendigungsfrist='2026-06-28', updated_at=datetime('now') WHERE company_id=3 AND kunde='Xerra GmbH' AND vertragsnummer IS NULL;

-- Toifl GmbH & CoKG
UPDATE deals_vl SET vertragsnummer='AN25-5693', vertragsbeginn='2026-05-28', ende_laufzeit='2026-07-28', ende_kuendigungsfrist='2026-05-28', updated_at=datetime('now') WHERE company_id=3 AND kunde='Toifl GmbH & CoKG' AND vertragsnummer IS NULL;

-- M&R Bau GmbH
UPDATE deals_vl SET vertragsnummer='AM25-5311', vertragsbeginn='2026-06-11', ende_laufzeit='2026-07-11', ende_kuendigungsfrist='2026-06-11', updated_at=datetime('now') WHERE company_id=3 AND kunde='M&R Bau GmbH' AND vertragsnummer IS NULL;

-- Garant Tiernahrung GmbH
UPDATE deals_vl SET vertragsnummer='AN25-5398', vertragsbeginn='2026-05-29', ende_laufzeit='2026-07-29', ende_kuendigungsfrist='2026-05-29', updated_at=datetime('now') WHERE company_id=3 AND kunde='Garant Tiernahrung GmbH' AND vertragsnummer IS NULL;

-- Dipl. Ing. Wilhelm Sedlak Gesellschaft m.b.H.
UPDATE deals_vl SET vertragsnummer='AN', vertragsbeginn='2026-06-27', ende_laufzeit='2026-07-27', ende_kuendigungsfrist='2026-06-27', updated_at=datetime('now') WHERE company_id=3 AND kunde='Dipl. Ing. Wilhelm Sedlak Gesellschaft m.b.H.' AND vertragsnummer IS NULL;

-- bgd Werbetechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3171', vertragsbeginn='2026-05-16', ende_laufzeit='2026-07-16', ende_kuendigungsfrist='2026-06-16', updated_at=datetime('now') WHERE company_id=3 AND kunde='bgd Werbetechnik GmbH' AND vertragsnummer IS NULL;

-- Graf-Dichtungen GmbH
UPDATE deals_vl SET vertragsnummer='11875', vertragsbeginn='2026-05-26', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-07-12', updated_at=datetime('now') WHERE company_id=1 AND kunde='Graf-Dichtungen GmbH' AND vertragsnummer IS NULL;

-- HOWE Umwelttechnik GmbH
UPDATE deals_vl SET vertragsnummer='12175', vertragsbeginn='2026-05-16', ende_laufzeit='2026-07-16', ende_kuendigungsfrist='2026-07-02', updated_at=datetime('now') WHERE company_id=1 AND kunde='HOWE Umwelttechnik GmbH' AND vertragsnummer IS NULL;

-- Wartig Nord GmbH
UPDATE deals_vl SET vertragsnummer='12134', vertragsbeginn='2026-05-12', ende_laufzeit='2026-07-12', ende_kuendigungsfrist='2026-06-28', updated_at=datetime('now') WHERE company_id=1 AND kunde='Wartig Nord GmbH' AND vertragsnummer IS NULL;

-- MR Landkreis Ansbach GmbH
UPDATE deals_vl SET vertragsnummer='12105', vertragsbeginn='2026-05-03', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', updated_at=datetime('now') WHERE company_id=1 AND kunde='MR Landkreis Ansbach GmbH' AND vertragsnummer IS NULL;

-- Mag. Birgit Eichberger Steuerberatung
UPDATE deals_vl SET vertragsnummer='AN26-3344', vertragsbeginn='2026-05-03', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', updated_at=datetime('now') WHERE company_id=3 AND kunde='Mag. Birgit Eichberger Steuerberatung' AND vertragsnummer IS NULL;

-- MEDICLIN Müritz-Klinikum
UPDATE deals_vl SET vertragsnummer='2602105', vertragsbeginn='2026-05-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=2 AND kunde='MEDICLIN Müritz-Klinikum' AND vertragsnummer IS NULL;

-- Bardowicks.Haus und Holzbau GmbH
UPDATE deals_vl SET vertragsnummer='11687', vertragsbeginn='2026-05-23', ende_laufzeit='2026-07-23', ende_kuendigungsfrist='2026-07-09', updated_at=datetime('now') WHERE company_id=1 AND kunde='Bardowicks.Haus und Holzbau GmbH' AND vertragsnummer IS NULL;

-- Novoferm Austria GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3317', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-04', ende_kuendigungsfrist='2026-06-04', updated_at=datetime('now') WHERE company_id=3 AND kunde='Novoferm Austria GmbH' AND vertragsnummer IS NULL;

-- HENN GmbH Hoch- und Tiefbau
UPDATE deals_vl SET vertragsnummer='12110', vertragsbeginn='2026-05-23', ende_laufzeit='2026-07-23', ende_kuendigungsfrist='2026-07-09', updated_at=datetime('now') WHERE company_id=1 AND kunde='HENN GmbH Hoch- und Tiefbau' AND vertragsnummer IS NULL;

-- Sauter Gebäudetechnik GmbH
UPDATE deals_vl SET vertragsnummer='1668', vertragsbeginn='2026-05-11', ende_laufzeit='2026-07-11', ende_kuendigungsfrist='2026-06-27', updated_at=datetime('now') WHERE company_id=1 AND kunde='Sauter Gebäudetechnik GmbH' AND vertragsnummer IS NULL;

-- M. Kratzer Sanitär Heizung Spenglerei GmbH
UPDATE deals_vl SET vertragsnummer='12216', vertragsbeginn='2026-05-30', ende_laufzeit='2026-07-30', ende_kuendigungsfrist='2026-07-16', updated_at=datetime('now') WHERE company_id=1 AND kunde='M. Kratzer Sanitär Heizung Spenglerei GmbH' AND vertragsnummer IS NULL;

-- Fahrner GmbH
UPDATE deals_vl SET vertragsnummer='AN25-5179', vertragsbeginn='2026-05-13', ende_laufzeit='2026-07-13', ende_kuendigungsfrist='2026-06-13', updated_at=datetime('now') WHERE company_id=3 AND kunde='Fahrner GmbH' AND vertragsnummer IS NULL;

-- Krankenhaus Düren gem. GmbH
UPDATE deals_vl SET vertragsnummer='2602097', vertragsbeginn='2026-04-13', ende_laufzeit='2026-07-12', ende_kuendigungsfrist='2026-06-12', updated_at=datetime('now') WHERE company_id=2 AND kunde='Krankenhaus Düren gem. GmbH' AND vertragsnummer IS NULL;

-- Elektro Rapold GmbH
UPDATE deals_vl SET vertragsnummer='ab', vertragsbeginn='2026-05-17', ende_laufzeit='2026-07-17', ende_kuendigungsfrist='2026-06-17', updated_at=datetime('now') WHERE company_id=3 AND kunde='Elektro Rapold GmbH' AND vertragsnummer IS NULL;

-- Stiftung St. Thomaehof
UPDATE deals_vl SET vertragsnummer='2603057', vertragsbeginn='2026-05-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=2 AND kunde='Stiftung St. Thomaehof' AND vertragsnummer IS NULL;

-- Karl Strauß GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3402', vertragsbeginn='2026-05-18', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-06-18', updated_at=datetime('now') WHERE company_id=3 AND kunde='Karl Strauß GmbH' AND vertragsnummer IS NULL;

-- Ballmeyer Kälte u. Klima GmbH
UPDATE deals_vl SET vertragsnummer='12114', vertragsbeginn='2026-05-17', ende_laufzeit='2026-07-17', ende_kuendigungsfrist='2026-07-03', updated_at=datetime('now') WHERE company_id=1 AND kunde='Ballmeyer Kälte u. Klima GmbH' AND vertragsnummer IS NULL;

-- mosy GmbH
UPDATE deals_vl SET vertragsnummer='12224', vertragsbeginn='2026-05-16', ende_laufzeit='2026-07-16', ende_kuendigungsfrist='2026-07-02', updated_at=datetime('now') WHERE company_id=2 AND kunde='mosy GmbH' AND vertragsnummer IS NULL;

-- AGU Architektengruppe U-Bahn Ziviltechniker GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3239', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', updated_at=datetime('now') WHERE company_id=3 AND kunde='AGU Architektengruppe U-Bahn Ziviltechniker GmbH' AND vertragsnummer IS NULL;

-- BSU Sanierungsunion Berlin GmbH
UPDATE deals_vl SET vertragsnummer='11470', vertragsbeginn='2026-05-20', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-07-06', updated_at=datetime('now') WHERE company_id=1 AND kunde='BSU Sanierungsunion Berlin GmbH' AND vertragsnummer IS NULL;

-- WK Pulverbeschichtung Ges.m.b.H.
UPDATE deals_vl SET vertragsnummer='AN26-3311', vertragsbeginn='2026-05-20', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-06-20', updated_at=datetime('now') WHERE company_id=3 AND kunde='WK Pulverbeschichtung Ges.m.b.H.' AND vertragsnummer IS NULL;

-- Eco Wirtschaftstreuhand Steuerberatung - ecostb GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3438', vertragsbeginn='2026-03-23', ende_laufzeit='2026-07-22', ende_kuendigungsfrist='2026-06-22', updated_at=datetime('now') WHERE company_id=3 AND kunde='Eco Wirtschaftstreuhand Steuerberatung - ecostb GmbH' AND vertragsnummer IS NULL;

-- KST-Motorenversuch GmbH & Co. KG
UPDATE deals_vl SET vertragsnummer='12235', vertragsbeginn='2026-05-23', ende_laufzeit='2026-07-23', ende_kuendigungsfrist='2026-07-09', updated_at=datetime('now') WHERE company_id=1 AND kunde='KST-Motorenversuch GmbH & Co. KG' AND vertragsnummer IS NULL;

-- Medek & Schörner GmbH
UPDATE deals_vl SET vertragsnummer='AN25-4862', vertragsbeginn='2026-05-26', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=datetime('now') WHERE company_id=3 AND kunde='Medek & Schörner GmbH' AND vertragsnummer IS NULL;

-- Hubers Landhendl GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3476', vertragsbeginn='2026-03-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=datetime('now') WHERE company_id=3 AND kunde='Hubers Landhendl GmbH' AND vertragsnummer IS NULL;

-- Kinder- und Jugendärzte Dr. med. Holger Meinicke und Dr. med. Björn Klawitter
UPDATE deals_vl SET vertragsnummer='12197', vertragsbeginn='2026-05-12', ende_laufzeit='2026-07-11', ende_kuendigungsfrist='2026-06-27', updated_at=datetime('now') WHERE company_id=1 AND kunde='Kinder- und Jugendärzte Dr. med. Holger Meinicke und Dr. med. Björn Klawitter' AND vertragsnummer IS NULL;

-- Die Brücke Konzeptpflege GmbH
UPDATE deals_vl SET vertragsnummer='11533', vertragsbeginn='2026-06-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-07-17', updated_at=datetime('now') WHERE company_id=1 AND kunde='Die Brücke Konzeptpflege GmbH' AND vertragsnummer IS NULL;

-- Stiftung Pro Gemeinsinn gGmbH
UPDATE deals_vl SET vertragsnummer='TB-12243', vertragsbeginn='2026-04-08', ende_laufzeit='2026-07-07', ende_kuendigungsfrist='2026-06-07', updated_at=datetime('now') WHERE company_id=2 AND kunde='Stiftung Pro Gemeinsinn gGmbH' AND vertragsnummer IS NULL;

-- KSP CNC-Technik GmbH
UPDATE deals_vl SET vertragsnummer='2604017', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-19', updated_at=datetime('now') WHERE company_id=2 AND kunde='KSP CNC-Technik GmbH' AND vertragsnummer IS NULL;

-- Wismarer Werkstätten GmbH - Gemeinnützige Einrichtung für Menschen mit Behinderung
UPDATE deals_vl SET vertragsnummer='TB-12275', vertragsbeginn='2026-04-09', ende_laufzeit='2026-07-08', ende_kuendigungsfrist='2026-06-08', updated_at=datetime('now') WHERE company_id=2 AND kunde='Wismarer Werkstätten GmbH - Gemeinnützige Einrichtung für Menschen mit Behinderung' AND vertragsnummer IS NULL;

-- Sanibau Handelsgesellschaft m.b.H.
UPDATE deals_vl SET vertragsnummer='AN26-3425', vertragsbeginn='2026-04-14', ende_laufzeit='2026-07-13', ende_kuendigungsfrist='2026-06-13', updated_at=datetime('now') WHERE company_id=3 AND kunde='Sanibau Handelsgesellschaft m.b.H.' AND vertragsnummer IS NULL;

-- Sentius Seniorenhaus I GmbH
UPDATE deals_vl SET vertragsnummer='2604067', vertragsbeginn='2026-04-15', ende_laufzeit='2026-07-14', ende_kuendigungsfrist='2026-06-14', updated_at=datetime('now') WHERE company_id=2 AND kunde='Sentius Seniorenhaus I GmbH' AND vertragsnummer IS NULL;

-- Dorow Heizung Lüftung Sanitär GmbH
UPDATE deals_vl SET vertragsnummer='12320', vertragsbeginn='2026-05-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-07-06', updated_at=datetime('now') WHERE company_id=1 AND kunde='Dorow Heizung Lüftung Sanitär GmbH' AND vertragsnummer IS NULL;

-- INDUSTRIE- UND TANKANLAGEN Führer & Weingartner GmbH
UPDATE deals_vl SET vertragsnummer='12284', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-19', updated_at=datetime('now') WHERE company_id=1 AND kunde='INDUSTRIE- UND TANKANLAGEN Führer & Weingartner GmbH' AND vertragsnummer IS NULL;

-- I.D.V. Isolier- und Dämmstoff-Vertriebs-GmbH
UPDATE deals_vl SET vertragsnummer='12328', vertragsbeginn='2026-05-15', ende_laufzeit='2026-07-14', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=1 AND kunde='I.D.V. Isolier- und Dämmstoff-Vertriebs-GmbH' AND vertragsnummer IS NULL;

-- Bauer GmbH Landwirtschaftliche Beregnungsanlagen
UPDATE deals_vl SET vertragsnummer='11947', vertragsbeginn='2026-05-13', ende_laufzeit='2026-07-13', ende_kuendigungsfrist='2026-06-29', updated_at=datetime('now') WHERE company_id=1 AND kunde='Bauer GmbH Landwirtschaftliche Beregnungsanlagen' AND vertragsnummer IS NULL;

-- Service 4 Care GmbH
UPDATE deals_vl SET vertragsnummer='TB-18506', vertragsbeginn='2026-04-24', ende_laufzeit='2026-07-23', ende_kuendigungsfrist='2026-06-23', updated_at=datetime('now') WHERE company_id=2 AND kunde='Service 4 Care GmbH' AND vertragsnummer IS NULL;

-- St. Martin Pflegeheim GmbH
UPDATE deals_vl SET vertragsnummer='JK-13319', vertragsbeginn='2026-04-20', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', updated_at=datetime('now') WHERE company_id=1 AND kunde='St. Martin Pflegeheim GmbH' AND vertragsnummer IS NULL;

-- Rheinwohnungsbau GmbH
UPDATE deals_vl SET vertragsnummer='JK-13326', vertragsbeginn='2026-04-20', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', updated_at=datetime('now') WHERE company_id=1 AND kunde='Rheinwohnungsbau GmbH' AND vertragsnummer IS NULL;

-- Neurologisches Rehabilitationszentrum Godeshöhe GmbH
UPDATE deals_vl SET vertragsnummer='2604086', vertragsbeginn='2026-04-20', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', updated_at=datetime('now') WHERE company_id=2 AND kunde='Neurologisches Rehabilitationszentrum Godeshöhe GmbH' AND vertragsnummer IS NULL;

-- Rommel-Klinik
UPDATE deals_vl SET vertragsnummer='BK-12288', vertragsbeginn='2026-05-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=2 AND kunde='Rommel-Klinik' AND vertragsnummer IS NULL;

-- Lammetal GmbH Gemeinnützige Lebenshilfe Einrichtungen
UPDATE deals_vl SET vertragsnummer='JK-13324', vertragsbeginn='2026-04-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-06-20', updated_at=datetime('now') WHERE company_id=2 AND kunde='Lammetal GmbH Gemeinnützige Lebenshilfe Einrichtungen' AND vertragsnummer IS NULL;

-- Seniorenzentrum Hirschkamp GmbH & Co. KG
UPDATE deals_vl SET vertragsnummer='TB-14250', vertragsbeginn='2026-04-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-06-20', updated_at=datetime('now') WHERE company_id=2 AND kunde='Seniorenzentrum Hirschkamp GmbH & Co. KG' AND vertragsnummer IS NULL;

-- Arbeiter-Samariter-Bund Regionalverband Saalekreis Süd e. V.
UPDATE deals_vl SET vertragsnummer='JK-13323', vertragsbeginn='2026-04-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-06-20', updated_at=datetime('now') WHERE company_id=2 AND kunde='Arbeiter-Samariter-Bund Regionalverband Saalekreis Süd e. V.' AND vertragsnummer IS NULL;

-- sicht-pack Hagner GmbH
UPDATE deals_vl SET vertragsnummer='2', vertragsbeginn='2026-06-25', ende_laufzeit='2026-07-25', ende_kuendigungsfrist='2026-07-11', updated_at=datetime('now') WHERE company_id=1 AND kunde='sicht-pack Hagner GmbH' AND vertragsnummer IS NULL;

-- ASB Südbaden | Arbeiter-Samariter-Bund BW Region Südbaden
UPDATE deals_vl SET vertragsnummer='TB-14272', vertragsbeginn='2026-04-22', ende_laufzeit='2026-07-21', ende_kuendigungsfrist='2026-06-21', updated_at=datetime('now') WHERE company_id=2 AND kunde='ASB Südbaden | Arbeiter-Samariter-Bund BW Region Südbaden' AND vertragsnummer IS NULL;

-- Spitalstiftung Konstanz Verwaltung
UPDATE deals_vl SET vertragsnummer='2604094', vertragsbeginn='2026-04-20', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', updated_at=datetime('now') WHERE company_id=2 AND kunde='Spitalstiftung Konstanz Verwaltung' AND vertragsnummer IS NULL;

-- Autohaus Louis Dresen GmbH
UPDATE deals_vl SET vertragsnummer='12337', vertragsbeginn='2026-05-13', ende_laufzeit='2026-07-12', ende_kuendigungsfrist='2026-06-28', updated_at=datetime('now') WHERE company_id=1 AND kunde='Autohaus Louis Dresen GmbH' AND vertragsnummer IS NULL;

-- Kieser Training GmbH
UPDATE deals_vl SET vertragsnummer='12286', vertragsbeginn='2026-05-11', ende_laufzeit='2026-07-10', ende_kuendigungsfrist='2026-06-26', updated_at=datetime('now') WHERE company_id=1 AND kunde='Kieser Training GmbH' AND vertragsnummer IS NULL;

-- DOG Deutsche Oelfabrik Gesellschaft für chemische Erzeugnisse mbH & Co. KG
UPDATE deals_vl SET vertragsnummer='12345', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-07-04', updated_at=datetime('now') WHERE company_id=1 AND kunde='DOG Deutsche Oelfabrik Gesellschaft für chemische Erzeugnisse mbH & Co. KG' AND vertragsnummer IS NULL;

-- Wohnpark St. Elisabeth
UPDATE deals_vl SET vertragsnummer='TB-14278', vertragsbeginn='2026-04-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=datetime('now') WHERE company_id=2 AND kunde='Wohnpark St. Elisabeth' AND vertragsnummer IS NULL;

-- Rehaklinik Tschugg AG
UPDATE deals_vl SET vertragsnummer='BK-12313', vertragsbeginn='2026-04-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=datetime('now') WHERE company_id=2 AND kunde='Rehaklinik Tschugg AG' AND vertragsnummer IS NULL;

-- Schlosserei Schliebach GmbH
UPDATE deals_vl SET vertragsnummer='12361', vertragsbeginn='2026-05-15', ende_laufzeit='2026-07-14', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=1 AND kunde='Schlosserei Schliebach GmbH' AND vertragsnummer IS NULL;

-- Braumann Haustechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-4633', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', updated_at=datetime('now') WHERE company_id=3 AND kunde='Braumann Haustechnik GmbH' AND vertragsnummer IS NULL;

-- Alpsolar Klimadesign OG
UPDATE deals_vl SET vertragsnummer='AN26-3642', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', updated_at=datetime('now') WHERE company_id=3 AND kunde='Alpsolar Klimadesign OG' AND vertragsnummer IS NULL;

-- Energy3000 solar GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3828', vertragsbeginn='2026-05-05', ende_laufzeit='2026-07-04', ende_kuendigungsfrist='2026-06-04', updated_at=datetime('now') WHERE company_id=3 AND kunde='Energy3000 solar GmbH' AND vertragsnummer IS NULL;

-- Intersport Kaltenbrunner/PRO-Sport Handelsgesellschaft m.b.H.
UPDATE deals_vl SET vertragsnummer='AN26-3433', vertragsbeginn='2026-05-06', ende_laufzeit='2026-07-05', ende_kuendigungsfrist='2026-06-05', updated_at=datetime('now') WHERE company_id=3 AND kunde='Intersport Kaltenbrunner/PRO-Sport Handelsgesellschaft m.b.H.' AND vertragsnummer IS NULL;

-- KWSG Elektrotechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3821', vertragsbeginn='2026-05-04', ende_laufzeit='2026-07-03', ende_kuendigungsfrist='2026-06-03', updated_at=datetime('now') WHERE company_id=3 AND kunde='KWSG Elektrotechnik GmbH' AND vertragsnummer IS NULL;

-- Autohaus Oberhofer Josef GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3652', vertragsbeginn='2026-05-07', ende_laufzeit='2026-07-06', ende_kuendigungsfrist='2026-06-06', updated_at=datetime('now') WHERE company_id=3 AND kunde='Autohaus Oberhofer Josef GmbH' AND vertragsnummer IS NULL;

-- Ton & Bild Medientechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3857', vertragsbeginn='2026-05-07', ende_laufzeit='2026-07-06', ende_kuendigungsfrist='2026-06-06', updated_at=datetime('now') WHERE company_id=3 AND kunde='Ton & Bild Medientechnik GmbH' AND vertragsnummer IS NULL;

-- FMG | Fahrzeugbau – Maschinenbau GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3717', vertragsbeginn='2026-05-08', ende_laufzeit='2026-07-07', ende_kuendigungsfrist='2026-06-07', updated_at=datetime('now') WHERE company_id=3 AND kunde='FMG | Fahrzeugbau – Maschinenbau GmbH' AND vertragsnummer IS NULL;

-- Triptiser Edelstahl GmbH
UPDATE deals_vl SET vertragsnummer='MS-14296', vertragsbeginn='2026-06-08', ende_laufzeit='2026-07-08', ende_kuendigungsfrist='2026-07-01', updated_at=datetime('now') WHERE company_id=2 AND kunde='Triptiser Edelstahl GmbH' AND vertragsnummer IS NULL;

-- Heizung-Sanitär Schöpf GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3865', vertragsbeginn='2026-05-11', ende_laufzeit='2026-07-10', ende_kuendigungsfrist='2026-06-10', updated_at=datetime('now') WHERE company_id=3 AND kunde='Heizung-Sanitär Schöpf GmbH' AND vertragsnummer IS NULL;

-- SCM Group Austria Zweigniederlassung Österreich
UPDATE deals_vl SET vertragsnummer='AN25-4801', vertragsbeginn='2026-05-11', ende_laufzeit='2026-07-10', ende_kuendigungsfrist='2026-06-10', updated_at=datetime('now') WHERE company_id=3 AND kunde='SCM Group Austria Zweigniederlassung Österreich' AND vertragsnummer IS NULL;

-- BIO-AKTIV Günther Johann Wasser- und Wärmetechnik
UPDATE deals_vl SET vertragsnummer='AN26-3876', vertragsbeginn='2026-05-12', ende_laufzeit='2026-07-11', ende_kuendigungsfrist='2026-06-11', updated_at=datetime('now') WHERE company_id=3 AND kunde='BIO-AKTIV Günther Johann Wasser- und Wärmetechnik' AND vertragsnummer IS NULL;

-- DIMOCO Payments GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3605', vertragsbeginn='2026-05-12', ende_laufzeit='2026-07-11', ende_kuendigungsfrist='2026-06-11', updated_at=datetime('now') WHERE company_id=3 AND kunde='DIMOCO Payments GmbH' AND vertragsnummer IS NULL;

-- PBS Deutschland GmbH
UPDATE deals_vl SET vertragsnummer='12339', vertragsbeginn='2026-05-22', ende_laufzeit='2026-07-21', ende_kuendigungsfrist='2026-07-07', updated_at=datetime('now') WHERE company_id=1 AND kunde='PBS Deutschland GmbH' AND vertragsnummer IS NULL;

-- TWF International GmbH
UPDATE deals_vl SET vertragsnummer='AN25-3812', vertragsbeginn='2026-05-13', ende_laufzeit='2026-07-12', ende_kuendigungsfrist='2026-06-12', updated_at=datetime('now') WHERE company_id=3 AND kunde='TWF International GmbH' AND vertragsnummer IS NULL;

-- Casa Con Property Management GmbH
UPDATE deals_vl SET vertragsnummer='20260510-164928177', vertragsbeginn='2026-05-10', ende_laufzeit='2026-07-09', ende_kuendigungsfrist='2026-06-25', updated_at=datetime('now') WHERE company_id=1 AND kunde='Casa Con Property Management GmbH' AND vertragsnummer IS NULL;

-- Wilhelm Ungeheuer Söhne GmbH
UPDATE deals_vl SET vertragsnummer='12150', vertragsbeginn='2026-03-03', ende_laufzeit='2026-07-02', ende_kuendigungsfrist='2026-06-18', updated_at=datetime('now') WHERE company_id=1 AND kunde='Wilhelm Ungeheuer Söhne GmbH' AND vertragsnummer IS NULL;

-- Holzbau Lengauer-Stockner GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3917', vertragsbeginn='2026-05-18', ende_laufzeit='2026-07-17', ende_kuendigungsfrist='2026-06-17', updated_at=datetime('now') WHERE company_id=3 AND kunde='Holzbau Lengauer-Stockner GmbH' AND vertragsnummer IS NULL;

-- Schönberger Alternative Haustechnik GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3931', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-06-18', updated_at=datetime('now') WHERE company_id=3 AND kunde='Schönberger Alternative Haustechnik GmbH' AND vertragsnummer IS NULL;

-- VOGT NDT GmbH
UPDATE deals_vl SET vertragsnummer='20260514-135225190', vertragsbeginn='2026-05-14', ende_laufzeit='2026-07-13', ende_kuendigungsfrist='2026-06-29', updated_at=datetime('now') WHERE company_id=1 AND kunde='VOGT NDT GmbH' AND vertragsnummer IS NULL;

-- Kühlanlagenbau Fritz Lachmayr GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3935', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-06-18', updated_at=datetime('now') WHERE company_id=3 AND kunde='Kühlanlagenbau Fritz Lachmayr GmbH' AND vertragsnummer IS NULL;

-- KSA Kastenmüller Systems Austria GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3799', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-06-18', updated_at=datetime('now') WHERE company_id=3 AND kunde='KSA Kastenmüller Systems Austria GmbH' AND vertragsnummer IS NULL;

-- Holzbaumeister Strebinger GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3946', vertragsbeginn='2026-06-26', ende_laufzeit='2026-07-27', ende_kuendigungsfrist='2026-07-13', updated_at=datetime('now') WHERE company_id=3 AND kunde='Holzbaumeister Strebinger GmbH' AND vertragsnummer IS NULL;

-- FRÖSCHL-BAU GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3742', vertragsbeginn='2026-05-20', ende_laufzeit='2026-07-19', ende_kuendigungsfrist='2026-06-19', updated_at=datetime('now') WHERE company_id=3 AND kunde='FRÖSCHL-BAU GmbH' AND vertragsnummer IS NULL;

-- SPS Klimatechnische Verkaufsu. Beratungs GmbH
UPDATE deals_vl SET vertragsnummer='20260519-073438903', vertragsbeginn='2026-06-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-07-17', updated_at=datetime('now') WHERE company_id=1 AND kunde='SPS Klimatechnische Verkaufsu. Beratungs GmbH' AND vertragsnummer IS NULL;

-- H.KLEINEBERG GmbH Metallhalbzeughandel
UPDATE deals_vl SET vertragsnummer='MS-14314', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-07-04', updated_at=datetime('now') WHERE company_id=2 AND kunde='H.KLEINEBERG GmbH Metallhalbzeughandel' AND vertragsnummer IS NULL;

-- Bauunternehmen Marco Friedrich GmbH
UPDATE deals_vl SET vertragsnummer='20260519-120405080', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-07-04', updated_at=datetime('now') WHERE company_id=1 AND kunde='Bauunternehmen Marco Friedrich GmbH' AND vertragsnummer IS NULL;

-- RIKA KOMPRESSOREN GMBH
UPDATE deals_vl SET vertragsnummer='AN26-3962', vertragsbeginn='2026-05-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-06-20', updated_at=datetime('now') WHERE company_id=3 AND kunde='RIKA KOMPRESSOREN GMBH' AND vertragsnummer IS NULL;

-- Biedensand Bäder Lampertheim GmbH
UPDATE deals_vl SET vertragsnummer='20260515-075956601', vertragsbeginn='2026-05-19', ende_laufzeit='2026-07-18', ende_kuendigungsfrist='2026-07-04', updated_at=datetime('now') WHERE company_id=1 AND kunde='Biedensand Bäder Lampertheim GmbH' AND vertragsnummer IS NULL;

-- Stumpe-Nevels Nachf. GmbH & Co. KG
UPDATE deals_vl SET vertragsnummer='MS-14332', vertragsbeginn='2026-05-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-07-13', updated_at=datetime('now') WHERE company_id=2 AND kunde='Stumpe-Nevels Nachf. GmbH & Co. KG' AND vertragsnummer IS NULL;

-- Troxler-Haus Wuppertal e. V.
UPDATE deals_vl SET vertragsnummer='BK-12408', vertragsbeginn='2026-05-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-06-20', updated_at=datetime('now') WHERE company_id=2 AND kunde='Troxler-Haus Wuppertal e. V.' AND vertragsnummer IS NULL;

-- Nordhoff Inh. Wilhelm Wierlemann e.К.
UPDATE deals_vl SET vertragsnummer='MS-14325', vertragsbeginn='2026-05-21', ende_laufzeit='2026-07-20', ende_kuendigungsfrist='2026-07-13', updated_at=datetime('now') WHERE company_id=2 AND kunde='Nordhoff Inh. Wilhelm Wierlemann e.К.' AND vertragsnummer IS NULL;

-- HEFA Hans Eggert Fahl GmbH
UPDATE deals_vl SET vertragsnummer='11117', vertragsbeginn='2026-05-26', ende_laufzeit='2026-07-25', ende_kuendigungsfrist='2026-07-11', updated_at=datetime('now') WHERE company_id=1 AND kunde='HEFA Hans Eggert Fahl GmbH' AND vertragsnummer IS NULL;

-- Gärtnerei Rischer GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3914', vertragsbeginn='2026-05-26', ende_laufzeit='2026-07-25', ende_kuendigungsfrist='2026-06-25', updated_at=datetime('now') WHERE company_id=3 AND kunde='Gärtnerei Rischer GmbH' AND vertragsnummer IS NULL;

-- Tirolpack GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3965', vertragsbeginn='2026-05-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-05-26', updated_at=datetime('now') WHERE company_id=3 AND kunde='Tirolpack GmbH' AND vertragsnummer IS NULL;

-- REFORM Fenster GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3989', vertragsbeginn='2026-05-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=datetime('now') WHERE company_id=3 AND kunde='REFORM Fenster GmbH' AND vertragsnummer IS NULL;

-- SBT Steuerberatungs GmbH & Co KG
UPDATE deals_vl SET vertragsnummer='AN26-4000', vertragsbeginn='2026-05-27', ende_laufzeit='2026-07-26', ende_kuendigungsfrist='2026-06-26', updated_at=datetime('now') WHERE company_id=3 AND kunde='SBT Steuerberatungs GmbH & Co KG' AND vertragsnummer IS NULL;

-- Meile-technik GmbH Heizung-Klima-Sanitär
UPDATE deals_vl SET vertragsnummer='20260519-101216450', vertragsbeginn='2026-05-29', ende_laufzeit='2026-07-28', ende_kuendigungsfrist='2026-07-14', updated_at=datetime('now') WHERE company_id=1 AND kunde='Meile-technik GmbH Heizung-Klima-Sanitär' AND vertragsnummer IS NULL;

-- Hamann GmbH
UPDATE deals_vl SET vertragsnummer='2605001', vertragsbeginn='2026-05-26', ende_laufzeit='2026-07-25', ende_kuendigungsfrist='2026-07-11', updated_at=datetime('now') WHERE company_id=1 AND kunde='Hamann GmbH' AND vertragsnummer IS NULL;

-- ITA Tischlermontagen GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3070', vertragsbeginn='2026-05-28', ende_laufzeit='2026-07-27', ende_kuendigungsfrist='2026-06-27', updated_at=datetime('now') WHERE company_id=3 AND kunde='ITA Tischlermontagen GmbH' AND vertragsnummer IS NULL;

-- Farm-ING Smart Farm Equipment FlexCo
UPDATE deals_vl SET vertragsnummer='AN26-3796', vertragsbeginn='2026-05-28', ende_laufzeit='2026-07-27', ende_kuendigungsfrist='2026-06-27', updated_at=datetime('now') WHERE company_id=3 AND kunde='Farm-ING Smart Farm Equipment FlexCo' AND vertragsnummer IS NULL;

-- Intensivpflegedienst exzellent care GmbH
UPDATE deals_vl SET vertragsnummer='2605068', vertragsbeginn='2026-05-28', ende_laufzeit='2026-07-27', ende_kuendigungsfrist='2026-06-27', updated_at=datetime('now') WHERE company_id=2 AND kunde='Intensivpflegedienst exzellent care GmbH' AND vertragsnummer IS NULL;

-- Cargomind (Austria) GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3878', vertragsbeginn='2026-05-29', ende_laufzeit='2026-07-28', ende_kuendigungsfrist='2026-06-28', updated_at=datetime('now') WHERE company_id=3 AND kunde='Cargomind (Austria) GmbH' AND vertragsnummer IS NULL;

-- Genius Steuerberatung GmbH
UPDATE deals_vl SET vertragsnummer='AN26-4010', vertragsbeginn='2026-05-29', ende_laufzeit='2026-07-28', ende_kuendigungsfrist='2026-06-28', updated_at=datetime('now') WHERE company_id=3 AND kunde='Genius Steuerberatung GmbH' AND vertragsnummer IS NULL;

-- Wintersport Tirol AG & Co - Stubaier Bergbahnen KG
UPDATE deals_vl SET vertragsnummer='AN26-3944', vertragsbeginn='2026-06-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=3 AND kunde='Wintersport Tirol AG & Co - Stubaier Bergbahnen KG' AND vertragsnummer IS NULL;

-- Klingler Installationen GmbH
UPDATE deals_vl SET vertragsnummer='AN26-3213', vertragsbeginn='2026-06-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=3 AND kunde='Klingler Installationen GmbH' AND vertragsnummer IS NULL;

-- PRT Rohrtechnik Berlin-Brandenburg GmbH
UPDATE deals_vl SET vertragsnummer='TB-18127', vertragsbeginn='2026-06-08', ende_laufzeit='2026-07-07', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=1 AND kunde='PRT Rohrtechnik Berlin-Brandenburg GmbH' AND vertragsnummer IS NULL;

-- Holzbau Franz Kreiseder GmbH
UPDATE deals_vl SET vertragsnummer='AN26-4009', vertragsbeginn='2026-06-01', ende_laufzeit='2026-07-31', ende_kuendigungsfrist='2026-06-30', updated_at=datetime('now') WHERE company_id=3 AND kunde='Holzbau Franz Kreiseder GmbH' AND vertragsnummer IS NULL;

-- Gebr. Schröder Kabel- und Leitungsbau GmbH
UPDATE deals_vl SET vertragsnummer='2605082', vertragsbeginn='2026-06-29', ende_laufzeit='2026-07-29', ende_kuendigungsfrist='2026-07-22', updated_at=datetime('now') WHERE company_id=1 AND kunde='Gebr. Schröder Kabel- und Leitungsbau GmbH' AND vertragsnummer IS NULL;

-- Gemeinschaftspraxis Dr. med. Hans-Werner Müller-Dethard und Amir Shobeiry
UPDATE deals_vl SET vertragsnummer='MS-14304', vertragsbeginn='2026-06-03', ende_laufzeit='2026-07-02', ende_kuendigungsfrist='2026-06-25', updated_at=datetime('now') WHERE company_id=2 AND kunde='Gemeinschaftspraxis Dr. med. Hans-Werner Müller-Dethard und Amir Shobeiry' AND vertragsnummer IS NULL;

-- Tiroler Hospiz Betriebsgesellschaft m.b.H.
UPDATE deals_vl SET vertragsnummer='AB26-2058', vertragsbeginn='2026-06-11', ende_laufzeit='2026-07-10', ende_kuendigungsfrist='2026-06-26', updated_at=datetime('now') WHERE company_id=3 AND kunde='Tiroler Hospiz Betriebsgesellschaft m.b.H.' AND vertragsnummer IS NULL;

-- Helmut Hinz GmbH & Co.
UPDATE deals_vl SET vertragsnummer='RN 10440', vertragsbeginn='2026-06-25', ende_laufzeit='2026-07-25', ende_kuendigungsfrist='2026-07-11', updated_at=datetime('now') WHERE company_id=1 AND kunde='Helmut Hinz GmbH & Co.' AND vertragsnummer IS NULL;

-- ZYNP Europe GmbH
UPDATE deals_vl SET vertragsnummer='2606104', vertragsbeginn='2026-06-17', ende_laufzeit='2026-07-16', ende_kuendigungsfrist='2026-07-09', updated_at=datetime('now') WHERE company_id=1 AND kunde='ZYNP Europe GmbH' AND vertragsnummer IS NULL;

-- Seniorenstift Ingelfingen GmbH
UPDATE deals_vl SET vertragsnummer='MS-14380', vertragsbeginn='2026-06-22', ende_laufzeit='2026-07-21', ende_kuendigungsfrist='2026-07-14', updated_at=datetime('now') WHERE company_id=2 AND kunde='Seniorenstift Ingelfingen GmbH' AND vertragsnummer IS NULL;
