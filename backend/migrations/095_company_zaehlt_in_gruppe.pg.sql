-- Migration 095: Gruppen-Scope-Flag (Postgres). Zentrale Quelle dafuer, welche Standorte in
-- Gruppen-Summen (Gesamt-Auftragseingang) und Zielerreichung einfliessen: alle Firmen mit
-- zaehlt_in_gruppe=TRUE. Risem (Schweiz) ist vorerst NICHT Teil der Gruppe -> FALSE.
-- Kommt die Schweiz spaeter voll dazu: Flag auf TRUE (Konfiguration), kein Codeaenderung noetig.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS zaehlt_in_gruppe BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE companies SET zaehlt_in_gruppe = FALSE WHERE name = 'Risem';
