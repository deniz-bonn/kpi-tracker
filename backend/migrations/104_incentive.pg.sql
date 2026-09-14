-- Migration 104: Team-Incentive September/Oktober 2026 (Reisen Warschau & München).
--
-- Zwei Tabellen, alles andere kommt aus bestehenden Quellen (deals_nk fuer den Auftragseingang,
-- termine fuer die Show-Rate, kpis-Logik fuer das Teamziel).
--
-- WARUM EINE EIGENE ZIEL-TABELLE: Die Messbasis je Person (Opener / Setter / Closer) ist aus den
-- Stammdaten NICHT ableitbar — alle acht Incentive-Personen tragen in employees.rolle den Wert
-- 'Multi'. Sie muss deshalb explizit konfiguriert werden. Verknuepft wird ueber employee_id, nie
-- ueber den Namen: 'Markus Bauer ' steht mit nachgestelltem Leerzeichen in employees.

CREATE TABLE IF NOT EXISTS incentive_ziele (
  id                SERIAL PRIMARY KEY,
  employee_id       INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  zeitraum_von      TEXT    NOT NULL,          -- 'YYYY-MM', inklusiv
  zeitraum_bis      TEXT    NOT NULL,          -- 'YYYY-MM', inklusiv
  -- Woran der Auftragseingang gemessen wird:
  --   'opener' -> deals_nk.opener_id (Kette ab seinem Setting)
  --   'setter' -> deals_nk.setter_id (Kette ab seiner Beratung)
  --   'closer' -> deals_nk.closer_id (eigener Neukundenumsatz)
  messbasis         TEXT    NOT NULL CHECK (messbasis IN ('opener','setter','closer')),
  -- Terminart der Show-Rate; NULL = keine Show-Rate (Closer legen keine Termine).
  -- 'closing' ist im Incentive-Dokument die "Beratung" (Sales-/Closing-Call-Kette).
  showrate_art      TEXT    CHECK (showrate_art IN ('setting','closing')),
  ziel_ae_warschau  NUMERIC(12,2),
  ziel_sr_warschau  NUMERIC(5,2),
  ziel_ae_muenchen  NUMERIC(12,2),
  ziel_sr_muenchen  NUMERIC(5,2),
  vorlaeufig        BOOLEAN NOT NULL DEFAULT FALSE,   -- Ziel noch nicht final (Brian, Markus)
  notiz             TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, zeitraum_von, zeitraum_bis)
);

-- Monatswerte je Person: bis zum Freeze live gerechnet, danach eingefroren.
--
-- WARUM EINFRIEREN: deriveTermine baut die Tabelle `termine` bei JEDEM Sync komplett neu und
-- loescht alles, was der Lauf nicht neu geschrieben hat (closeSync.js). Die September-Termine
-- existieren also nur, solange Close sie im Abfragefenster zurueckliefert. Die Reiseentscheidung
-- faellt aber erst im November — sie darf nicht an einem Sync-Lauf haengen.
--
-- WARUM NICHT AM 1.: Ausgaenge werden nachgetragen. Ein Freeze am Monatsersten wuerde die noch
-- offenen Termine als unbewertet festschreiben und die Show-Rate druecken. Gefroren wird deshalb
-- am 5. des Folgemonats (INCENTIVE_FREEZE_TAG, konfigurierbar).
CREATE TABLE IF NOT EXISTS incentive_monatswerte (
  id                SERIAL PRIMARY KEY,
  employee_id       INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  monat             TEXT    NOT NULL,          -- 'YYYY-MM'
  messbasis         TEXT    NOT NULL,
  showrate_art      TEXT,
  ae                NUMERIC(12,2) NOT NULL DEFAULT 0,
  sr_gelegt         INTEGER NOT NULL DEFAULT 0,
  sr_bewertet       INTEGER NOT NULL DEFAULT 0,   -- stattgefunden + nicht_stattgefunden
  sr_statt          INTEGER NOT NULL DEFAULT 0,
  eingefroren_am    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  eingefroren_von   INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- NULL = automatisch
  UNIQUE (employee_id, monat)
);
CREATE INDEX IF NOT EXISTS idx_incentive_mw_monat ON incentive_monatswerte (monat);

-- ── Seed aus Team-Incentive_Sep-Okt-2026.md (Stand 10.08.2026) ───────────────
-- Ueber TRIM(name), weil mindestens ein Datensatz ein nachgestelltes Leerzeichen traegt.
-- Fehlt eine Person, entsteht schlicht keine Zeile — die Migration bleibt gruen.
-- Tobias Boettcher bekommt bewusst KEINE Zeile: laut Dokument kein eigenes Zahlenziel
-- (Sonderregel Vertriebsleitung, laeuft ueber seine eigene Vereinbarung).
INSERT INTO incentive_ziele
  (employee_id, zeitraum_von, zeitraum_bis, messbasis, showrate_art,
   ziel_ae_warschau, ziel_sr_warschau, ziel_ae_muenchen, ziel_sr_muenchen, vorlaeufig, notiz)
SELECT e.id, '2026-09', '2026-10', v.messbasis, v.showrate_art,
       v.ae_w, v.sr_w, v.ae_m, v.sr_m, v.vorlaeufig, v.notiz
  FROM (VALUES
    ('Mikail Kotaman',  'opener', 'setting', 300000, 72, 350000, 78, FALSE, NULL),
    ('Dominik Bous',    'opener', 'setting', 260000, 72, 300000, 78, FALSE, NULL),
    ('Brian Groten',    'opener', 'setting', 370000, 72, 430000, 78, TRUE,
       'Rolle und Zielwerte werden im August geklaert — Show-Rate ggf. Beratung statt Setting.'),
    ('Andreas Buharin', 'setter', 'closing', 450000, 77, 550000, 80, FALSE, NULL),
    ('Markus Bauer',    'setter', 'closing', 300000, 77, 400000, 80, TRUE,
       'Zielwerte beruhen auf nur 5 Arbeitstagen im Juli, werden mit den August-Zahlen geprueft.'),
    ('Clemens Näkel',   'setter', 'closing', 450000, 77, 550000, 80, FALSE, NULL),
    ('Julius Kawka',    'closer', NULL,      600000, NULL, 700000, NULL, FALSE,
       'Closer legen keine Termine — keine Show-Rate.')
  ) AS v(name, messbasis, showrate_art, ae_w, sr_w, ae_m, sr_m, vorlaeufig, notiz)
  JOIN employees e ON TRIM(e.name) = v.name
 WHERE NOT EXISTS (
   SELECT 1 FROM incentive_ziele z
    WHERE z.employee_id = e.id AND z.zeitraum_von = '2026-09' AND z.zeitraum_bis = '2026-10');
