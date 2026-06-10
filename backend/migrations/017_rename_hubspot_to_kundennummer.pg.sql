-- Migration 017: Rename hubspot_id to kundennummer in all deal tables

ALTER TABLE deals_nk RENAME COLUMN hubspot_id TO kundennummer;
ALTER TABLE deals_bk RENAME COLUMN hubspot_id TO kundennummer;
ALTER TABLE deals_vl RENAME COLUMN hubspot_id TO kundennummer;
