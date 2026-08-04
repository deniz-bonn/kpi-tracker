-- Migration 082: deals_nk.status erlaubt wieder "In Verhandlung" und "In Closing Call 2" (Postgres)
--
-- Warum das noetig ist:
--   001_initial_schema legte den CHECK inline mit nur 3 Werten an
--   ('Offen', 'Gewonnen', 'Verloren') -- in BEIDEN Dialekten.
--   004_standort_status.sql (nur SQLite) legte deals_nk neu an und erweiterte den
--   CHECK auf 5 Werte. Die Postgres-Variante 004_standort_status.pg.sql fasste den
--   Constraint NICHT an -- dort blieb es bei 3 Werten.
--   006_relax_nk_quelle.sql legte deals_nk erneut an, uebernahm dabei aber wieder
--   den alten 3-Werte-CHECK und machte damit die Erweiterung aus 004 zunichte.
--   Ergebnis: Das NK-Formular bietet 5 Status an, die Datenbank akzeptiert 3.
--   Speichern mit "In Verhandlung" oder "In Closing Call 2" schlug fehl.
--
-- Der Constraint aus 001 ist inline und damit automatisch deals_nk_status_check
-- benannt -- dieselbe Konvention, die 006 fuer deals_nk_quelle_check bereits
-- erfolgreich genutzt hat.
-- Nur deals_nk: die BK- und VL-Formulare bieten weiterhin ausschliesslich die
-- drei Basis-Status an, dort bleibt der Constraint unveraendert.
ALTER TABLE deals_nk DROP CONSTRAINT IF EXISTS deals_nk_status_check;

ALTER TABLE deals_nk ADD CONSTRAINT deals_nk_status_check
  CHECK (status IN ('Offen', 'Gewonnen', 'Verloren', 'In Verhandlung', 'In Closing Call 2'));
