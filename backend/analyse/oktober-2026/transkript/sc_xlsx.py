import json, datetime, collections, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
D = json.load(open('run/sc/liste.json')); rows = D['rows']; vorbei = D['vorbei']; heute = D['heute']; A = D['ausg']
dt = lambda s: datetime.date.fromisoformat(s) if s else None
link = lambda l: f"https://app.close.com/lead/{l}/"
OUT = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/exports/close-listen/Sales_Calls_ohne_Ergebnis_Stand-2026-11-04.xlsx'
wb = openpyxl.Workbook(); ws = wb.active; ws.title = 'Sales Calls ohne Ergebnis'
hdr = ['Sales Call am', 'Tage seit', 'Datum aus', 'Firma', 'Status heute', 'Kategorie', 'Status seit', 'Closer', 'Closer aus', 'Opp-Wert €', 'Offene Aufgabe (nächste Fälligkeit)', 'Aufgabe überfällig', 'Close-Link', 'Opp-ID']
ws.append(hdr)
for r in rows:
    ws.append([dt(r['scAm']), r['tage'], r['quelle'], r['firma'], r['status'], r['kat'], dt(r['seit']), r['closer'], r['closerQuelle'], r['wert'], r['aufgabe']['txt'], {True: 'ja', False: 'nein', None: ''}[r['aufgabe']['ueberfaellig']], link(r['lead']), r['opp']])
def style(s, widths, datecols=()):
    for c in s[1]: c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='1F2937'); c.alignment = Alignment(wrap_text=True, vertical='top')
    s.freeze_panes = 'A2'; s.auto_filter.ref = s.dimensions
    for i, w in enumerate(widths, 1): s.column_dimensions[get_column_letter(i)].width = w
    for row in s.iter_rows(min_row=2):
        for i in datecols: row[i].number_format = 'DD.MM.YYYY'
style(ws, [13, 9, 30, 42, 36, 46, 12, 18, 20, 11, 38, 11, 40, 52], (0, 6))
for row in ws.iter_rows(min_row=2): row[9].number_format = '#,##0 "€"'
# Uebersicht
u = wb.create_sheet('Übersicht'); cnt = lambda f: collections.Counter(f(r) for r in rows)
def block(titel, c, sort=False):
    u.append([titel, 'Anzahl']); u.cell(u.max_row, 1).font = Font(bold=True); u.cell(u.max_row, 2).font = Font(bold=True)
    for k, n in (sorted(c.items()) if sort else c.most_common()): u.append([k, n])
    u.append([])
u.append([f'Sales Calls ohne Ergebnis gewonnen/verloren — Stand {heute[8:]}.{heute[5:7]}.{heute[:4]} (Close, nur lesend)', '']); u['A1'].font = Font(bold=True); u.append(['Gesamt', len(rows)]); u.append([])
block('Je Kategorie', cnt(lambda r: r['kat'])); block('Je Status heute', cnt(lambda r: r['status']))
alt = lambda lo, hi: sum(1 for r in rows if lo <= r['tage'] < hi)
block('Alter seit dem Sales Call', collections.Counter({'0-7 Tage': alt(0, 8), '8-30 Tage': alt(8, 31), '31-60 Tage': alt(31, 61), '61-90 Tage': alt(61, 91), 'über 90 Tage': alt(91, 99999)}))
block('Je Monat des Sales Calls', cnt(lambda r: r['scAm'][:7]), True); block('Je Closer', cnt(lambda r: r['closer']))
block('Offene Aufgabe in Close', collections.Counter({'keine offene Aufgabe': sum(1 for r in rows if r['aufgabe']['n'] == 0), 'offene Aufgabe, überfällig': sum(1 for r in rows if r['aufgabe']['ueberfaellig']), 'offene Aufgabe, nicht überfällig oder ohne Datum': sum(1 for r in rows if r['aufgabe']['n'] > 0 and not r['aufgabe']['ueberfaellig'])}))
u.column_dimensions['A'].width = 62; u.column_dimensions['B'].width = 10
# SC terminiert, Termin vorbei
v = wb.create_sheet('SC terminiert, Termin vorbei'); v.append(['SC-Termin laut Aufgabe', 'Tage seit', 'Firma', 'Closer', 'Opp-Wert €', 'Offene Aufgabe (nächste Fälligkeit)', 'Aufgabe überfällig', 'Close-Link', 'Opp-ID'])
for r in vorbei: v.append([dt(r['scAm']), r['tage'], r['firma'], r['closer'], r['wert'], r['aufgabe']['txt'], {True: 'ja', False: 'nein', None: ''}[r['aufgabe']['ueberfaellig']], link(r['lead']), r['opp']])
style(v, [14, 9, 42, 18, 11, 38, 11, 40, 52], (0,))
for row in v.iter_rows(min_row=2): row[4].number_format = '#,##0 "€"'
# Hinweise
h = wb.create_sheet('Hinweise'); n = lambda k: sum(1 for r in rows if r['status'].startswith(k))
txt = [f'Stand {heute[8:]}.{heute[5:7]}.{heute[:4]}. Quelle: Close-API, nur lesend. Umfang: alle Opportunities, deren Sales Call stattgefunden hat und die noch weder „Won“ noch „Lost“ sind: {len(rows)}.', '',
 'STATUS-ZUORDNUNG', f'• Stattgefunden: „SC/ Statt. FU“ = {n("SC/ Statt")}.',
 f'• Follow-up: „Closing Follow-Up (Kurzfristig) Inaktiv“ {n("Closing Follow-Up (Kurz")} und „(Langfristig) Inaktiv“ {n("Closing Follow-Up (Lang")}; außerdem „Follow-Up/Inaktiv“ {n("Follow-Up/Inaktiv")}, aber nur wenn in der Statushistorie ein stattgefundener Sales Call vorkommt. Nicht aufgenommen von den 925 Opportunities in „Follow-Up/Inaktiv“: {A["fuOhneSC"]} ganz ohne Sales-Call-Bezug, {A["fuNurTerminiert"]} mit Sales Call nur terminiert/abgesagt/No-Show, {A["fuOhneHistorie"]} ohne Historie.',
 '• Rücksprache: Einen Status oder Lead-Status „Rücksprache“ gibt es in Close nicht (nur ca. 30 offene Aufgaben enthalten das Wort im Text). Nächstliegend und deshalb aufgenommen, in der Spalte Kategorie als „Rücksprache/ausstehend“ gekennzeichnet: „QC=SC Ausstehend“ ' + str(n("QC=SC")) + ', „Closing #High Potentials Inaktiv“ ' + str(n("Closing #High")) + ', „Closing Call #2 terminiert Inaktiv“ ' + str(n("Closing Call #2")) + ', „Soft-Close (Onboarding) Inaktiv“ ' + str(n("Soft-Close")) + '. Bei Bedarf in der Kategorie-Spalte herausfiltern.',
 '• Nicht aufgenommen: „SC/ Statt. Kein Angebot“ (28, Status-Typ „verloren“), „Closing No-Show / Absagen Inaktiv“ (31, Sales Call hat nicht stattgefunden), „SC Terminiert“ (siehe eigenes Blatt: Termin liegt in der Vergangenheit, Ausgang nicht gepflegt).', '',
 'DATUM', f'• „Sales Call am“ = Datum der SC-Aufgabe, wenn eine zum Ausgang passt ({sum(1 for r in rows if r["quelle"]=="SC-Aufgabe")} Fälle). Sonst der Tag, an dem der Ausgang in Close gepflegt wurde ({sum(1 for r in rows if r["quelle"]!="SC-Aufgabe")} Fälle, Spalte „Datum aus“). Dieser Tag kann später liegen als der echte Termin. SC-Aufgaben gibt es überwiegend erst seit dem Sommer 2026.', '• „Status seit“ = Tag des letzten Statuswechsels.', '',
 'CLOSER', '• Feld „Closer“ an der Opportunity; ist es leer, die Person, die den Ausgang gepflegt hat; sonst der Opportunity-Inhaber (Spalte „Closer aus“). Die zweite Quelle ist unsicherer: wer den Status pflegt, ist nicht immer der, der das Gespräch geführt hat.', '',
 'OFFENE AUFGABE', '• Jede offene (nicht erledigte) Aufgabe am Lead zählt, auch „SC“ oder „#HP1“; angezeigt wird die nächste Fälligkeit. „Überfällig“ = Fälligkeit vor heute. Das ist die weiche Zählung; ob die Aufgabe wirklich der nächste Kontakt ist, sagt sie nicht.', '', '• Opp-Wert = Wert der Opportunity in Close (kein AE-Wert aus dem Tracker).']
for t in txt: h.append([t])
h.column_dimensions['A'].width = 160
for row in h.iter_rows(): row[0].alignment = Alignment(wrap_text=True, vertical='top')
wb.move_sheet('Übersicht', offset=-1)
wb.save(OUT); print(OUT)
print('Alter:', {k: alt(a, b) for k, (a, b) in {'0-7': (0, 8), '8-30': (8, 31), '31-60': (31, 61), '61-90': (61, 91), '>90': (91, 99999)}.items()})
