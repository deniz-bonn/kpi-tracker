-- Migration 112: Terminstatus 'verschoben' zulassen — Postgres
--
-- Fachliche Festlegung (19.09.2026): Ein verschobener Termin ist quotenNEUTRAL. Er hat nicht
-- stattgefunden, ist aber auch nicht geplatzt. Bis hierher stand QC_VERSCHOBEN in NEGATIV und
-- zaehlte damit wie ein No-Show gegen die Show-Rate — das bestrafte genau das Verhalten, das man
-- sehen will: dass jemand die Verschiebung ueberhaupt pflegt.
--
-- WICHTIG fuer das 50-%-Gate: 'verschoben' gilt als GEPFLEGTER Ausgang. Quote und Gate rechnen
-- deshalb auf verschiedenen Mengen:
--   Quote = stattgefunden / (stattgefunden + nicht_stattgefunden)     -- verschoben faellt raus
--   Gate  = (stattgefunden + nicht_stattgefunden + verschoben) / gelegt
-- Wer verschiebt und es dokumentiert, drueckt seinen Monat also nicht unter die Schwelle.
--
-- Nur der CHECK aendert sich; kein Bestand wird angefasst. Die Umklassifizierung passiert beim
-- naechsten Sync-Lauf, weil deriveTermine die Termine ohnehin vollstaendig neu ableitet.
ALTER TABLE termine DROP CONSTRAINT IF EXISTS termine_status_check;
ALTER TABLE termine ADD CONSTRAINT termine_status_check
  CHECK (status IN ('stattgefunden','nicht_stattgefunden','offen','unklar','verschoben'));

-- Der eingefrorene Monatswert muss die verschobenen Termine MITFUEHREN, sonst waere ein Freeze
-- nach der Umstellung nicht mehr nachrechenbar: das Gate braucht sie, die Quote nicht.
-- incentive_monatswerte ist derzeit leer (erster Freeze am 05.10.), der Default 0 ist also
-- nur die Absicherung fuer den Fall, dass doch schon eingefroren wurde.
ALTER TABLE incentive_monatswerte ADD COLUMN IF NOT EXISTS sr_verschoben INTEGER NOT NULL DEFAULT 0;
