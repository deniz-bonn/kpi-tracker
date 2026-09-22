// ── Die Felddefinition des BK-Deal-Formulars — EINE Quelle ───────────────────
//
// Frueher stand dieses Array direkt in DealsBK.jsx, innerhalb der Komponente. Der Bereich
// "Willkommensmeetings" oeffnet dasselbe Formular; eine Kopie waere genau die Doppelpflege,
// die das Vorhaben ausschliessen soll — laeuft eine der beiden Listen auseinander, entstehen
// ueber den einen Weg Deals mit anderen Pflichtfeldern als ueber den anderen.
//
// DealModal selbst bleibt unangetastet: die Komponente kennt kein einziges Deal-Feld und
// erwartet die Definition ohnehin von aussen.

export const STATUS_OPTS       = ['Offen', 'Gewonnen', 'Verloren'];
// 'Dauer-RaaS' stand hier bisher NICHT, obwohl die Umstellung genau diesen Wert als Default
// schreibt. Folge: Wer einen umgestellten Deal im BK-Formular oeffnete, sah ein leeres
// Pflichtfeld und konnte nicht speichern — bei zwei Deals in Produktion nachweisbar.
export const DIENSTLEISTUNGEN_BK = ['RaaS Kontingente', 'RaaS Kleinkunde Laufzeit', 'Kontingent (Alt)',
  'Dauer-RaaS', 'Karriereseite', 'Karriereseite Wartung', 'Social-Media', 'Glaubenssätze',
  'Media-Day', 'Website', 'Sonstiges'];
export const AUTO_VL_OPTS      = ['Ja', 'Nein'];
export const ABGERECHNET_OPTS  = ['Nein', 'Ja', 'On Hold'];

/**
 * Baut die Felder des BK-Deal-Formulars.
 *
 * @param compOpts    Company-Optionen [{value,label}]
 * @param kamOptions  KAM-Optionen [{value,label}]
 * @param curSym      Waehrungssymbol fuer die Wert-Labels ('€' | 'CHF')
 * @param canSeeAll   Darf die Person den KAM frei waehlen? (Admin/Backoffice/Vertriebsleitung)
 * @param isAdmin     Darf das Datum nachtraeglich geaendert werden?
 * @param isEdit      Bearbeiten statt Anlegen (sperrt das Datum fuer Nicht-Admins)
 * @param kamPflicht  KAM als Pflichtfeld erzwingen — siehe unten
 */
export function bkDealFields({ compOpts = [], kamOptions = [], curSym = '€',
                               canSeeAll = false, isAdmin = false, isEdit = false,
                               kamPflicht = false } = {}) {
  return [
    // Datum nachträglich ändern: nur Admin/Superadmin. Ändert NICHT den Berichtsmonat
    // (Feld "monat") und nicht die AE-Buchung (die hängt an gewonnen_monat).
    { name: 'datum',          label: 'Datum',             type: 'date',   required: true, readOnly: isEdit && !isAdmin },
    { name: 'monat',          label: 'Monat (YYYY-MM)',                   required: true },
    { name: 'company_id',     label: 'Company',           type: 'select', options: compOpts, required: true },
    { name: 'kunde',          label: 'Kunde',                             required: true },
    { name: 'kundennummer',   label: 'HubSpot ID' },
    { name: 'dienstleistung', label: 'Dienstleistung',    type: 'select', options: DIENSTLEISTUNGEN_BK, required: f => f.status === 'Gewonnen' },
    // Im BK-Bereich ist das KAM-Feld nur fuer canSeeAll sichtbar; fuer einen bk_vertrieb-Nutzer
    // ergaenzt es der Server mit der eigenen employee_id ("nur wenn leer").
    // Im Willkommensmeeting ist es dagegen IMMER sichtbar UND Pflicht: dort waehlt der Erfasser
    // den Meeting-Fuehrer, und ein Deal ohne kam_id faellt per INNER JOIN lautlos aus jeder
    // BK-Auswertung (auswertung.js, kpis.js). Deshalb kamPflicht.
    ...((canSeeAll || kamPflicht)
      ? [{ name: 'kam_id', label: kamPflicht ? 'KAM (Meeting-Führer)' : 'KAM',
           type: 'select', options: kamOptions, required: !!kamPflicht,
           hint: kamPflicht ? 'Bekommt AE und Provision für dieses Angebot' : undefined }]
      : []),
    { name: 'angebotswert',   label: `Angebotswert (${curSym})`,  type: 'number', required: true },
    { name: 'ae_wert',        label: `AE-Wert (${curSym})`,       type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'laufzeit_monate',label: 'Laufzeit (Monate)', type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'termin_mit_daniel', label: 'Termin mit Daniel?', type: 'select', options: ['Ja', 'Nein'], required: true },
    { name: 'automatische_verlaengerung', label: 'Automatische Verlängerung', type: 'select', options: AUTO_VL_OPTS, required: true },
    { name: 'status',         label: 'Status',            type: 'select', options: STATUS_OPTS, required: true },
    {
      name:     'gewonnen_datum',
      label:    'Annahmedatum',
      type:     'date',
      hint:     'Datum, an dem der Kunde den Deal angenommen hat',
      show:     f => f.status === 'Gewonnen',
      required: f => f.status === 'Gewonnen',
      autoFill: (form, changedKey) =>
        changedKey === 'status' && form.status === 'Gewonnen' && !form.gewonnen_datum
          ? new Date().toISOString().slice(0, 10)
          : undefined,
    },
    { name: 'abgerechnet',    label: 'Abgerechnet',       type: 'select', options: ABGERECHNET_OPTS },
    { name: 'kommentar',      label: 'Kommentar',         type: 'textarea' },
  ];
}
