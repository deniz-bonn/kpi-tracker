import json, os, sys, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
spec=json.load(open('files.json')); want=set(sys.argv[1:])
H=Font(bold=True,color='FFFFFF'); HF=PatternFill('solid',fgColor='1F2937')
GRN=PatternFill('solid',fgColor='DCFCE7'); BLU=PatternFill('solid',fgColor='E0F2FE')
for f in spec['files']:
    if f['file'] not in want: continue
    wb=openpyxl.Workbook(); wb.remove(wb.active)
    for sh in f['sheets']:
        ws=wb.create_sheet(sh['name'][:31]); hdr=sh.get('header')
        if hdr:
            ws.append(hdr)
            for c in ws[1]: c.font=H; c.fill=HF; c.alignment=Alignment(wrap_text=True,vertical='top')
        for r in sh['rows']: ws.append(r)
        if hdr:
            gi=hdr.index('Gewonnen') if 'Gewonnen' in hdr else None
            ci=hdr.index('Closing-Termin entstanden') if 'Closing-Termin entstanden' in hdr else None
            ei=[i for i,h in enumerate(hdr) if h.endswith('€')]
            for row in ws.iter_rows(min_row=2):
                if gi is not None and row[gi].value=='ja': [setattr(c,'fill',GRN) for c in row]
                elif ci is not None and row[ci].value=='ja': [setattr(c,'fill',BLU) for c in row]
                for i in ei: row[i].number_format='#,##0 €'
            ws.freeze_panes='B2' if len(hdr)<10 else 'D2'; ws.auto_filter.ref=ws.dimensions
        else:
            if sh.get('titel'): ws['A1'].font=Font(bold=True)
            if sh['name']=='Hinweise':
                for row in ws.iter_rows(): row[0].alignment=Alignment(wrap_text=True,vertical='top')
        for i,w in enumerate(sh.get('widths',[]),1): ws.column_dimensions[get_column_letter(i)].width=w
    p=os.path.join(spec['outdir'],f['file']); wb.save(p)
    wb=openpyxl.load_workbook(p); print('\n'+f['file']+' — Zeilen:', wb.worksheets[0].max_row-1, '| Blätter:', wb.sheetnames)
    for row in wb['Zusammenfassung'].iter_rows(values_only=True):
        if any(v not in (None,'') for v in row): print('  ', ' | '.join('' if v is None else str(v) for v in row))
