-- Migration 070: Fehlerhafte negative Verlängerungs-Nummern bereinigen (z.B. -2)
UPDATE deals_vl SET wie_vielt_verlaengerung = NULL WHERE wie_vielt_verlaengerung < 1;
