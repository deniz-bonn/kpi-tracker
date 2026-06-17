ALTER TABLE employees ADD COLUMN IF NOT EXISTS show_in_kpi INTEGER NOT NULL DEFAULT 1;
UPDATE employees SET show_in_kpi = 0 WHERE name IN ('Deniz Akpinar', 'Marcel Murciano', 'Jann Kaporse');
