-- Migration 118: Live-Board — Einstellungen je Person.
--   ausblenden  : Person erscheint in KEINER Personenliste des Boards (Ranglisten, Duelle,
--                 Tagesziele). Ihre Deals zaehlen weiter in die Teamzahlen des Standorts.
--   arbeitstage : Wochentage, an denen die Person getrackt wird ('1,2' = Mo, Di; ISO 1=Mo..5=Fr).
--                 NULL = Mo–Fr. Wirkt auf die Tagesziele (an anderen Tagen nicht in der Liste)
--                 und auf den Soll-Stand des Monats (nur die eigenen Arbeitstage zaehlen).
CREATE TABLE IF NOT EXISTS board_personen (
  employee_id  INTEGER PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  ausblenden   BOOLEAN NOT NULL DEFAULT FALSE,
  arbeitstage  TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   INTEGER
);

-- Vorgabe Deniz 04.11.2026. Ueber die ID (der Mitarbeitername "Marcel Muciano" weicht vom
-- Benutzerkonto "Murciano" ab), abgesichert gegen eine fremde ID durch Name + Standort.
-- Danach nur noch ueber die Oberflaeche (Menue Live-Board) pflegen.
INSERT INTO board_personen (employee_id, ausblenden)
  SELECT id, TRUE FROM employees WHERE standort='Bonn' AND ((id=2 AND name LIKE 'Deniz Akpinar%') OR (id=24 AND name LIKE 'Marcel Mu%ciano%'))
ON CONFLICT (employee_id) DO NOTHING;
INSERT INTO board_personen (employee_id, arbeitstage)
  SELECT id, '1,2' FROM employees WHERE standort='Bonn' AND id=82 AND name LIKE 'Fode%'
ON CONFLICT (employee_id) DO NOTHING;
