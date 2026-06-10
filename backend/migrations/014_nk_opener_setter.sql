-- Migration 014: Set opener_id and setter_id for NK deals
-- Braunschweig openers stay NULL (generic placeholder, not a real employee)
-- Duplicate names resolved to the active employee

UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-01-14' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'H2O Versorgungstechnik GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-01-15' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'MOB Märkische Oberflächenanlagen & Behälterbau GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-01-15' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Altek GmbH'
;
UPDATE deals_nk SET opener_id = 13, setter_id = 11 WHERE datum = '2026-01-16' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Hochdanner Sanitär- und Heizungs-GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-01-16' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Ka-Ro electronics Fertigungs-GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-01-19' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'PB Gelatins GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-01-20' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'BG Gastro Holding GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-01-20' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'FUCHS Bau Ost GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-01-20' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Dr. med. Alexandra Borgmann Fachärztin für Innere Medizin Fachärztin für Innere Medizin'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-01-20' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'BSU Projekt Service GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-01-21' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'MDH AG Mamisch Dental Health'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-01-21' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Diehl GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-01-23' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'PBG Handwerker GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-01-26' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Digatron Power Electronics GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-01-26' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Grün-System-Bau GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-01-26' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Bauunternehmung Tholen GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 12 WHERE datum = '2026-01-28' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'WERIT-Kunststoffwerke W. Schneider GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-01-28' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Dr. Ecklebe GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-01-29' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Polland Gartengestaltung GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-01-30' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Werner''s Metzgerei GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-01-30' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'NEUHAUSER GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-01-30' AND monat = '2026-01' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'H+E Haustechnik und Elektro GmbH'
;
UPDATE deals_nk SET setter_id = 11 WHERE datum = '2026-02-02' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'VPT Kompressoren GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-02' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'HLW GmbH Tank- und Fahrzeugbau'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-03' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Bäckerei & Konditorei Diefenbach GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-03' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'HolyPoly GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-03' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Andreas Seise Gebäudetechnik GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-02-04' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Petry AG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-04' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'AmbiPark GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-05' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'AMS Brendel GmbH Steuerberatungsgesellschaft'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-05' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Habicht + Sporer GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-05' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'MR Landkreis Ansbach GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-05' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'MATTHIAS TRÖPGEN Bauunternehmung GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-06' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Henn GmbH Bauunternehmung'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-02-09' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Ballmeyer Kälte u. Klima GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-02-10' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Laudon GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-10' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Karl Bachl Hoch – und Tiefbau GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-10' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Vaventus AG Kälte Klima Lüftung'
;
UPDATE deals_nk SET opener_id = 13, setter_id = 11 WHERE datum = '2026-02-10' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Märkl Bau GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-02-11' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Diehn Heizungstechnik GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-11' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'B+S Soziale Dienste FHH GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-11' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Christian Merle Zahnarztpraxis'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-12' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Klaistower Hofbäckerei GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-12' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Auto Amthauer GmbH Hanau'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-12' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Wartig Nord GmbH'
;
UPDATE deals_nk SET opener_id = 14, setter_id = 11 WHERE datum = '2026-02-12' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Zöller-Bau GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-02-16' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Energieversorgung Main-Spessart GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-16' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'IDS Systemumschlag GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-02-17' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Daume'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-18' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Gartencenter Heinrich Ramme GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-18' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'topline Bürosysteme Förtsch und Gimpl GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-18' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'GSD Gesellschaft für Sparkassendienstleistungen mbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-19' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Autohaus Wolfrum GmbH Naila'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-19' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'BEN Buchele Elektromotorenwerke GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-20' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Andries GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-20' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Bardowicks.Haus und Holzbau GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-20' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Autohaus Hammdorf Wolfenbüttel'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-23' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'HOWE Umwelttechnik GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-23' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Bruno Brenner, Garten- und Landschaftsbau GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-25' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'dekarbo GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-26' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'PS Union GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-26' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Nord-Spedetion GmbH & Co.KG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-26' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Jesko Gärtner Zahnarzt'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-02-26' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'ZAB Zentrale Akademie für Berufe im Gesundheitswesen GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-26' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Autohaus Peter Ebner'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-02-27' AND monat = '2026-02' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'EMG Energie-Management GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-02' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Schnurr GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-02' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Trans-Service GmbH Schwarzenberg'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-02' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Dr. Boris Henkel und Dr. Jeanette Henkel-Gutjahr Zahnarztpraxis'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-03' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Groschopp AG Drives & More'
;
UPDATE deals_nk SET opener_id = 15, setter_id = 11 WHERE datum = '2026-03-03' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'M. Kratzer Sanitär Heizung Spenglerei GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 12 WHERE datum = '2026-03-03' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Kur- und Sporthotel Appartementhaus GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-03-04' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Autohaus Olenik GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-04' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Jens Gottschalk GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-03-04' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Autohaus Olenik GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-03-04' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Gebr. Schnur GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-05' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'ProDEKon Blechtechnik GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 14, setter_id = 11 WHERE datum = '2026-03-05' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'mosy GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 12 WHERE datum = '2026-03-05' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Apotheker Walter Bouhon GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-03-05' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Proff Sanitärinstallation GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 14, setter_id = 11 WHERE datum = '2026-03-05' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'IGW Ingenieure GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-03-06' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'GEMTEC AG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-06' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Fensterbau Rutsch GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-06' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Ehrenfels Heizung & Bad GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-09' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Industriebau Haldensleben GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-09' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'ASCANETZ GmbH'
;
UPDATE deals_nk SET opener_id = 16, setter_id = 11 WHERE datum = '2026-03-09' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'FLACHGLAS Sachsen GmbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-03-09' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Veit Höver GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 15 WHERE datum = '2026-03-09' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'AWOcura gGmbH'
;
UPDATE deals_nk SET opener_id = 16, setter_id = 11 WHERE datum = '2026-03-10' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'StaMaTec R. Puder Stahl und Maschinenbautechnik GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-11' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Autohaus Wiese OHG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-03-11' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Dr. med. Sybille Hettinger Fachärztin für Augenheilkunde'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-03-11' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Fahrzeugbau Jahn GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-12' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'SWAP (Sachsen) GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-12' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'phaeno - gemeinnützige GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-13' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'TTL Tapeten-Teppichbodenland Nord Handelsgesellschaft mbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-13' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Dr. med. Jens-Joachim Brücher Dermatologische Praxis'
;
UPDATE deals_nk SET opener_id = 16, setter_id = 11 WHERE datum = '2026-03-17' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Meyer-Tochtrop Bauunternehmen GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-18' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Innotherm Heizsysteme GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-03-18' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Laboratoire Biosthetique Kosmetik GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-03-20' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Industrie- und Tankanlagen Führer&Weingartner GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-20' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Kieser Training GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-03-23' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Kring & Huppertz GmbH Garten und Landschaftsbau'
;
UPDATE deals_nk SET opener_id = 15 WHERE datum = '2026-03-23' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Procuritas Seniorenzentrum Reinigungs GmbH'
;
UPDATE deals_nk SET opener_id = 15 WHERE datum = '2026-03-17' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Stiftung Pro Gemeinsinn gGmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 10 WHERE datum = '2026-03-24' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'BBS Brand- und Wasserschadensanierung Gebrüder Berndt GmbH'
;
UPDATE deals_nk SET opener_id = 15 WHERE datum = '2026-03-25' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Dr. Ulrich-Lange-Stiftung GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-25' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Baukonzept Neubrandenburg GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 12 WHERE datum = '2026-03-25' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Stadtbäckerei Kühl GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 12 WHERE datum = '2026-03-26' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Ramgraber GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-26' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Hermann Otto GmbH'
;
UPDATE deals_nk SET opener_id = 16, setter_id = 11 WHERE datum = '2026-03-26' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'C. Schrade GmbH'
;
UPDATE deals_nk SET opener_id = 16, setter_id = 11 WHERE datum = '2026-03-27' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'WiWa Wilko Wagner GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-03-27' AND monat = '2026-03' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Kälte Klima Grässlin GmbH'
;
UPDATE deals_nk SET opener_id = 16, setter_id = 11 WHERE datum = '2026-04-01' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 11 AND kunde = 'Dorow Heizung Lüftung Sanitär GmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-04-01' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Evangelisches Johannesstift Wichernkrankenhaus gGmbH'
;
UPDATE deals_nk SET opener_id = 24, setter_id = 25 WHERE datum = '2026-04-01' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Eloquendo GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-04-02' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'INTEC Engineering GmbH'
;
UPDATE deals_nk SET opener_id = 24, setter_id = 24 WHERE datum = '2026-04-02' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'St. Elisabeth Wohn- und Pflegeheim'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 25 WHERE datum = '2026-04-02' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Ev. Altenheim St. Jacobistift'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 25 WHERE datum = '2026-04-02' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Wismarer Werkstätten GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 25 WHERE datum = '2026-04-07' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Neu­ro­lo­gi­sche Kli­nik Sel­zer GmbH'
;
UPDATE deals_nk SET opener_id = 24, setter_id = 25 WHERE datum = '2026-04-07' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Sonnhalden | Genossenschaft Regionales Pflegeheim'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-07' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Golfclub Nippenburg GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-07' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Malergeschäft Näther GmbH'
;
UPDATE deals_nk SET opener_id = 12, setter_id = 11 WHERE datum = '2026-04-08' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'I.D.V. Isolier- und Dämmstoff-Vertriebs-GmbH'
;
UPDATE deals_nk SET opener_id = 16, setter_id = 11 WHERE datum = '2026-04-08' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Energietechnik Bremen GmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-08' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Seniorensitz am Deister GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 12 WHERE datum = '2026-04-09' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'DOG Deutsche Oelfabrik Gesellschaft für chemische Erzeugnisse mbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-09' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Autohaus Hunold GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-09' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Karl Kühnlein GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-09' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Autohaus Louis Dresen GmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-09' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Kolping Bildung Deutschland gGmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-09' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Diakonie im Landkreis Karlsruhe gemeinnützige GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 24 WHERE datum = '2026-04-09' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Spitex Region Frauenfeld'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-10' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'DRK-Kreisverband Merseburg-Querfurt e.V.'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 25 WHERE datum = '2026-04-10' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Behandlungszentrum Aschau GmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-13' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Walther Dachziegel GmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-13' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Uni Klinik Mainz'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-13' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Mörk GmbH & Co. KG'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-14' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Klinikum Peine AöR'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-14' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Arbeiterwohlfahrt Ortsverein Viernheim e. V.'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-14' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Lebenshilfe Fürth e.V.'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-14' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Grundbaulabor Bremen, Ingenieurgesellschaft für Geotechnik mbH'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-04-14' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'SIMAKA Energie- und Umwelttechnik GmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-14' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Radiologie München eGbR'
;
UPDATE deals_nk SET opener_id = 5, setter_id = 24 WHERE datum = '2026-04-15' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Seniorenzentrum Hirschkamp'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-15' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Reifen Fricke GmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-16' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Lebenshilfe Bruchsal'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-16' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'HELIOS Klinik Rottweil'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-16' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Arbeiter-Samariter-Bund Regionalverband Saalekreis Süd e. V.'
;
UPDATE deals_nk SET setter_id = 24 WHERE datum = '2026-04-17' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Ev. Pflegeheim Lutherstift gGmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-17' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Arbeiter-Samariter-Bund Baden-Württemberg e.V.'
;
UPDATE deals_nk SET setter_id = 24 WHERE datum = '2026-04-17' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Lebenshilfe Bonn'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-17' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Diakoneo Krannkenhaus Rangau'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-20' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Rheinwohnungsbau Dienstleistungen GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-21' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Heizungs- und Sanitärtechnik Klante Klante GmbH'
;
UPDATE deals_nk SET opener_id = 9, setter_id = 9 WHERE datum = '2026-04-21' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Schlosserei Schliebach GmbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-21' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Klinikum Stuttgart'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-21' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Caritas Trägergesellschaft Saarbrücken mbH cts'
;
UPDATE deals_nk SET setter_id = 24 WHERE datum = '2026-04-22' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Wolfsteiner Altenheim-Stiftung gemeinnützige Betriebsgesellschaft mbH'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-22' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Lebenshilfe Kreisvereinigung Saarlouis e.V.'
;
UPDATE deals_nk SET setter_id = 25 WHERE datum = '2026-04-23' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Elan-Fitness GmbH'
;
UPDATE deals_nk SET opener_id = 15, setter_id = 24 WHERE datum = '2026-04-23' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Wohnpark St.Elisabeth'
;
UPDATE deals_nk SET opener_id = 11, setter_id = 11 WHERE datum = '2026-04-23' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Krügle & Höhl GmbHSteinmetz- und Bildhauermeisterbetrieb'
;
UPDATE deals_nk SET setter_id = 24 WHERE datum = '2026-04-24' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Klinikum Fichtelgebirge gGmbH'
;
UPDATE deals_nk SET setter_id = 27 WHERE datum = '2026-04-24' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Senioren-Pflegeheim...aus gutem Grund GmbH'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-27' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Krone gebäudemanagement und technologie gmbh'
;
UPDATE deals_nk SET setter_id = 27 WHERE datum = '2026-04-28' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Sozialstation Wendlingen am Neckar e.V.'
;
UPDATE deals_nk SET opener_id = 10, setter_id = 11 WHERE datum = '2026-04-28' AND monat = '2026-04' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'KIRSCHNER HOLDING GmbH'
;
UPDATE deals_nk SET setter_id = 27 WHERE datum = '2026-05-04' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 12 AND kunde = 'Casa Con Property Management GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-04' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Behindertenhilfe Norden gemeinnützige GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-04' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Reha-Klinik Hausbaden'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-05-04' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Senevita AG Bern'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 25 WHERE datum = '2026-05-04' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Hamburger Hospiz am Deich gGmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 25 WHERE datum = '2026-05-05' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Diakonisches Werk an der Saar gGmbH'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 25 WHERE datum = '2026-05-05' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'AllDent Holding GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 25 WHERE datum = '2026-05-05' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Alten- und Pflegeheim St. Michael Kongregation der Barmherzigen Schwestern vom hl. Vinzenz von Paul Deal'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 25 WHERE datum = '2026-05-06' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Gesellschaft für diakonische Altenhilfe Gießen und Linden gGmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-05-06' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Spitex Region Kreuzlingen'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-06' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Altenheim & Pflegeheim Stoltenhof'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 27 WHERE datum = '2026-05-06' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'DRK-Kreisverband Halle-Saalkreis-Mansfelder Land e.V.'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 24 WHERE datum = '2026-05-06' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'rehaklinik-montafon'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 25 WHERE datum = '2026-05-07' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'ASB-Ortsverband Brandenburg an der Havel e.V.'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-05-07' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Stiftung Alters- und Pflegeheim Weggis'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 27 WHERE datum = '2026-05-07' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Paul Wältring Vieh- und Fleischhandels GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-07' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'CABINET Schranksysteme AG'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 24 WHERE datum = '2026-05-08' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Diakonie Kliniken Hunsrück gGmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-08' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Christliche Bürgerhilfe Sozialstation gGmbH'
;
UPDATE deals_nk SET opener_id = 29, setter_id = 25 WHERE datum = '2026-05-11' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Seniorenhaus Berghof GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 27 WHERE datum = '2026-05-11' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'BS Ambulanter Pflegedienst UG'
;
UPDATE deals_nk SET opener_id = 29, setter_id = 25 WHERE datum = '2026-05-11' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Diabetes-Klinik Bad Mergentheim GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 24 WHERE datum = '2026-05-11' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Tabea Diakonie - Pflege Heiligenstadt gGmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 24 WHERE datum = '2026-05-11' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Schweizer Paraplegiker-Zentrum'
;
UPDATE deals_nk SET opener_id = 29, setter_id = 27 WHERE datum = '2026-05-12' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'E+S Sozialkonzepte gGmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-05-12' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Wohn- und Pflegeheim Sonnmatt AG'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 27 WHERE datum = '2026-05-12' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Spitalzweisimmen'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-12' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Deutsche Steinzeug Cremer & Breuer AG Deal'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 24 WHERE datum = '2026-05-13' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'AlexA Seniorendienste GmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 24 WHERE datum = '2026-05-13' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Clinica Holistica Engiadina SA'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 24 WHERE datum = '2026-05-18' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Diakonie-Sozialstation Visselhövede-Bothel gemeinnützige GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-18' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Ameos Klinikum Osnabrück'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 25 WHERE datum = '2026-05-18' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Stiftung Haus Tabea'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 25 WHERE datum = '2026-05-19' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Krankenhaus Angermünde'
;
UPDATE deals_nk SET opener_id = 29, setter_id = 27 WHERE datum = '2026-05-19' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Neue Burg GmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 24 WHERE datum = '2026-05-20' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'T r o x l e r-H a u s W u p p e r t a l e. V. Einrichtungen für Seelenpflegebedürftige'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 25 WHERE datum = '2026-05-20' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Fachklinik und Seniorenresidenz Main-Taunus gGmbH Varisano'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-05-20' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Spitex Davos'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 28 WHERE datum = '2026-05-21' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'AA Alternative Altenhilfe GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-21' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Helios Klinik Müllheim'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-21' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Neurologisches Rehabilitationszentrum Quellenhof in Bad Wildbad GmbH'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 25 WHERE datum = '2026-05-21' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'VAMED Rehazentrum Karlsruhe'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-21' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Heizungstechnik Service GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-22' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Alternativ Wohnen im Alter GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-07' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Triptiser Edelstahl GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-09' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Chez Mandarin GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-08' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'CABINET Schranksysteme AG'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-11' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Heiner Dresrüsse Metallbau GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-12' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'H. KLEINEBERG GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-12' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Mein Ofenstudio GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-19' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'James Marquardt & Co. GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-08' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Gemeinschaftspraxis Dr. med. Hans-Werner Müller-Dethard und Amir Shobeiry'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-11' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Rauser Tief- und Straßenbau GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-13' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Physiotherapie und medizinische Fitness GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-08' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'ANNABURGER Nutzfahrzeug GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-12' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Neltner Großküchen GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-13' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Donau-Ries Haustechnik GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-20' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Peter Rieper GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-20' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'DS Heizung und Sanitär GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-21' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Stumpe-Nevels Nachf. GmbH & Co.'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-20' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Christian Reh GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-13' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Holger Bartels GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-22' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'W+M Flachdachbau GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-22' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'UNI-SERVICE GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-21' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Lücking & Härtel GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-26' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Verein für Innere Mission in Bremen e. V.'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 27 WHERE datum = '2026-05-26' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Jesse GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-26' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Deutsches Rotes Kreuz Landesverband Schleswig-Holstein e. V.'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-26' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Baustoff und Gewässer- sanierungs GmbH Dessau'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-26' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Klinikum Lippe GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-26' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Alexander-von-Humboldt-Klinik GRZ Geriatrisches Rehabilitationszentrum Betriebsgesellschaft mbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 23 WHERE datum = '2026-05-27' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Intensivpflegedienst exzellent care GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-05-27' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Hörland GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-28' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Physiowalk'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-05-28' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Pflegeheim Wohnpark Zippendorf GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-05-28' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Cereneo Klinik'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 27 WHERE datum = '2026-05-28' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'ASB Ortsverband Neustadt/Sachsen e.V.'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 24 WHERE datum = '2026-05-29' AND monat = '2026-05' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Der Pflegeluchs GmbH'
;
UPDATE deals_nk SET opener_id = 15, setter_id = 11 WHERE datum = '2026-06-01' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 9 AND kunde = 'Kulina Zerspanungstechnik und Maschinenbau GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-01' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Biedermann Orthopaedietechnik GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-01' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Vitalis - Häusliche Krankenpflege'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-06-01' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Ingenieurbüro EUKON'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 24 WHERE datum = '2026-06-01' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Karosserie- & Lackierzentrum Büchel GmbH & Co.KG'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-02' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'CBS Caritas Betriebsträgergesellschaft mbH Speyer'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-06-02' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'GZO AG Spital Wetzikon'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-02' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Kost Wärmetechnik GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-03' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Edling + Hammerschmidt Gebäudetechnik GmbH'
;
UPDATE deals_nk SET opener_id = 29, setter_id = 27 WHERE datum = '2026-06-03' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Arbeiterwohlfahrt Kreisverband Essen e.V.'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-03' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'August Karthaus GmbH & Co. KG'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-03' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Sparkasse Barnim Deal'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 27 WHERE datum = '2026-06-03' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Haus Abendfrieden'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-03' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Stöhr Bakery GmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 25 WHERE datum = '2026-06-04' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Spitäler Frutigen Meiringen Interlaken AG'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 25 WHERE datum = '2026-06-04' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Kreuzgewölbe GmbH Demenzkompetenzzentrum Sachsen'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 24 WHERE datum = '2026-06-04' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Klinik Helle Mitte'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 24 WHERE datum = '2026-06-04' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'AlexA Seniorendienste GmbH Pirna'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 25 WHERE datum = '2026-06-04' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Deutsches Rotes Kreuz Betreuungsdienste Lübeck gGmbH'
;
UPDATE deals_nk SET opener_id = 29, setter_id = 27 WHERE datum = '2026-06-04' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Klinik Schöneberg GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-04' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Geraer Heimbetriebsgesellschaft mbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-05' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Physiotherapie am Rheinpark GmbH'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 25 WHERE datum = '2026-06-05' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Deutsches Rotes Kreuz Kreisverband Grafschaft Bentheim e. V.'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-05' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Bonifatius Seniorendienste GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 23 WHERE datum = '2026-06-05' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Gartenwelt Meißner'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 25 WHERE datum = '2026-06-05' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Diakonische Altenhilfe Siegerland gGmbH'
;
UPDATE deals_nk SET opener_id = 29, setter_id = 25 WHERE datum = '2026-06-08' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'PflegeService Wirtz GmbH'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 27 WHERE datum = '2026-06-08' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'activamed Pflegedienst GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 24 WHERE datum = '2026-06-08' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Manfred Kries GmbH'
;
UPDATE deals_nk SET opener_id = 25, setter_id = 24 WHERE datum = '2026-06-08' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Diakonische Gesellschaft Wohnen und Beraten mbH DWB'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 27 WHERE datum = '2026-06-08' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'BÜHR Anlagenbau & Service GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 27 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Rotor Control GmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 27 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Hoffbauer-Stiftung Potsdam'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 24 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Senevita Sunnwies'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'ZABAG AG'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 27 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Seniorenheim am Pfaffenberg GmbH'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 23 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'IKB Pflegeteam GmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 27 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Klinik SGM Langenthal'
;
UPDATE deals_nk SET opener_id = 23, setter_id = 23 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'Lutz Technologie GmbH Stefan Lutz'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-09' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 27 AND kunde = 'Erich Neter GmbH'
;
UPDATE deals_nk SET opener_id = 28, setter_id = 27 WHERE datum = '2026-06-10' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Reha- und Kurklinik Eden'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-10' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 24 AND kunde = 'WWI Cottbus GmbH'
;
UPDATE deals_nk SET opener_id = 27, setter_id = 27 WHERE datum = '2026-06-10' AND monat = '2026-06' AND company_id = 1 AND COALESCE(closer_id, 0) = 25 AND kunde = 'Sport- und Rehacentrum Magdeburg'
;
