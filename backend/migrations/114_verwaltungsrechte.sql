-- Migration 114: Delegierbare Verwaltungsrechte — mitarbeiter_verwaltung / benutzer_verwaltung.
--
-- Die Rechte selbst brauchen kein Schema (feature_flags / feature_flag_users gibt es). Diese
-- Migration belegt nur die Rollen-Haken so vor, dass niemand mit dem Deploy Zugang verliert
-- (Entscheidung 30.10.2026, "Bestand erhalten"):
--   mitarbeiter_verwaltung: admin, backoffice, vertriebsleitung — die Rollen, die die Seite
--                           /mitarbeiter bisher ueber App.jsx (adminAndBo) sahen
--   benutzer_verwaltung:    admin — bisher requireRole('admin') auf /api/admin/users
-- Superadmin braucht keinen Eintrag (implizit). Danach in der Zugriffssteuerung abwaehlbar.
-- Die Varianten "<recht>_eigener_standort" sind reine Einzelfreigaben (keine Rollen-Haken).
INSERT INTO feature_flags (feature, role)
SELECT 'mitarbeiter_verwaltung', 'admin'
 WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature = 'mitarbeiter_verwaltung' AND role = 'admin');
INSERT INTO feature_flags (feature, role)
SELECT 'mitarbeiter_verwaltung', 'backoffice'
 WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature = 'mitarbeiter_verwaltung' AND role = 'backoffice');
INSERT INTO feature_flags (feature, role)
SELECT 'mitarbeiter_verwaltung', 'vertriebsleitung'
 WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature = 'mitarbeiter_verwaltung' AND role = 'vertriebsleitung');
INSERT INTO feature_flags (feature, role)
SELECT 'benutzer_verwaltung', 'admin'
 WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE feature = 'benutzer_verwaltung' AND role = 'admin');
