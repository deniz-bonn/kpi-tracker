-- Migration 013: Overwrite ae_gesamt_monthly with exact values from AE Gesamt sheet
-- Source: Angebots-Tracker_fach.digital_2026.xlsx, sheet "AE Gesamt"
-- Jan-Apr: no Bonn/BS AE split in sheet (BS office not yet open), nk_bonn_ae = nk_gesamt
-- May-Jun: explicit Bonn + Braunschweig breakdown available

DELETE FROM ae_gesamt_monthly WHERE monat LIKE '2026-%';

INSERT INTO ae_gesamt_monthly (monat, nk_bonn_anz, nk_bonn_ae, nk_bs_anz, nk_bs_ae, nk_gesamt, bk_gesamt, vl_gesamt, gesamt)
VALUES ('2026-01', 19, 128700, 0, 0, 128700, 96500, 100600, 325800);

INSERT INTO ae_gesamt_monthly (monat, nk_bonn_anz, nk_bonn_ae, nk_bs_anz, nk_bs_ae, nk_gesamt, bk_gesamt, vl_gesamt, gesamt)
VALUES ('2026-02', 30, 219900, 0, 0, 219900, 184795, 225000, 629695);

INSERT INTO ae_gesamt_monthly (monat, nk_bonn_anz, nk_bonn_ae, nk_bs_anz, nk_bs_ae, nk_gesamt, bk_gesamt, vl_gesamt, gesamt)
VALUES ('2026-03', 21, 222300, 0, 0, 222300, 88070, 85600, 395970);

INSERT INTO ae_gesamt_monthly (monat, nk_bonn_anz, nk_bonn_ae, nk_bs_anz, nk_bs_ae, nk_gesamt, bk_gesamt, vl_gesamt, gesamt)
VALUES ('2026-04', 44, 477400, 0, 0, 477400, 603100, 243650, 1324150);

INSERT INTO ae_gesamt_monthly (monat, nk_bonn_anz, nk_bonn_ae, nk_bs_anz, nk_bs_ae, nk_gesamt, bk_gesamt, vl_gesamt, gesamt)
VALUES ('2026-05', 26, 285300, 32, 314100, 599400, 366500, 278250, 1244150);

INSERT INTO ae_gesamt_monthly (monat, nk_bonn_anz, nk_bonn_ae, nk_bs_anz, nk_bs_ae, nk_gesamt, bk_gesamt, vl_gesamt, gesamt)
VALUES ('2026-06', 5, 45000, 13, 144800, 189800, 59700, 157000, 406500);
