import { useState, useRef, useEffect, useLayoutEffect } from 'react';

// Kleines, wiederverwendbares Info-Popover für ⓘ-Icons.
// Öffnet bei Hover UND Klick/Tap (Touch), schließt bei Außenklick/Tap, Esc und beim Scrollen.
// Panel per position:fixed (getBoundingClientRect) -> wird nicht von overflow-Containern beschnitten.
export default function InfoPopover({ text, label }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: -9999, left: 0 });
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const timer = useRef(null);

  const show = () => {
    clearTimeout(timer.current);
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 288)) });
    setOpen(true);
  };
  const hideSoon = () => { timer.current = setTimeout(() => setOpen(false), 120); };
  const hideNow = () => { clearTimeout(timer.current); setOpen(false); };

  // Nach oben klappen, wenn unten kein Platz ist.
  useLayoutEffect(() => {
    if (!open || !panelRef.current || !btnRef.current) return;
    const ph = panelRef.current.getBoundingClientRect().height;
    const r = btnRef.current.getBoundingClientRect();
    if (r.bottom + 6 + ph > window.innerHeight - 8) setPos(p => ({ ...p, top: Math.max(8, r.top - 6 - ph) }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') hideNow(); };
    const onDown = e => { if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) hideNow(); };
    const onScroll = () => hideNow();
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', hideNow);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', hideNow);
    };
  }, [open]);

  return (
    <span className="inline-flex align-middle">
      <button
        type="button"
        ref={btnRef}
        aria-label={`Info${label ? ': ' + label : ''}`}
        onClick={e => { e.stopPropagation(); open ? hideNow() : show(); }}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] leading-none text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-help select-none"
      >ⓘ</button>
      {open && (
        <div
          ref={panelRef}
          role="tooltip"
          onMouseEnter={show}
          onMouseLeave={hideSoon}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 280 }}
          className="z-[70] rounded-lg bg-gray-900 text-left text-xs leading-relaxed px-3 py-2 shadow-xl"
        >
          {label && <div className="font-semibold text-white mb-0.5">{label}</div>}
          <div className="text-gray-200 font-normal normal-case tracking-normal">{text}</div>
        </div>
      )}
    </span>
  );
}
