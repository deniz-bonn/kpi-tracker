-- Migration 110 (SQLite): Falsch zugeordneten KAM aus der Verlaengerung VL #3244 entfernen.
--
-- Fachlicher Hintergrund: Bei VL #3244 (Helios Ventilatoren GmbH, AE 5.400 €, gewonnen 09/2026)
-- war Lukas Häfner als KAM eingetragen. Er gehoert nicht zum Bestandskundenvertrieb — bestaetigt
-- vom Bereichsverantwortlichen und durch die Daten gestuetzt: 58x Opener, 53x Setter, 0x Closer
-- im Neukundengeschaeft, und genau dieser eine Deal als KAM.
--
-- KEINE PROVISIONSWIRKUNG: Sein Mitarbeitersatz hat keine bk_gruppe, damit liefert
-- gruppeVonEmp() (utils/rollen.js) null und positionBk() lehnt mit 'rolle_nicht_berechtigt' ab.
-- Es wurde also nie etwas fuer ihn gebucht; diese Migration nimmt keine Buchung zurueck,
-- sie korrigiert nur die Zuordnung.
--
-- KEINE AE-WIRKUNG: syncAeGesamtVL bucht AE nur in eine ae_gesamt_monthly-Zeile, und fuer
-- 2026-09 existiert keine — der Monat wird live aus deals_vl gerechnet. Dass diese Migration
-- den Routen-Hook umgeht (der beim Speichern ueber die Oberflaeche liefe), bleibt hier deshalb
-- folgenlos. Bei einem Monat MIT Snapshot waere der Weg ueber die Oberflaeche zwingend.
--
-- GUARD: Nur anfassen, solange wirklich noch Lukas eingetragen ist. Wurde der Deal inzwischen
-- dem richtigen KAM zugeordnet, tut die Migration nichts — sie darf eine spaetere, bessere
-- Korrektur nicht ueberschreiben.
UPDATE deals_vl
   SET kam_id = NULL, updated_at = datetime('now')
 WHERE id = 3244
   AND kam_id IN (SELECT id FROM employees WHERE TRIM(name) = 'Lukas Häfner');
