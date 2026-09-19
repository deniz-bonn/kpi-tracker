-- Migration 113: dritter VL-Ausgang "Umgestellt" (Dauer-RaaS) + Verknuepfung zum BK-Upsell-Deal.
--
-- FACHLICH: Ein Vertrag, der statt der Verlaengerung auf den Dauer-Recruiting-Service (Dauer-RaaS,
-- 12 Monate Jahresbetreuung) umgestellt wird, ist KEINE Verlaengerung — weder gewonnen noch
-- gekuendigt. Er ist ein dritter Ausgang. Bisher bildete Migration 102 das als Checkbox AN einem
-- gewonnenen Deal ab; das war ein Provisorium und wird hiermit abgeloest: die Umstellung ist eine
-- Alternative ZUR Verlaengerung, kein Zusatz-Haken AN einer.
--
-- Fuer Churn und Bestandserhalt zaehlt "Umgestellt" wie verlaengert (der Kunde ist da, nur
-- hoeherwertig):  Churn = Kuendigungen / (Gewonnen + Umgestellt + Verloren).
-- Fuer den VL-AE zaehlt er NICHT: sein Wert lebt im verknuepften BK-Upsell-Deal. Beides zu zaehlen
-- waere dasselbe Geld in zwei Spalten.
--
-- Der Umsatz entsteht als regulaerer deals_bk-Deal (herkunft='vl_umstellung', Spalte aus
-- Migration 111). Damit flieszt er als Bestandskunden-Umsatz in Monatsuebersicht und Auswertung,
-- und die 3 % kommen aus dem BESTEHENDEN Upsell-Buchungstyp des BK-Kreises — kein neuer Satz,
-- keine neue Config-Spalte, kein neuer Export-Typ. Die 2 % Verlaengerungsprovision entfallen
-- fuer den Deal von selbst: positionBk() lehnt jeden Deal mit status != 'Gewonnen' ab, und
-- provisionSyncBk bucht zustandsbasiert die Differenz — der Storno passiert ohne Sondercode.
--
-- Nur der CHECK aendert sich; kein Bestand wird angefasst. Im Prod-Stand vom 18.09.2026 traegt
-- keine einzige der 1.001 deals_vl-Zeilen die 102er-Felder, es gibt also nichts umzutragen.
ALTER TABLE deals_vl DROP CONSTRAINT IF EXISTS deals_vl_status_check;
ALTER TABLE deals_vl ADD CONSTRAINT deals_vl_status_check
  CHECK (status IN ('Offen', 'Gewonnen', 'Verloren', 'Umgestellt'));

-- Verknuepfung zum BK-Deal, der den Dauer-RaaS-Umsatz traegt. "Referenz statt Kopie": der Betrag
-- steht NUR dort, diese Spalte haelt allein den Zeiger. ON DELETE SET NULL, weil ein geloeschter
-- BK-Deal den VL-Deal nicht mitreiszen darf — die Umstellung bleibt als Ausgang bestehen, nur
-- ohne Umsatz, und genau das soll die Oberflaeche dann auch anzeigen koennen.
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS umstellung_deal_bk_id INTEGER
  REFERENCES deals_bk(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_vl_umstellung_deal ON deals_vl (umstellung_deal_bk_id)
  WHERE umstellung_deal_bk_id IS NOT NULL;

-- ── Wording: der Jahres-Typ im Willkommensmeetings-Bereich heisst ebenfalls Dauer-RaaS ──────
-- Der Wert steht als Text in den Daten, nicht nur in einer Anzeigeliste. Ohne diese Zeile fiele
-- ein bereits erfasstes Meeting aus JAHRES_TYPEN und damit still aus der Haupt-KPI des Bereichs.
-- Im Prod-Stand vom 18.09.2026 betrifft das genau eine Zeile.
UPDATE willkommensmeetings SET angebots_typ = 'Dauer-RaaS' WHERE angebots_typ = 'Jahresbetreuung';
