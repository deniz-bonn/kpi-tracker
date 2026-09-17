-- Migration 109: Go-Live des Abrechnungskreises "Bestandskundenvertrieb" auf August vorziehen.
--
-- Migration 108 hatte gueltig_ab='2026-09-01' gesetzt — erste Abrechnungsperiode September.
-- Fachliche Aenderung: der August soll ebenfalls sichtbar und abrechenbar sein.
--
-- WIE DER GO-LIVE WIRKT: utils/provisionen.js goLiveDatum() liest MIN(gueltig_ab) DIESES Kreises;
-- utils/provisionenBk.js vergleicht damit den gewonnen_monat des Deals (positionBk, Grund
-- 'vor_go_live'). Ein frueherer gueltig_ab oeffnet also rueckwirkend Monate — hier bewusst genau
-- EINEN: August 2026. Juli und frueher bleiben ausserhalb.
--
-- WARUM UPDATE UND KEINE ZWEITE ZEILE: Die Saetze sind unveraendert (3 % / 2 %). Eine zweite
-- Config-Zeile mit identischen Werten wuerde die Historie in den Einstellungen aufblaehen und den
-- Eindruck erwecken, zum 01.09. haette sich etwas geaendert. Richtig ist: dieselben Saetze gelten
-- ab einem frueheren Datum. Bereits gebuchte September-Zeilen bleiben unberuehrt — der Go-Live ist
-- nur eine Untergrenze fuer KUENFTIGE Berechnungen, das Ledger wird davon nicht angefasst.
--
-- NICHTS WIRD AUTOMATISCH GEBUCHT: Der BK-Kreis haengt ausdruecklich nicht in reconcileAll().
-- Der August entsteht erst, wenn jemand im Provisionsbereich den Backfill-Knopf drueckt —
-- nach Ansicht des Dry-Runs. Diese Migration macht ihn nur moeglich.
UPDATE provision_config
   SET gueltig_ab = '2026-08-01'
 WHERE kreis = 'bestandskunden'
   AND gueltig_ab = '2026-09-01'
   AND NOT EXISTS (
     SELECT 1 FROM provision_config x
      WHERE x.kreis = 'bestandskunden' AND x.gueltig_ab = '2026-08-01');
