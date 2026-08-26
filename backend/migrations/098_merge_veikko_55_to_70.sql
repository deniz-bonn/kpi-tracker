-- Migration 098 (SQLite): Mitarbeiter-Dublette "Veikko-Colin Poppinga" zusammenführen (alt id=55 -> neu id=70).
-- Siehe 098_merge_veikko_55_to_70.pg.sql für die ausführliche Begründung. Identische Logik, SQLite-Dialekt
-- (aktiv INTEGER 0/1; idem_key-Rewrite via substr statt regexp_replace). Idempotent + no-op-sicher über
-- den Namens-Guard: greift nur, wenn id=55 UND id=70 beide "Veikko-Colin Poppinga" (id=70 aktiv) sind.

-- deals_nk: opener / setter / closer
UPDATE deals_nk SET opener_id = 70
 WHERE opener_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1);

UPDATE deals_nk SET setter_id = 70
 WHERE setter_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1);

UPDATE deals_nk SET closer_id = 70
 WHERE closer_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1);

-- deals_bk / deals_vl (KAM) + deals_vl.neuer_ap_intern (TEXT-Referenz)
UPDATE deals_bk SET kam_id = 70
 WHERE kam_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1);

UPDATE deals_vl SET kam_id = 70
 WHERE kam_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1);

UPDATE deals_vl SET neuer_ap_intern = '70'
 WHERE neuer_ap_intern = '55'
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1);

-- activity_logs: nur umhängen, wo kein UNIQUE(employee_id, datum)-Konflikt mit id=70 entsteht
UPDATE activity_logs SET employee_id = 70
 WHERE employee_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1)
   AND NOT EXISTS (SELECT 1 FROM activity_logs b WHERE b.employee_id = 70 AND b.datum = activity_logs.datum);

-- users.employee_id: nur umhängen, wenn id=70 noch keinen User hat (kein UNIQUE-Konflikt)
UPDATE users SET employee_id = 70
 WHERE employee_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1)
   AND NOT EXISTS (SELECT 1 FROM users u2 WHERE u2.employee_id = 70);

-- Provisions-Buchungen: employee_id 55 -> 70 + idem_key-Suffix (…:55 -> …:70). Alle BS-Zeiträume offen/
-- nicht eingefroren -> Beträge/Perioden unverändert, nur Empfänger korrigiert.
UPDATE provision_buchungen
   SET employee_id = 70,
       idem_key = CASE WHEN idem_key LIKE '%:55' THEN substr(idem_key, 1, length(idem_key) - 3) || ':70' ELSE idem_key END
 WHERE employee_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1);

-- Alt-Datensatz behalten (Historie), aber deaktiviert + Vermerk. Guard name= erzwingt Idempotenz.
UPDATE employees
   SET aktiv = 0, show_in_kpi = 0,
       name = name || ' (Duplikat – zusammengeführt zu #70)'
 WHERE id = 55
   AND name = 'Veikko-Colin Poppinga'
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = 1);
