-- Migration 121: Wochenanalyse — Qualifizierung und Einwandbehandlung (Prompt v3, Vorgabe Deniz 05.11.2026).
-- Setting qualifiziert = Entscheider dabei oder Teilnahme zugesagt + deckbarer Bedarf + zeitnah.
-- Closing: Einwaende behandelt, Folgetermin trotz offener Einwaende.
-- Nachcodierung (Prompt-Wechsel): codier_auftraege.ersetzen = TRUE ueberschreibt die bestehende Codierung.
ALTER TABLE call_codings ADD COLUMN IF NOT EXISTS entscheider_nimmt_teil TEXT;          -- ja | nein | unklar | n.a.
ALTER TABLE call_codings ADD COLUMN IF NOT EXISTS bedarf_deckbar TEXT;                  -- ja | nein | unklar
ALTER TABLE call_codings ADD COLUMN IF NOT EXISTS zeitnah TEXT;                         -- ja | nein | unklar
ALTER TABLE call_codings ADD COLUMN IF NOT EXISTS einwaende_behandelt TEXT;             -- ja | nein | n.a.
ALTER TABLE call_codings ADD COLUMN IF NOT EXISTS folgetermin_trotz_einwaenden TEXT;    -- ja | nein | n.a.
ALTER TABLE codier_auftraege ADD COLUMN IF NOT EXISTS ersetzen BOOLEAN NOT NULL DEFAULT FALSE;
