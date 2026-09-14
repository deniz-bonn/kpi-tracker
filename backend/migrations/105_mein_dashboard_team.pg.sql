-- Migration 105: "Mein Dashboard" — Fremdsicht (Team-Ueberblick + "Sehen als") freischalten.
--
-- Das Feature mein_dashboard_team entscheidet, wer die Sicht ANDERER Personen oeffnen darf.
-- Superadmin hat es strukturell immer (hatFeature laesst ihn durch); per Default kommt
-- Vertriebsleitung dazu. Admin kann in der Zugriffssteuerung ergaenzt werden — bewusst NICHT
-- vorbelegt, weil der Zugriff Provisions- und Incentive-Daten fremder Personen oeffnet.
--
-- Rein additiv: ohne diese Zeile verhaelt sich alles wie bisher (strikt eigene Daten).

INSERT INTO feature_flags (feature, role)
SELECT 'mein_dashboard_team', 'vertriebsleitung'
 WHERE NOT EXISTS (
   SELECT 1 FROM feature_flags WHERE feature = 'mein_dashboard_team' AND role = 'vertriebsleitung');
