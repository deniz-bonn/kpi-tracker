-- Migration 095: Gruppen-Scope-Flag (siehe .pg.sql). SQLite: BOOLEAN als INTEGER 0/1.
-- Standorte, deren Firma zaehlt_in_gruppe=1 hat, fliessen in Gruppen-Summen (Gesamt-AE) und
-- Zielerreichung ein. Risem (Schweiz) ist vorerst NICHT Teil der Gruppe -> 0. Kommt die Schweiz
-- spaeter voll dazu: hier auf 1 setzen (Konfiguration), kein Codeaenderung noetig.
ALTER TABLE companies ADD COLUMN zaehlt_in_gruppe INTEGER NOT NULL DEFAULT 1;
UPDATE companies SET zaehlt_in_gruppe = 0 WHERE name = 'Risem';
