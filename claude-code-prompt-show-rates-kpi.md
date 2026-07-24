# Prompt für Claude Code — Erweiterung KPI Mitarbeiter Beta

Wir erweitern den Bereich **KPI Mitarbeiter Beta** (`/kpi-mitarbeiter-beta`, Auswertungs-Teil) um die Setting-zu-Closing-Funnel-Quoten pro Mitarbeiter. Alle Änderungen finden ausschließlich in diesem Bereich statt — `/kpi-mitarbeiter` (alt), Dashboard, NK/BK/VL-Bereiche und die KPI-Mail bleiben unangetastet.

## Hintergrund

Der Head of Sales steuert die Setter/Closer bisher primär über die Terminierungsquote. Die ist allein wenig aussagekräftig: Ein Opener kann 90 % Terminierungsquote haben, während die Termine unqualifiziert sind. Entscheidend ist die nachgelagerte Kette pro Mitarbeiter: Wie viele gelegte Settings finden statt, wie viele führen zum Beratungsgespräch (Sales Call), wie viele davon finden statt und wie viele werden geclosed. Übergeordnetes Ziel: die Show-Rates erhöhen, ohne die anderen Quoten zu verschlechtern — dafür muss auf einen Blick sichtbar sein, welcher Mitarbeiter bei welcher Quote unter Soll liegt (Grundlage für gezielte Schulung).

## 1. Neue Quoten pro Mitarbeiter (Basis: activity_logs)

Ergänze in der Auswertung (Übersicht pro Mitarbeiter im Dashboard-Tab, ggf. Setting-Tab) für jeden Mitarbeiter und die bestehende Zeitbasis (Tag/Woche/Monat, Standortfilter) folgende Quoten — unter Verwendung der verbindlichen Begriffsdefinitionen aus dem Konzept:

1. **Setting-zu-Sales-Call-Quote (gelegt):** `(beratung_vereinbart + beratung_vereinbart_direkt) / entscheider_terminiert` — wie viele der terminierten Settings eines Setters führen final zu einem vereinbarten Beratungsgespräch (gesamte Setter-Kette über Show-Rate Setting × Durchstellungsquote hinweg).
2. **Setting-zu-Sales-Call-Quote (stattgefunden):** stattgefundene Beratungen im Verhältnis zu gelegten Settings. Achtung Rollen-Schnitt: `beratungen_stattgefunden` liegt beim Closer, `entscheider_terminiert` beim Setter — pro Einzelmitarbeiter nur bei Rollen sinnvoll, die beide Blöcke pflegen (`Multi` etc.). Berechne diese Quote daher als Team-/Standort-Verhältniswert des Zeitraums und pro Mitarbeiter nur dort, wo beide Werte im eigenen activity_log vorhanden sind; sonst „–" anzeigen.
3. **Setting-zu-Closing-Quote:** analog als Verhältniswert des Zeitraums: `beratungen_direkter_close / entscheider_terminiert` (Team/Standort; pro Mitarbeiter nur bei Multi-Rollen). Keine Vermischung mit der Closing-Rate aus `deals_nk` — die bleibt wie definiert `NK gewonnen / NK Angebote`.

Die bestehenden Quoten (Show-Rate Setting 80 %, Durchstellungsquote 40 % = `beratung_vereinbart / settings_stattgefunden`, Show-Rate Closing 80 %) bleiben unverändert und werden pro Mitarbeiter neben den neuen Quoten angezeigt.

## 2. Darstellung

- In der Übersicht pro Mitarbeiter: neue Quoten-Spalten in den bestehenden Funnel-Gruppen-Headern (Entscheider / Settings / Beratungsgespräche) einordnen, mit Tooltips (Formel) und Aufnahme in die Legende.
- Ist vs. Soll farblich (bestehende Soll-Abweichungslogik in pp wiederverwenden); Soll-Werte für die neuen Quoten konfigurierbar analog zu den bestehenden Solls.
- Neben jeder Quote die Absolutwerte als `n/d` anzeigen (bestehendes Muster der Soll-Abweichungstabelle). Bei Basis < 10 im Zeitraum dezenter Hinweis „geringe Datenbasis".
- Sortierbarkeit der Mitarbeiter-Übersicht nach den Quoten-Spalten, insbesondere nach den Show-Rates.
- Show-Rate-Fokus: im Dashboard-Tab (innerhalb Beta) ein kompakter Block „Show-Rates nach Mitarbeiter" — Ranking Show-Rate Setting und Show-Rate Closing, mit Trend vs. Vorzeitraum (gleiche Zeitbasis).
- Copy-Text-Funktion und CSV-Export um die neuen Quoten erweitern (kumulierte Werte weiterhin nur bis zum Stichtag).

## 3. Vorgehen & Leitplanken

1. Erst die betroffenen Stellen analysieren (Auswertungs-Endpoints für activity_logs, Frontend-Komponenten des Beta-Bereichs) und mir einen kurzen Plan mit betroffenen Dateien nennen — dann erst umsetzen.
2. Falls Schema-Änderungen nötig werden (z. B. Soll-Werte-Konfiguration): Migrationen doppelt anlegen (`.pg.sql` + `.sql`), Boolean-Konventionen beachten.
3. Datums-Handling: `datum` im Frontend immer auf `YYYY-MM-DD` normalisieren, bevor verglichen wird.
4. Division durch Null: Quote als „–" anzeigen, nie 0 % ausweisen.
5. Fixe Monatsziele (276 SC / 740 Settings) und alle bestehenden KPI-Formeln nicht anfassen; Durchstellungsquote bleibt `beratung_vereinbart / settings_stattgefunden`.
6. Feature-Flag `kpi_beta` respektieren — keine neuen Sichtbarkeiten außerhalb des Beta-Bereichs.
