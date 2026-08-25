-- Migration 097: BK-Gruppen-Zuordnung fuer Multi-Mitarbeiter. 'Multi' macht mehrere Rollen; dieses
-- Feld legt fest, ob ihr BK-Auftragseingang der KAM- oder der AM-Gruppe zugerechnet wird.
-- Werte: 'kam' | 'am' | NULL (keine Zuordnung). Nur fuer rolle='Multi' relevant; bei KAM/Closer-KAM
-- bzw. Account Manager ergibt sich die Gruppe aus der Rolle. App-validiert (kein DB-CHECK noetig).
ALTER TABLE employees ADD COLUMN bk_gruppe TEXT;
