-- Migration 072: Reparatur nach Mitarbeiter-Dedupe (071).
-- 071 hat beim Zusammenführen nicht sichergestellt, dass der kanonische Datensatz aktiv ist.
-- Folge: Julius Kawka war nicht mehr auswählbar (Mitarbeiter-Listen filtern auf aktiv).

-- Julius Kawka reaktivieren und als Multi überall auswählbar machen (Closer + Opener + Setter)
UPDATE employees SET aktiv = TRUE, rolle = 'Multi'
WHERE LOWER(TRIM(name)) = 'julius kawka' AND name NOT LIKE '%(Duplikat)%';

-- Sicherheitsnetz: Wer im aktuellen Monat Aktivität oder Deals hat, darf nicht inaktiv sein
-- (betrifft weitere mögliche Merge-Opfer, z.B. falls auch bei Sükrü der alte Datensatz inaktiv war)
UPDATE employees SET aktiv = TRUE
WHERE aktiv = FALSE
  AND name NOT LIKE '%(Duplikat)%'
  AND (
    EXISTS (SELECT 1 FROM activity_logs a WHERE a.employee_id = employees.id AND a.monat = '2026-07')
    OR EXISTS (
      SELECT 1 FROM deals_nk d
      WHERE (d.closer_id = employees.id OR d.setter_id = employees.id OR d.opener_id = employees.id)
        AND (d.monat = '2026-07' OR d.gewonnen_monat = '2026-07')
    )
  );
