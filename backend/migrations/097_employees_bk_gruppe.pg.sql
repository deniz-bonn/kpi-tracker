-- Migration 097: BK-Gruppen-Zuordnung fuer Multi-Mitarbeiter (Postgres). Legt fest, ob der
-- BK-Auftragseingang eines 'Multi' der KAM- oder AM-Gruppe zugerechnet wird ('kam' | 'am' | NULL).
-- Nur fuer rolle='Multi' relevant; KAM/Closer-KAM -> KAM, Account Manager -> AM (aus der Rolle).
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bk_gruppe TEXT;
