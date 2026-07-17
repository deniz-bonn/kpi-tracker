-- Migration 071: Doppelte Mitarbeiter-Datensätze zusammenführen (z.B. zweiter "Sükrü Boydas").
-- Kanonisch = pro Name (case-/whitespace-insensitiv, companyübergreifend) der Datensatz
-- mit gesetztem Standort, bei Gleichstand die kleinste (älteste) ID.
-- Alle Referenzen werden auf den kanonischen Datensatz umgehängt, Duplikate gelöscht.
CREATE TABLE _emp_dedupe_071 AS
SELECT e.id AS dup_id, r.keep_id
FROM employees e
JOIN (
  SELECT nname, id AS keep_id FROM (
    SELECT id, LOWER(TRIM(name)) AS nname,
           ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY (standort IS NULL), id) AS rn
    FROM employees
  ) x WHERE rn = 1
) r ON LOWER(TRIM(e.name)) = r.nname
WHERE e.id <> r.keep_id;

UPDATE deals_nk SET closer_id = (SELECT keep_id FROM _emp_dedupe_071 WHERE dup_id = deals_nk.closer_id) WHERE closer_id IN (SELECT dup_id FROM _emp_dedupe_071);
UPDATE deals_nk SET opener_id = (SELECT keep_id FROM _emp_dedupe_071 WHERE dup_id = deals_nk.opener_id) WHERE opener_id IN (SELECT dup_id FROM _emp_dedupe_071);
UPDATE deals_nk SET setter_id = (SELECT keep_id FROM _emp_dedupe_071 WHERE dup_id = deals_nk.setter_id) WHERE setter_id IN (SELECT dup_id FROM _emp_dedupe_071);
UPDATE deals_bk SET kam_id = (SELECT keep_id FROM _emp_dedupe_071 WHERE dup_id = deals_bk.kam_id) WHERE kam_id IN (SELECT dup_id FROM _emp_dedupe_071);
UPDATE deals_vl SET kam_id = (SELECT keep_id FROM _emp_dedupe_071 WHERE dup_id = deals_vl.kam_id) WHERE kam_id IN (SELECT dup_id FROM _emp_dedupe_071);
UPDATE users SET employee_id = (SELECT keep_id FROM _emp_dedupe_071 WHERE dup_id = users.employee_id) WHERE employee_id IN (SELECT dup_id FROM _emp_dedupe_071);
UPDATE deals_vl SET neuer_ap_intern = (SELECT CAST(keep_id AS TEXT) FROM _emp_dedupe_071 WHERE CAST(dup_id AS TEXT) = deals_vl.neuer_ap_intern) WHERE neuer_ap_intern IN (SELECT CAST(dup_id AS TEXT) FROM _emp_dedupe_071);

-- activity_logs hat UNIQUE(employee_id, datum): nur umhängen, wo kein Konflikt entsteht
UPDATE activity_logs SET employee_id = (SELECT keep_id FROM _emp_dedupe_071 WHERE dup_id = activity_logs.employee_id)
WHERE employee_id IN (SELECT dup_id FROM _emp_dedupe_071)
  AND NOT EXISTS (
    SELECT 1 FROM activity_logs b
    WHERE b.employee_id = (SELECT keep_id FROM _emp_dedupe_071 WHERE dup_id = activity_logs.employee_id)
      AND b.datum = activity_logs.datum
  );

-- Duplikate ohne verbleibende Referenzen löschen
DELETE FROM employees
WHERE id IN (SELECT dup_id FROM _emp_dedupe_071)
  AND NOT EXISTS (SELECT 1 FROM deals_nk      WHERE closer_id = employees.id OR opener_id = employees.id OR setter_id = employees.id)
  AND NOT EXISTS (SELECT 1 FROM deals_bk      WHERE kam_id = employees.id)
  AND NOT EXISTS (SELECT 1 FROM deals_vl      WHERE kam_id = employees.id)
  AND NOT EXISTS (SELECT 1 FROM activity_logs WHERE employee_id = employees.id)
  AND NOT EXISTS (SELECT 1 FROM users         WHERE employee_id = employees.id);

-- Übrig gebliebene Duplikate (Edge-Case) deaktivieren und markieren
UPDATE employees SET aktiv = 0, name = name || ' (Duplikat)'
WHERE id IN (SELECT dup_id FROM _emp_dedupe_071);

DROP TABLE _emp_dedupe_071;

-- AE-Gesamt Juli 2026 neu aus deals_nk berechnen (No-Op, falls keine Juli-Zeile existiert).
-- Hintergrund: Beim Gewonnen-Setzen wurde der AE nicht gebucht, weil der Duplikat-Closer keinen Standort hatte.
UPDATE ae_gesamt_monthly SET
  nk_bonn_ae  = COALESCE((SELECT SUM(d.ae_wert) FROM deals_nk d JOIN employees e ON e.id = d.closer_id WHERE d.status = 'Gewonnen' AND d.gewonnen_monat = '2026-07' AND e.standort = 'Bonn'), 0),
  nk_bonn_anz = COALESCE((SELECT COUNT(*)       FROM deals_nk d JOIN employees e ON e.id = d.closer_id WHERE d.status = 'Gewonnen' AND d.gewonnen_monat = '2026-07' AND e.standort = 'Bonn'), 0),
  nk_bs_ae    = COALESCE((SELECT SUM(d.ae_wert) FROM deals_nk d JOIN employees e ON e.id = d.closer_id WHERE d.status = 'Gewonnen' AND d.gewonnen_monat = '2026-07' AND e.standort = 'Braunschweig'), 0),
  nk_bs_anz   = COALESCE((SELECT COUNT(*)       FROM deals_nk d JOIN employees e ON e.id = d.closer_id WHERE d.status = 'Gewonnen' AND d.gewonnen_monat = '2026-07' AND e.standort = 'Braunschweig'), 0),
  nk_at_ae    = COALESCE((SELECT SUM(d.ae_wert) FROM deals_nk d JOIN employees e ON e.id = d.closer_id WHERE d.status = 'Gewonnen' AND d.gewonnen_monat = '2026-07' AND e.standort = 'Österreich'), 0),
  nk_at_anz   = COALESCE((SELECT COUNT(*)       FROM deals_nk d JOIN employees e ON e.id = d.closer_id WHERE d.status = 'Gewonnen' AND d.gewonnen_monat = '2026-07' AND e.standort = 'Österreich'), 0),
  nk_ch_ae    = COALESCE((SELECT SUM(d.ae_wert) FROM deals_nk d JOIN employees e ON e.id = d.closer_id WHERE d.status = 'Gewonnen' AND d.gewonnen_monat = '2026-07' AND e.standort = 'Schweiz'), 0),
  nk_ch_anz   = COALESCE((SELECT COUNT(*)       FROM deals_nk d JOIN employees e ON e.id = d.closer_id WHERE d.status = 'Gewonnen' AND d.gewonnen_monat = '2026-07' AND e.standort = 'Schweiz'), 0),
  updated_at  = datetime('now')
WHERE monat = '2026-07';

UPDATE ae_gesamt_monthly SET
  nk_gesamt  = COALESCE(nk_bonn_ae,0) + COALESCE(nk_bs_ae,0) + COALESCE(nk_at_ae,0) + COALESCE(nk_ch_ae,0),
  gesamt     = COALESCE(nk_bonn_ae,0) + COALESCE(nk_bs_ae,0) + COALESCE(nk_at_ae,0) + COALESCE(nk_ch_ae,0) + COALESCE(bk_gesamt,0) + COALESCE(vl_gesamt,0),
  updated_at = datetime('now')
WHERE monat = '2026-07';
