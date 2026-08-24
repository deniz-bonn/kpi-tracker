-- Migration 096: Neue Vertriebsrolle 'Account Manager' (eine Stufe unter dem KAM/Key Account Manager,
-- im Bestandskundenbereich). Postgres: CHECK-Constraint austauschen.
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_rolle_check;
ALTER TABLE employees ADD CONSTRAINT employees_rolle_check
  CHECK (rolle IN ('KAM', 'NKV-Closer', 'Opener', 'Setter', 'Multi', 'Closer-KAM', 'Account Manager'));
