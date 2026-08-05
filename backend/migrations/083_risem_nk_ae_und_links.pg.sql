-- Migration 083: Risem NK Juni/Juli -- ae_wert bei gewonnenen Import-Deals + Close-Links
-- Schritt 1a: ae_wert (CHF) fuer 73 gewonnene Deals setzen. Nur Deals mit ae_wert IS NULL
--   UND einem [imp:excel_risem...]-Marker -- damit bleiben ueber die UI gepflegte Deals
--   unberuehrt (z.B. Huerlimann Holzbau AG, im August ueber die UI gewonnen).
-- Schritt 1b: Close-Link an den Kommentar anhaengen (Format " · Close: <URL>").
--   Idempotent: nur wenn app.close.com noch nicht im Kommentar steht. Bestehende
--   Inhalte inkl. [orig:...] und [imp:...] bleiben unveraendert.
-- Hintergrund: In der Excel-Quelle stand in der Zelle nur der Anzeigetext "Link",
--   die URL steckte im Hyperlink-Objekt -- daher fehlte sie beim Erstimport.
-- Kein Schreiben in ae_gesamt_monthly.

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Stefan Züst holzboot.ch'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_2DPB03UHTcqcHSLSkor6Hx4KsY0N3zYOslwSq99cILL/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Stefan Züst holzboot.ch'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Musegg Immobilien AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_GDnt4gcKjMwWUkWhEWEk9F7c96Wt2QVa2qQXgm20AMs/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Musegg Immobilien AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 16000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Axova AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_oJ86DBtg8GsbBOrIEM4XV1vJJmkPzd4NYBgFOUgWgdL/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Axova AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Valbag AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_P1Blt65LlQ2xnLf4p88dgi3T05scKjdxu9lt84EH5iW/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Valbag AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'physiopuma ag'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_31hDoRNutZDqieskrRzhtRKowUv5p37ZFoCz2wRT4gz/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'physiopuma ag'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_GDNEIdR86EEgJxXy26sYsh3QJmdC7WQW5hH3BBEzPFl/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Bütikofer Gebäudetechnik AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 7000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Titlis Sport AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_VZ4nRMrQ452TWhHkWvfVBPErerG0hFsEMSwqIAgPg3b/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Titlis Sport AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Markus Schmid AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_lh5aft17D2khx429xa8mubETeX6Fp2rESwFFoDdR488/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Markus Schmid AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_Quc6dG7WYJxHeeCSXiZth2W6vkDcTLjFarqS0BdcrMX/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Esther Hartmann GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_wauAmYcmdZGi1ipz6jElUcUlXMF1awhqzIMSpetmvel/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Stiftung MitMänsch Oberwallis'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Liesch Ingenieure AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_0NajtcJAp8eH28IrRxl0KcEn7GeSAfFGmrHtRdrnj7d/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Liesch Ingenieure AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Physio Lifestyle'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_YXgKJtYaqGa5F8weVHTIHI1M4MOGA5mZmL6KFLzLQN0/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Physio Lifestyle'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_ybOVQSerWUtRzMqrJjHik7NP6o13y3opb4Zuh8xr3nT/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'VitaFutura AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Walter Bochsler AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_BT8Xt8gpLsUo0lJs0pHjNM0RHPqZotz4uiKjFLz1WnC/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Walter Bochsler AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Ärztezentrum Stäfa'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_ScSAzYfOwGBYyStLSQVYfEG4qMdP0P3y6JWoK7H9khw/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Ärztezentrum Stäfa'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_GuQMICdeXJCwawvvEKa3d1lC7nUgxjjmdhIaaVvu6Iq/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Fanzun AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Praxis Calandra Physiotherapie & Naturheilkunde'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_xuzGDyyo7svTgLgH5cFcCJSMY9tNoDOLyUcrt8c7WO1/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Praxis Calandra Physiotherapie & Naturheilkunde'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_c4JSNbxCiT49NpOSc7BjF7psmnuhdROLr0RhWGwDWXE/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Karl Rölli Holzbau, Bedachung & Spenglerei AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_2M1FBx6huJ6FwiFCOoMllABd9CUCd5R6ubN5tEeGLu7/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Swiss Physio Partner AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Physiotherapie Recherswil GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_JxbMyu3hXggr9RCGqq5G9oUO17wMkQ7at0QPOZmqZz8/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Physiotherapie Recherswil GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_kOhSmXuWRHO1e2YMumyFqITfYfj7cbR9t1BX5EM7ZJb/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Furrer Schreinerei + Küchenbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'AsFam beider Basel gmbh'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_mvLlFQBz8dubWUXrs5GlocefV9JGPwLqVwCtaAVjweW/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'AsFam beider Basel gmbh'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Reha Zentral GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_8hogYwAIlG4iuF4ydP60XdOqYJInNrdvZgD1Cwr2yH1/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Reha Zentral GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Martin Ruckli AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_MOqePoFxRnFPJCvCQs9Ta4DH8EaZY23YPoKswdzDP4i/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Martin Ruckli AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_vKWfoBobV0ytOLvToXjUA3CBqN7m2JbJN3qreHkjkpF/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Haus im Ruthen'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_JGbZGZIGsHiuYeK2803d8cebArFdsCLjKr8I2oDaRA9/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Oschwald Platten AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Hasler Limacher Architekten GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_gxIlFzDaUA5rDHQfBnLMPcU61WKozOUGhd80exAYP7j/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Hasler Limacher Architekten GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 7000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'LP Ingenieure AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_c1oy4fKFcsvoB8HYwpGwqm2PhDgy0VCyRE3zXAjSK5E/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'LP Ingenieure AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Gauss & Merz AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_kHPD7VKv7uJIHB3eBPt4sKnkaF6xJpmInSRArF96BK5/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Gauss & Merz AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_4LWN0GalfOx3atEMen2daI5jW8bj65m5MVtD1f5GuDx/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Zindel + Co. AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_244C9WNTYbYyeKqfHR7yfgcB5Y4hwHKRkNkLz1neXC1/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Merz AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_76PAPah9twvz9hNDgzkMNHLHCEVS85x0JMKHjGNQ35D/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'HEINI Conditorei AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_9NJUmwhiqyvVt1cH96EglzB3LzUUmSR5O7YDXR8a0Q9/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Alters- und Pflegeheim Sägematt'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_CStGhuuG8veSimepJ5K74POR4H0aobQSuahTWrIliLw/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Rehacenter Physiofit AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'MBG Verwaltungs AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_aRfW9v1wLDqoqHin2bKmePsP9t05mDwH9UaeZe6oli4/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'MBG Verwaltungs AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Villiger Arnosti Gartenbau AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_OGRZ5owcyg8kG6704YrPkm3iBCU7UxywC47cdXSplnP/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Villiger Arnosti Gartenbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'AZ systems AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_QmwbmjTFRitQ830GpPaHfzuXoPKhxGmawxe99SnPBw6/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'AZ systems AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'J. Schumacher AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_mwm4WtFBPJnZZxiYTwtDO4MLQ3ePWQ12plglwxjT9LY/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'J. Schumacher AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_fcHanr5I24pP0NdPIpun6g5HAolEH8CmWcEm7tUQNuE/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'BrunnerFelix AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Raimann Holzbau AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_CjRFxSd53WsteEcNgUWZxuzZClB3mJxe8QyJZh9Eenm/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Raimann Holzbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_RfVUEvHm2RQaDuVbLC0pyGMdmeorDapFG6cOMyTlIk4/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'A. Ruoff AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_FYYd8zO80Y84X7HOv9tuYflDCYbWBGiWjDsNBl0sJTm/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'pfistertrans ag'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'GfC Provivatis AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_PCrDlGFButFDIN0tl5TAO0Ojgqv9QhDDYOYTbtvPGq9/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'GfC Provivatis AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_mGHoFoZVsktuVmseZv6SjzRLwoGgAhJqkg44eTLDYni/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Tocafix AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Molkerei Lanz AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_OvYfYQ1p3vjBGesSPiRhJVFPD3SUef57ZDZKO4LLhz5/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Molkerei Lanz AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'NATURA Gartenbau AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_Bgw7ExNLzxgJ9axbe75c3ndKMFzXEvIXaXGsRK42bGp/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'NATURA Gartenbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_CQTBHdUK2JTxsL2eSsaBn92nt4NbOBAOe94iCNqraba/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Heim AG Heizsysteme'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_y8Tvqkg7Md7nfVHWFcwTtKCaib2dq6J5OiY5Ed6YTTR/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'HS Kälte Wärme Klima GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Thomet Partner AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_iXA8SoLE7Xj0PXyQIFakDvWTtG4OvvqIpmohH5GznqJ/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Thomet Partner AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Elektro Iten-Steiner AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_heeiZd8QP2A7RjOwminE9S74MEYYH5UeP6AVQvqtRGq/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Elektro Iten-Steiner AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Schmidlin Holzbau AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_vdkkHujTUv986Ce4yk0WgTe8hzXtBARcw7NceBkFNB2/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Schmidlin Holzbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_FKFAgf94xmPRJr0WQOYF5nFqpaXVohshfYeakAQhppx/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Bernauer AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'eyeBq engineering & consulting AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_gXpqhMBR7QkJMHEKXGAN42NDxUDGy1rzqv3CiRChjVh/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'eyeBq engineering & consulting AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Infranext AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_icdIHhExm2wbTHFM2IretmoQ3hdKazTCpgT2yi5j9z8/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Infranext AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_sTPLGvhOvxaVuNax30rdEKGLDyYhSxCqLD3kUpsjl11/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Leutwyler Kühlanlagen AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_roSc6syIyjrrfKov9yRh4ERHqObdlHT4i3fifl5Ahb8/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Top-Tec Haus-Technik GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'METTLER PRADER AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_jHO00SCxiAj2Sf7E2GjhwrgzIzmqDBljkpIMqweVZTx/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'METTLER PRADER AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_bMz0DiYLC8eOramIrJtxWdes4KZAKLsbsiU6viiBC1h/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Holzbau Niederberger AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_aNFwGlblu0SYPGyDOxj3g7GEUYpmInREPNNXFhvSg6m/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Hugo Leutenegger AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_AATzZiXW4aQllOlizbkKBA5fbrxPxLijKDbASD8ThnV/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Vermflex GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 7000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Rossel Bedachungen+ Holzbau AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_92oz9QZ9mVl4VchYhddIffwsbXU4MgY4bZGJhr9Yt3f/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Rossel Bedachungen+ Holzbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'hebHolz AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_hfq5TCqo68J62P6pKOMQaOZX3B9mY96nOOsC4QVszNy/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'hebHolz AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'M B Metallbau AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_FQU0qmL6bFLrKArYGG6sMGUBqSoYrS34MHwhuhWdgKM/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'M B Metallbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Zentrum Guggerbach Davos'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_cAkzJtUHrV3xkg5s2Bm25YmG4wCVnq97z4Qm1eml7eg/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Zentrum Guggerbach Davos'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Stiftung Aarvital'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_QkXwROJnAS3cZtZQKZJk0NjjvfqxfC4YSdos4ugWiMk/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Stiftung Aarvital'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_8SmP5Ocuqr8I1bzVyXLgLDOiORlXjnGmaTW2HniPfGV/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Hürlimann Holzbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'MiMaTi GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_6cMUWTRUOpisKEah8zIrJZK3GYjTB75ZZnXSMLO1Ugg/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'MiMaTi GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_9lMEMSdnqj8bLdn5A8f5HtgxpxN6XplOXdX3IUnBmjx/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Cäsar Garten GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_DRDPhDGYBzID0yGz2kIGBKCpAFVZKGDdktpkSyb2TuX/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Sterki Bau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_trriEqpZ8MZLwSli8OAiai5TxJY9U4sfrT5VOUBsp5k/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Büsser AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_HxtmRRTvQzxwHQveXErPatFNWcZnN6UZryB2DLp9CH7/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Augenkontakt AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Bitzer Sanitär AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_94pM6ZatqOaA73kV660bgAz1vuPUpr78NKRaIjfNxxg/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Bitzer Sanitär AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_l71ifpxPs3y8nmCjd7iVreMeWIT7CZtfGde8jdpEJjK/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Physiotherapie Praxis Bücheli Inhaber Salic'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Dr.Meyer Immobilien AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_jpyLnb0z1X9r0srAzYNvaUR7MIzfXXlrDkF9BglWHzn/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Dr.Meyer Immobilien AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_E5rrMMlmEq13A1hhi0uHkU85wPnAojY7kgpIzv7pMFH/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'dsp Ingenieure + Planer AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_H5JzFon2h7PXfqLBAd9YpEgj8wpMt6wMiwEUkWCHHXn/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Karl Bucher AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Gesundheitszentrum Walchwil GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_a67EcScqrswzElo0xhTabgxom2XcwaloHWv4zYSW1TD/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Gesundheitszentrum Walchwil GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_ndVt5DRe7blvqkAlvOjCKt1ywDrWqz0RUgx27nA7gV7/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-06' AND kunde = 'Helvetic Health GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_gZBUTPd2d9ixWSpHgDEIEGbAwlD11a68Oi08FqmiC8T/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Holzwespi AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_yYmYvkqEOYfD68nBLNQDh7mtS9mmm61WI01eYbCJ5vT/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Elektro Annen AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_rLZtBrBCQWVz9WgXjKLxeptDrWfIeOCUvYM06L1nlm1/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Clinica Medicus Naturalis G. Ferramosca GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_4wtT81RlAOe8gXhXjXTUpEr8uBRGUEVrTQgJAo7jG9N/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Muff Gartenbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_yPAU0acX9DicWM9MkXTgQcvejIgnZIK5RSC4nDgIejW/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'EgoKiefer AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Therapiezentrum Kandertal GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_Lby0GTOc76aTNEZpT9Q0XHqpfGlmY9EJkOQW6k5ADTP/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Therapiezentrum Kandertal GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_PfMPuVCLu9spclh3Nj2EREtQrYelpKJOPbhkCNuuV0s/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Stiftung Lebensart'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_mVc1PJLJQZxl13nyQMTdy4dJmh2lP7KVBt2DkF9utHl/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Stadelmann Stutz AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_0qX8sUDoFjx31F1c0ZNQQnYPwr3MaDFFm89yKp8aT2H/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'ZURICH, Generalagentur Vincenzo Centolanza'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_dRYCYcTwBAFQKExJXdbVgowrzHomxAXlDtF5OQRkiv4/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Portec AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Mahrer Gartenbau GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_SH3t2zA49KIRgczWFt70SpB0Fgl5wDGHL4y8TnrAq5n/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Mahrer Gartenbau GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_RWrEsMeExAb0nGCacjeWdveJU3TdT1pOZDWzJPJgtAL/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Alterszentrum Hofmatt'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_9qh2wM74fUnJH6PtrIzgZcDrGB8UCpqOSowFp1KeKJ2/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'H Focus AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_Zc7dhQblq9fmZdnezdzP0Wt0LsGLDgkKdOaZQWm1wc8/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Level 14 AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_BCfwEE6kJXyR9sU7d13gGzPEfOIgSZNrIRcGLtmwRUr/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Kantonsspital Uri'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_u59zrOSl7sQXM8yXlLzMRTk9hZKoh1zTpw47IExpHNR/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Praxis Michalik GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_dt1b4FxbxFpq7LfhVpySoq37vsSP7qlvg48C3q5giDu/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Hersche Ingenieure AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_Fvc4ssjQIPHFXyxL9e1CpeQvn3YmaNzehEtLmdHDRRs/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Suter Entfeuchtungstechnik AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_VxpuxTR8lnbPQtQ504LSxFSlfc1QYFpXdOrVNQg0cRs/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'INGOLD Treuhandpartner AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_MUSuRYLxTRViRQuB4Ca3FXqrDBLGGRfhSsSmNSc7WJq/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Gremper AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Liechti Haustechnik AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_KEQE3LbdmaQ49elLfpdJ67PFTRm82S6zicrTOwlUbwk/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Liechti Haustechnik AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Bifang Wohn- und Pflegezentrum Wohlen'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_7anoEt5FFhp6iEmvnjnM8RvDafXTSZ3qHbbnSW4KoSo/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Bifang Wohn- und Pflegezentrum Wohlen'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_dVeJhMoDq6Ryk1f5RKyalVwpJBAbmROnWf1cWG3b8Fd/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'DECORVET HLKS Planungen AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_L9Jnbdt0gTQTAkqnOkV2lQO4GgGnmGNQFnBe1lxl7aE/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'PWA Private Wealth Advisors AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_M2NRBDWGPJ8o7dOE8A2Y4h9v5bChFK30SEZJFw1mDkd/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Elektrokonstrukt AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Bleiker Holzbau AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_2XTgIv0IX8LtZTMiwcoUJCa90OKKPaCh481IZCgnE82/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Bleiker Holzbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Aesthetics Medical AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_J8nia5FrwPnpugI59IUjvlbncKYUlQ10F4rbpzMr4NT/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Aesthetics Medical AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Grüter & Moretto GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_T2Y1hVVPCRVDaKgvo0vu3K7SmYU5vseYHQ0M7JvE3sY/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Grüter & Moretto GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'FLURI GISLER + Partner AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_AJ5y1GrkjlRt6koGooeaQ2sjjaN47ECtGEPLse4OmzQ/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'FLURI GISLER + Partner AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Altersheim St. Urban'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_4LWN0GalfOx3atEMen2daI5jW8bj65m5MVtD1f5GuDx/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Altersheim St. Urban'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_pv55ezVEmSieymN8pdr1onHo390XMwud64oAdVVTOW2/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Marschall Innenausbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_ryCHeVTCKb1Nn8rd5Rl2XSrDutDUafUmLFZW9JRsGbX/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Novum Treuhand AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_kPLjNjE5KzCJuH3kZ4vDuPyTeafp4pJ2fQHDYUQ1SnY/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Garage Carrosserie Moser AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_H1WC2e71QJcIy0kDqlOFZRrh2BAsk09qe9WgfjMs3Eo/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'planerpartner GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_Rv6xUOkk0uFppecIEkU0S8wMWfHbTye0dmmkwqbPjFD/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Grindelwald Bakery GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_i9pMKm2Y0UEbYM7I34cNJlGbDrvhOBbT9hbIFLWh9VP/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'SK ElektroEngineering AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_JGsfxhcBUiFT4YEBE8XeTVtcRRtoM6KNrsjwujqHegF/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Kebo AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_YSPXvPDYtfaQnAGrFYFHjE8ZvY2UYSClhlMNttvvW9E/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Coca‑Cola HBC Schweiz AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Schaffner Sanitär AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_BWnrzEwKjetytoKRAMpBJN2XUjLX1cgcAOsPNKzW5X5/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Schaffner Sanitär AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_aKwttw5e7jAZrUBvyQUjJJG8tE5QTp9SbVC65bV35nU/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Bäbler Heizungen AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_1ZxPhOzJ5iFRDfO7cLZQPTR8s4uSCwZCLehRcJUbxvp/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Lastech AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Michelle Guy Ergotherapie'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_MfnzGWQBuOlvhOmlv8F2mKkecZi5fpGhf9RMWnraSjT/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Michelle Guy Ergotherapie'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'HKG Engineering AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_W9Ld0rOdMPyuyzNpFXFQ77z8CPeZ8jqj2HMdhPe6wUS/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'HKG Engineering AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'EM ELECTROCONTROL AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_mGHoFoZVsktuVmseZv6SjzRLwoGgAhJqkg44eTLDYni/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'EM ELECTROCONTROL AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_DRmcahcZs69z84D0cI7lebzo1marvwDv9uIKhhlbNCj/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Luchs Bodenbeläge AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_d9iooI9uJaSSRB016mcTYi3Ujp7upJ83k9pP2AEHExa/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Lahner & Selmani Kunststofftechnik GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Zimmerei Team Egolzwil AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_YgRu8NiD4kXDcjIJx8OPH1PX2pEYqwk1DKNQE4iNGJP/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Zimmerei Team Egolzwil AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_ojpBbi3mKfoOueQZ1ZB7cQAbxv0HQJYPKxF3SEwDnyi/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Budliger Treuhand AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_7e4wB0IXIU9kihYUCgrhPnNZHaOJYpg52DTOt50E7If/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'AQUA-Sanitär AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_64NlzmdREvWUQj4UwZb5Q6HUuVApH96Hpw487eRItgz/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Gerber Auto AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Stiftung Behindertenbetriebe Uri'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_m1dinJLuScE354cQeUTvqWwdGJiratevC1MDOYGyTut/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Stiftung Behindertenbetriebe Uri'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'ETAVIS Bern-Mittelland AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_ZjYO27dFO1Gr7mqzPboFm1gjxaqX9c1jUUteKUIhDeI/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'ETAVIS Bern-Mittelland AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_IamCzVM5uSZuCW5o7qtazC9XqUojz1udzzQwYls1Gsc/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Geburt und Familie - Dr. med. W. Stadlmayr GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_Dn5dV1Yf4QIGIl07aHzElOYbnvaU8qjhmmhBpFx7aCq/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Stiftung Leben im Alter Herisau'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Juchler Tobias AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_vu8xHEUFjgvbFy2Viba3PlcDLybXeLx6LdCeMtce7ll/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Juchler Tobias AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_76FNJTMsPz4Y4ryoMv7BbF7pwgrZfP2P4F7A7lfy7Kd/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Ruepp Schreinerei AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_86TJaWBN7HvKTgLwundhxSXeBlxeQK5UJ8mfHKJ0J1S/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Grünenfelder & Lorenz AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Caviezel AG Holzbau, Innenausbau, Küchen'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_BcbhHPSTsWOggCAv9nFJt8H7LdnWACFWRJaNilk1ZKY/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Caviezel AG Holzbau, Innenausbau, Küchen'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_xtmTBb83DZ4vAfCGlLGrxmZgDmDTAzrcDZLnIEGlJ5b/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Müller & Partner Schreinerei AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Sauna World AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_92oz9QZ9mVl4VchYhddIffwsbXU4MgY4bZGJhr9Yt3f/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Sauna World AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Bertschi AG Gartenbau'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_hW5kvTc6zOsURmfyl2GTZm0TdjFQN4fg5sswpapKtk6/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Bertschi AG Gartenbau'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_wl2wrt8RsxQze0fG8zvXvzDghMjiOLQaY9DhG5420J3/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'ZAUGG AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Alessandro Walder GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_93wjnrJInu87StsjM5crMrRdvLd682C7Opnd89Yn2AT/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Alessandro Walder GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_A6rNTlFjF9tzqLIVl3XOphOkXRKIVDBw15Iu4PdnlQO/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'HAUPTSACHE Franziskanerplatz8 GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'PLANWERKSTATT RÜEGG AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_8SmP5Ocuqr8I1bzVyXLgLDOiORlXjnGmaTW2HniPfGV/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'PLANWERKSTATT RÜEGG AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_CqOGixBEX9XOe8AFIsXODsnan4rDljxqTnNIspvykIb/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Hans Nussbaumer, Elementbau & Architekturbüro AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 7000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Regionaler Blutspendedienst SRK Graubünden'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_GWpNYpoVlPk88DeqsstE8Hm2xoiDelm23k3wafKClAX/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Regionaler Blutspendedienst SRK Graubünden'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_hx71ajjbElEp0GQRoQwcsu8N7XcyGq7syh8YFKyKSk6/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Brasser Kälte AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_b1kfZDYuKFePNdmwxeznXRmGA2GTreUE4YEY2LZoMog/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Elfo AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_4Zdu3gdIdGd9fdzCKGsorSdWb1GxQvDTVmIYspx8bvf/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Wismer + Partner AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Adam Schreinerei AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_JRFT7N2emZ23tl2nheuEstAzHh0e3DHGk8Go8kaOoP3/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Adam Schreinerei AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_ZPKqlEUaBncW5to0A5Y2iQ6QaP0j2Ucd1PmlL2etlaK/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Zimmermann Technik AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_ozGirNbhlP8py3jY9wYm9PpWPHRVDFosLKmDCfFbBkS/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Schumacher Söhne AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_io2R5GvsoQmJXvGSdp2OUnzj6ynOn2swHr1FSjvFITU/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Burckhardt Architektur AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Oesch Innenausbau AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_RX6kuesTJ1OsCVfkbb3YmiZoDi4OJRHZeWh2Ejy48rw/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Oesch Innenausbau AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Garage Ozelley AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_7KFtmyv5hV3lht5aF8TmwBwcDgEEdUOlaKyXxnKKULe/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Garage Ozelley AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_jpyLnb0z1X9r0srAzYNvaUR7MIzfXXlrDkF9BglWHzn/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Lian Chinaherb AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_nqXXRnLpVI7EhVPevIchyxoOzR8gbxawmCkZ7IWZxBm/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Bacher + Schmidt Elektro AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 4500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Physio Lifestyle GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_LUkQmBoEJNsERlOsJomUCc6OmAGjEyEEEIO3d4cpoTc/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Physio Lifestyle GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 12500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Nutzfahrzeug AG Zentralschweiz'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_MZNZOTp06nLLkvOnRXG90P434JXjD3BQ0WOQSpq7rSK/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Nutzfahrzeug AG Zentralschweiz'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 11400, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Akropolis Greek GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_GWCqJduFd077gjyWcvcIAZRQLQxnOcItpKawvUKFTCv/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'Akropolis Greek GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 9000, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'F&S Solutions GmbH'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_WZe2OJFyPOGCVv2H3QO369Qa0NyKrfp8iznSHCy6Dpx/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'F&S Solutions GmbH'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';

UPDATE deals_nk SET ae_wert = 5500, updated_at = updated_at
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'W. Stadelmann AG'
    AND ae_wert IS NULL AND kommentar LIKE '%[imp:excel_risem%';

UPDATE deals_nk SET kommentar = kommentar || ' · Close: ' || 'https://app.close.com/lead/lead_vwYmmtt02pUkx2sr8EeJ6CcXwwruPQZOgnnN3cpwZHV/'
  WHERE company_id = (SELECT id FROM companies WHERE name = 'Risem') AND monat = '2026-07' AND kunde = 'W. Stadelmann AG'
    AND kommentar IS NOT NULL AND kommentar NOT LIKE '%app.close.com%';
