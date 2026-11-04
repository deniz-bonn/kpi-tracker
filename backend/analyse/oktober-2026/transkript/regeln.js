// Regelbasierte Auswertungen aus Close-Daten: B3, B4-02/03/07, offene SC, Setting-Basistabelle.
const L = require('./lib'); const E = L.E; const fs = require('fs');
const K = '/private/tmp/claude-501/-Users-denizakpinar-Desktop-Claude-Code-Test/98dcf60b-0ec9-4b71-ba14-2b062fa68231/scratchpad/kotaman';
const { out } = require(K + '/leads.json'); const zu = require('./ff/zuordnung.json');
const belegtFF = new Set(zu.filter(z => z.stufe === 'sicher' || z.stufe.startsWith('wahr')).map(z => z.leadId));
const okt = s => !!s && s.startsWith('2026-10'); const S = E.S; const HEUTE = E.HEUTE;
const dBerlin = a => E.ymd(a.activity_at || a.date_created);
const taskTag = (lead, re) => out[lead].tasks.filter(x => re.test(x.text || '') && x.date).map(x => ({ d: E.ymd(x.date), done: x.is_complete }));
const settings = [], scs = [], b3 = [], offen = [];
for (const rec of E.OPPS) { const lead = rec.o.lead_id;
  for (const t of rec.termine) {
    if (t.art === 'setting' && okt(t.am)) {
      const folge = rec.termine.find(x => x.art === 'closing' && x.idx > t.idx);
      const fu = !!(t.ausgangEv && t.ausgangEv.new_status_id === S.QC_FOLLOWUP);
      const row = { opp: rec.o.id, lead, am: t.am, opener: t.vonName, setter: E.setterVon(t).name, ausgang: t.ausgang, ausgangStatus: t.ausgangStatus, fu, scGelegt: !!folge, scAm: folge ? folge.am : null, scAusgang: folge ? folge.ausgang : null, direktGewonnen: !!E.wonNach(t.rest) };
      settings.push(row);
      if (t.ausgang === 'offen') {  // B3
        const qc = taskTag(lead, /^\s*qc\b/i).filter(x => x.d >= t.am).sort((a, b) => a.d < b.d ? -1 : 1)[0]; const qcDay = qc ? qc.d : null;
        let kat, calls = [];
        if (qcDay && qcDay > HEUTE) kat = 'B3-00 Termin noch nicht faellig';
        else { const von = qcDay || t.am, bis = qcDay ? E.ymd(new Date(new Date(qcDay + 'T12:00:00Z').getTime() + 864e5)) : HEUTE;
          calls = out[lead].acts.filter(a => a._type === 'Call' && dBerlin(a) >= von && dBerlin(a) <= bis);
          if (calls.some(a => a.duration >= 60 && a.recording_url)) kat = 'B3-01 Aufnahme ab 60 s: stattgefunden, nicht dokumentiert';
          else if (calls.length) kat = 'B3-03 nur Aufnahme unter 60 s / ohne Aufnahme: Mailbox oder nicht erreicht';
          else kat = 'B3-02 keine Aufzeichnung: vermutlich nicht stattgefunden'; }
        b3.push({ opp: rec.o.id, am: t.am, qcTag: qcDay, opener: t.vonName, kat, statusHeute: rec.o.status_label });
      }
    }
    if (t.art === 'closing' && okt(t.am || '') || (t.art === 'closing' && okt(t.ausgangAm))) {
      if (!['stattgefunden', 'nicht stattgefunden'].includes(t.ausgang)) continue;
      const closer = E.closerVon(t).name; const hatSetting = rec.termine.some(x => x.art === 'setting' && x.idx < t.idx);
      const naheTasks = taskTag(lead, /^\s*sc\b/i).filter(x => x.d >= t.am && E.kalendertage(x.d, t.ausgangAm) <= 3 && E.kalendertage(t.ausgangAm, x.d) <= 3).sort((a, b) => E.kalendertage(a.d, t.ausgangAm) - E.kalendertage(b.d, t.ausgangAm));
      const scDay = naheTasks.length ? naheTasks[0].d : null;
      let wt = null, bestaetigt = null;
      if (scDay) { wt = E.arbeitstage(t.am, scDay);
        const tc = out[lead].acts.some(a => a._type === 'TaskCompleted' && /best[aä]tig/i.test(a.task_text || '') && dBerlin(a) >= t.am && dBerlin(a) <= scDay);
        const von = E.ymd(new Date(new Date(scDay + 'T12:00:00Z').getTime() - 2 * 864e5));
        const kontakt = out[lead].acts.some(a => ((a._type === 'Call' && a.direction === 'outbound') || (a._type === 'Email' && a.direction === 'outgoing') || (a._type === 'SMS' && a.direction === 'outbound')) && dBerlin(a) >= von && dBerlin(a) <= scDay);
        bestaetigt = tc || kontakt; }
      scs.push({ opp: rec.o.id, lead, closer, gebuchtVon: t.vonName, direkt: !hatSetting, ausgang: t.ausgang, bookDay: t.am, scDay, werktage: wt, b402: wt == null ? null : wt > 5, bestaetigt, b403: bestaetigt == null ? null : !bestaetigt, b407: (!hatSetting) ? null : (t.vonName && closer ? t.vonName !== closer : null) });
    }
  }
  // offene SC Statt. FU (>5 Tage) fuer Julius/Tobias — gleiche Regel wie in den Excel-Dateien
  for (const t of rec.termine) { if (t.art !== 'closing') continue; const closer = E.closerVon(t).name; if (!['Julius Kawka', 'Tobias Böttcher'].includes(closer)) continue;
    if (!((t.ausgang !== 'offen' && okt(t.ausgangAm)) || (t.ausgang === 'offen' && okt(t.am)))) continue; if (rec.o.status_id !== S.SC_STATT_FU) continue;
    const last = rec.hist[rec.hist.length - 1]; const seit = last ? E.ymd(last.date_created) : E.ymd(rec.o.date_created); if (E.kalendertage(seit, HEUTE) <= 5) continue;
    if (offen.some(x => x.opp === rec.o.id)) continue;
    const tasks = out[lead].tasks.filter(x => !x.is_complete && x.date).map(x => ({ d: E.ymd(x.date), text: (x.text || '').trim().slice(0, 28) })).sort((a, b) => a.d < b.d ? -1 : 1);
    const nachSc = tasks.filter(x => x.d >= t.ausgangAm && !/^\s*sc\b/i.test(x.text));
    offen.push({ opp: rec.o.id, lead, closer, scAm: t.ausgangAm, tageSeit: E.kalendertage(t.ausgangAm, HEUTE), statusSeit: seit, ffAufnahme: belegtFF.has(lead), aufgabeHinterlegt: nachSc.length > 0, aufgaben: nachSc.slice(0, 3), alleOffenenAufgaben: tasks.length, ueberfaellig: nachSc.length ? nachSc[0].d < HEUTE : null }); }
}
fs.writeFileSync('run/regeln.json', JSON.stringify({ settings, scs, b3, offen }));
const cnt = (a, f) => a.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
console.log('Settings Okt:', settings.length, '| FU als erster Ausgang', settings.filter(s => s.fu).length, '| offen', settings.filter(s => s.ausgang === 'offen').length);
console.log('B3 (Setting ohne Ausgang):', JSON.stringify(cnt(b3, x => x.kat.slice(0, 5))));
const ssc = scs.filter(x => x.scDay); console.log('SC mit Datum:', ssc.length, 'von', scs.length, '| geplatzt', scs.filter(x => x.ausgang === 'nicht stattgefunden').length, '| stattgefunden', scs.filter(x => x.ausgang === 'stattgefunden').length);
for (const a of ['nicht stattgefunden', 'stattgefunden']) { const r = ssc.filter(x => x.ausgang === a); const dir = r.filter(x => !x.direkt); console.log(' ', a.padEnd(20), 'n=' + r.length, '| >5 Werktage', r.filter(x => x.b402).length, '| ohne Bestaetigung', r.filter(x => x.b403).length, '| Wechsel Setter/Closer', dir.filter(x => x.b407).length, 'von', dir.length, '| direkt', r.filter(x => x.direkt).length); }
console.log('Offene SC (>5 T):', JSON.stringify(cnt(offen, x => x.closer + ' | Aufgabe ' + (x.aufgabeHinterlegt ? 'ja' : 'nein') + ' | Aufnahme ' + (x.ffAufnahme ? 'ja' : 'nein'))));
