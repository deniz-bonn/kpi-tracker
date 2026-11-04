import json, sys, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
modus = sys.argv[1] if len(sys.argv) > 1 else 'probe'
out = sys.argv[2] if len(sys.argv) > 2 else f'run/test_{modus}.xlsx'
calls = json.load(open(f'run/calls_{modus}.json')); R = json.load(open('run/regeln.json'))
try: meet = json.load(open('run/meetings.json'))
except Exception: meet = []
tax = json.load(open('taxo/taxonomie.json')); ids = {g['id']: g['name'] for b in tax['bruchstellen'] for g in b['gruende']}
def gr(c, i):
    g = c['gruende']
    if len(g) <= i: return ('', '', '')
    x = g[i]; name = ('Sonstiger Grund' if x['id'] == 'SONSTIG' else f"{x['id']} {ids.get(x['id'], '')}")
    return (name, x['konfidenz'], x['freitext'] if x['id'] == 'SONSTIG' else '')
d = lambda s: f"{s[8:10]}.{s[5:7]}.{s[:4]}" if s else ''
wb = openpyxl.Workbook(); ws = wb.active; ws.title = 'Calls'
hdr = ['Opp-ID', 'Call-ID', 'Quelle', 'Datum', 'Mitarbeiter', 'Im Auswertungskreis', 'Call-Typ (nach Inhalt)', 'Call-Typ laut Zeitlinie', 'Zeitlinie: Anlass', 'Ergebnis', 'Stufe erfolgreich', 'Konfidenz gesamt', 'In Hauptquote',
       'Grund 1', 'Konfidenz Grund 1', 'Grund 2', 'Konfidenz Grund 2', 'Freitext Sonstiger Grund', 'Redeanteil MA %', 'Dauer Min', 'Entscheider im Gespraech', 'Bedarf bestaetigt', 'Naechster Schritt mit Datum', 'MA fragte aktiv nach Termin',
       'Abschlussfrage gestellt (B1-09 invers)', 'Closing aktiv angeboten (B2-13 invers)', 'Termin verbindlich fixiert (B2-14 invers)', 'Abschluss aktiv versucht (B5-13 invers)', 'Warnsignale B4 (Transkript)', 'Zusammenfassung widerspricht', 'Einzeiler (paraphrasiert)']
ws.append(hdr)
for c in sorted(calls, key=lambda c: (c['datum'], c['oppId'] or '')):
    g1, k1, f1 = gr(c, 0); g2, k2, f2 = gr(c, 1)
    ws.append([c['oppId'], c['callId'] or c['ffId'], 'Fireflies' if c['quelle'] == 'fireflies' else 'Close', d(c['datum']), c['vorname'] if c['imKreis'] else 'andere (Kontext)', 'ja' if c['imKreis'] else 'nein', c['stufe'], c['stufeH'], c['warum'], c['ergebnis'], c['erfolg'], c['konfidenz'], 'ja' if c['konfidenz'] != 'niedrig' else 'nein (niedrig)',
      g1, k1, g2, k2, ' / '.join(x for x in (f1, f2) if x), c.get('redeanteil'), round((c.get('dauer') or 0) / 60, 1), c['entscheider_im_gespraech'], c['bedarf_bestaetigt'], c['naechster_schritt_mit_datum'], c['ma_fragte_aktiv_nach_termin'],
      c['abschlussfrage_gestellt'], c['closing_aktiv_angeboten'], c['termin_verbindlich_fixiert'], c['abschluss_aktiv_versucht'], ', '.join(c['warnsignale_b4']), c['widerspruch_zusammenfassung'], c['einzeiler']])
def sheet(name, header, rows, widths=None):
    s = wb.create_sheet(name); s.append(header)
    for r in rows: s.append(r)
    for c in s[1]: c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='1F2937'); c.alignment = Alignment(wrap_text=True, vertical='top')
    s.freeze_panes = 'A2'; s.auto_filter.ref = s.dimensions
    for i in range(1, len(header) + 1): s.column_dimensions[get_column_letter(i)].width = (widths or {}).get(i, 18)
vn = lambda n: (n or '').split(' ')[0]
sheet('Setting ohne Ausgang (B3)', ['Opp-ID', 'Setting gelegt am', 'QC-Termin laut Aufgabe', 'Opener', 'Regel-Kategorie', 'Status heute'], [[x['opp'], d(x['am']), d(x['qcTag']) if x['qcTag'] else '', vn(x['opener']), x['kat'], x['statusHeute']] for x in sorted(R['b3'], key=lambda x: x['am'])], {5: 70, 6: 22})
sheet('Sales Calls Regeln (B4)', ['Opp-ID', 'Closer', 'SC gebucht von', 'Direkter SC (ohne Setting)', 'Ausgang', 'Gebucht am', 'SC-Datum (Aufgabe)', 'Werktage bis SC', '>5 Werktage (B4-02)', 'Bestaetigung vorhanden', 'Keine Bestaetigung (B4-03)', 'Wechsel Setter->Closer (B4-07)'],
      [[x['opp'], vn(x['closer']), vn(x['gebuchtVon']), 'ja' if x['direkt'] else 'nein', x['ausgang'], d(x['bookDay']), d(x['scDay']) if x['scDay'] else 'unbekannt', x['werktage'] if x['werktage'] is not None else '', {True: 'ja', False: 'nein', None: ''}[x['b402']], {True: 'ja', False: 'nein', None: ''}[x['bestaetigt']], {True: 'ja', False: 'nein', None: ''}[x['b403']], {True: 'ja', False: 'nein', None: ''}[x['b407']]] for x in sorted(R['scs'], key=lambda x: x['bookDay'])])
sheet('Meetings Close (Zusamm.)', ['Meeting-ID (gekuerzt)', 'Opp-ID', 'Mitarbeiter', 'Datum', 'Dauer Min', 'Zusammenfassung vorhanden', 'Call-Typ (Zusammenfassung)', 'Ergebnis', 'Status heute', 'Einzeiler'],
      [[m['id'], m['oppId'], m['person'], d(m['datum']), m['dauerMin'], 'ja' if m['hatZusammenfassung'] else 'nein', m.get('stufe', ''), m.get('ergebnis', ''), m['statusHeute'], m.get('einzeiler', '')] for m in meet])
for i, w in {1: 44, 2: 40, 3: 10, 4: 11, 5: 14, 6: 8, 7: 22, 8: 22, 9: 34, 10: 34, 11: 8, 12: 9, 13: 10, 14: 40, 15: 9, 16: 40, 17: 9, 18: 30, 19: 9, 20: 8, 21: 11, 22: 11, 23: 11, 24: 11, 25: 11, 26: 11, 27: 11, 28: 11, 29: 14, 30: 11, 31: 90}.items(): ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = 'H2'; ws.auto_filter.ref = ws.dimensions
wb.save(out); print('geschrieben', out, 'Zeilen Calls', len(calls))
