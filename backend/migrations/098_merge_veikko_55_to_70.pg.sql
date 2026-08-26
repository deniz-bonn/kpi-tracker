-- Migration 098: Mitarbeiter-Dublette "Veikko-Colin Poppinga" zusammenführen (alt id=55 -> neu id=70).
-- Hergang: Veikko wurde am 21.08. versehentlich neu angelegt (id=70, trägt Rolle/Standort/Login),
-- der alte Datensatz (id=55) wurde nur DEAKTIVIERT (aktiv=false), nicht gelöscht. Deals bis 21.08.
-- (16 Juli + 16 August) hängen weiter an id=55 -> im Filter unsichtbar (Listen zeigen nur aktive MA).
-- Fix: alle Referenzen 55 -> 70 umhängen, id=55 deaktiviert + Vermerk behalten (Historie), Provisions-
-- Positionen (BS-Opener-Fix 125 €/Call, alle in OFFENEN, nicht eingefrorenen BS-Zeiträumen) mitziehen.
-- Idempotent + no-op-sicher: jede Anweisung greift NUR, wenn id=55 UND id=70 beide "Veikko-Colin
-- Poppinga" sind (Schutz für Dev-/Seed-DBs, in denen 55/70 andere Personen sein können). Nach dem
-- Lauf trägt id=55 den Vermerk im Namen -> ein erneuter Lauf findet nichts mehr.

-- deals_nk: opener / setter / closer
UPDATE deals_nk SET opener_id = 70
 WHERE opener_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE);

UPDATE deals_nk SET setter_id = 70
 WHERE setter_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE);

UPDATE deals_nk SET closer_id = 70
 WHERE closer_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE);

-- deals_bk / deals_vl (KAM) + deals_vl.neuer_ap_intern (TEXT-Referenz)
UPDATE deals_bk SET kam_id = 70
 WHERE kam_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE);

UPDATE deals_vl SET kam_id = 70
 WHERE kam_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE);

UPDATE deals_vl SET neuer_ap_intern = '70'
 WHERE neuer_ap_intern = '55'
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE);

-- activity_logs: nur umhängen, wo kein UNIQUE(employee_id, datum)-Konflikt mit id=70 entsteht
UPDATE activity_logs SET employee_id = 70
 WHERE employee_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE)
   AND NOT EXISTS (SELECT 1 FROM activity_logs b WHERE b.employee_id = 70 AND b.datum = activity_logs.datum);

-- users.employee_id: nur umhängen, wenn id=70 noch keinen User hat (kein UNIQUE-Konflikt)
UPDATE users SET employee_id = 70
 WHERE employee_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE)
   AND NOT EXISTS (SELECT 1 FROM users u2 WHERE u2.employee_id = 70);

-- Provisions-Buchungen: employee_id 55 -> 70 und die im idem_key eingebettete Empfänger-ID (…:55 -> …:70)
-- mitziehen, damit die Append-only-Idempotenz erhalten bleibt (ein späterer Engine-Lauf findet die Zeile
-- über employee_id, nicht über den idem_key -> kein Doppel-Fix; der Key wird trotzdem korrekt gehalten).
-- Alle betroffenen BS-Zeiträume sind OFFEN und nicht eingefroren -> Beträge/Perioden bleiben unverändert,
-- nur der Empfänger wird korrigiert. Kein Storno/Nachtrag nötig.
UPDATE provision_buchungen
   SET employee_id = 70,
       idem_key = CASE WHEN idem_key LIKE '%:55' THEN regexp_replace(idem_key, ':55$', ':70') ELSE idem_key END
 WHERE employee_id = 55
   AND EXISTS (SELECT 1 FROM employees WHERE id = 55 AND name = 'Veikko-Colin Poppinga')
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE);

-- Alt-Datensatz behalten (Historie), aber deaktiviert + Vermerk. Guard name= erzwingt Idempotenz.
UPDATE employees
   SET aktiv = FALSE, show_in_kpi = 0,
       name = name || ' (Duplikat – zusammengeführt zu #70)'
 WHERE id = 55
   AND name = 'Veikko-Colin Poppinga'
   AND EXISTS (SELECT 1 FROM employees WHERE id = 70 AND name = 'Veikko-Colin Poppinga' AND aktiv = TRUE);
