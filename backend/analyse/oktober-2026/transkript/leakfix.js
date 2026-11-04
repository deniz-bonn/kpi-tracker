const L = require('./lib'); const fs = require('fs');
const codes = require('./taxo/open_codes.json');
(async () => {
  let fixed = 0;
  for (const c of codes) {
    const k = L.leadKontext(c.leadId); const d = c.quelle === 'close' ? await L.closeCall(c.id) : await L.ffMeeting(c.id);
    const namen = [...(d ? d.kundenNamen : []), k.leadName || ''].flatMap(n => n.split(/[\s,.&\-\/()]+/)).filter(t => t.length >= 4 && !/gmbh|gesellschaft|verwaltung|service|group|holding/i.test(t));
    let s = JSON.stringify(c); let n = 0;
    for (const t of namen) { const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); if (re.test(s)) { s = s.replace(re, '[Name]'); n++; } }
    if (n) { Object.assign(c, JSON.parse(s)); fixed++; console.log('bereinigt:', c.id.slice(0, 14), '->', n, 'Token'); }
  }
  fs.writeFileSync(__dirname + '/taxo/open_codes.json', JSON.stringify(codes)); console.log('bereinigte Eintraege:', fixed);
  const nm = codes.filter(c => JSON.stringify(c).includes('[Name]')).map(c => c.einzeiler.slice(0, 140)); console.log(nm.join('\n'));
})();
