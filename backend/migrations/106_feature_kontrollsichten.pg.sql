-- Migration 106: Einheitliches Berechtigungs-Muster fuer "Mein Dashboard" und "Meine Provision".
--
-- Je Bereich zwei Berechtigungen:
--   Nutzer-Sicht (eigene Daten)      Kontroll-Sicht (Team-Ueberblick + "Aus der Sicht von")
--   mein_dashboard                   mein_dashboard_kontrolle
--   meine_provision                  meine_provision_kontrolle
--
-- Rein additiv in der Wirkung: niemand verliert Zugang.

-- ── 1) mein_dashboard_team -> mein_dashboard_kontrolle ──────────────────────
-- Das Flag hiess in Migration 105 noch "_team". Einheitliches Muster -> umbenennen.
-- Bestehende Freischaltungen (Rollen UND Einzelnutzer) wandern mit.
UPDATE feature_flags       SET feature = 'mein_dashboard_kontrolle' WHERE feature = 'mein_dashboard_team';
UPDATE feature_flag_users  SET feature = 'mein_dashboard_kontrolle' WHERE feature = 'mein_dashboard_team';

-- ── 2) meine_provision aus 'provisionen' herausloesen ───────────────────────
-- Bisher gaben 'provisionen' BEIDE Dinge frei: die eigene Provision (/meine-provision) und den
-- Admin-Bereich (/provisionen). Das wird getrennt. 'provisionen' bleibt das Admin-Flag,
-- 'meine_provision' ist neu fuer die eigene Sicht.
--
-- ZUGANGSERHALT: Jede bestehende Freischaltung auf 'provisionen' wird auf 'meine_provision'
-- gespiegelt — Rollen wie Einzelnutzer. Wer heute seine Provision sieht, sieht sie morgen auch.
INSERT INTO feature_flags (feature, role)
SELECT 'meine_provision', ff.role
  FROM feature_flags ff
 WHERE ff.feature = 'provisionen'
   AND NOT EXISTS (SELECT 1 FROM feature_flags x
                    WHERE x.feature = 'meine_provision' AND x.role = ff.role);

INSERT INTO feature_flag_users (feature, user_id, created_by)
SELECT 'meine_provision', ffu.user_id, ffu.created_by
  FROM feature_flag_users ffu
 WHERE ffu.feature = 'provisionen'
   AND NOT EXISTS (SELECT 1 FROM feature_flag_users x
                    WHERE x.feature = 'meine_provision' AND x.user_id = ffu.user_id);

-- ── 3) Kontroll-Sicht der Provision ─────────────────────────────────────────
-- Default wie beim Dashboard: Vertriebsleitung. Das ist keine neue Offenlegung — ueber
-- /provisionen/admin/overview (requireRole admin|vertriebsleitung) sieht die Vertriebsleitung
-- die Provisionen ohnehin. Admin bewusst nicht vorbelegt; in der Zugriffssteuerung nachruestbar.
INSERT INTO feature_flags (feature, role)
SELECT 'meine_provision_kontrolle', 'vertriebsleitung'
 WHERE NOT EXISTS (SELECT 1 FROM feature_flags
                    WHERE feature = 'meine_provision_kontrolle' AND role = 'vertriebsleitung');
