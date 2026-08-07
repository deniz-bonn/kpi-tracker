// "Gewonnen"-Effekt: kurzer Konfetti-Burst + Erfolgs-Toast. Selbstgebaut (Canvas), keine
// Dependency, keine Sounds. Einmal global gemountet (in App). Ausgelöst per celebrateWin(),
// entkoppelt über ein CustomEvent, damit NK/BK/VL dieselbe Util nutzen.
import { useEffect, useRef, useState } from 'react';

// Betrag in erfasster Währung anzeigen (Risem/CHF -> "+9.000 CHF", sonst "+5.000 €").
function fmtBetrag(betrag, currency) {
  const n = Math.round(Number(betrag) || 0).toLocaleString('de-DE');
  return currency === 'CHF' ? `+${n} CHF` : `+${n} €`;
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Nur beim ECHTEN Wechsel auf Gewonnen feiern: neuer Status Gewonnen UND vorher nicht Gewonnen.
// Re-Save eines gewonnenen Deals (prev = Gewonnen) und Nicht-Gewonnen-Speicherungen feuern nicht.
// (Fehlerfälle feuern ohnehin nicht, da onSuccess dann nicht läuft.)
export function shouldCelebrate(rowStatus, prevStatus) {
  return rowStatus === 'Gewonnen' && prevStatus !== 'Gewonnen';
}

// Auslöser — von den Deal-Seiten aufgerufen, wenn ein Deal NEU auf Gewonnen wechselt.
export function celebrateWin({ kunde, betrag, currency = 'EUR' }) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('deal-won', { detail: { kunde, betrag, currency } }));
}

function fireConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = (canvas.width = window.innerWidth * dpr);
  const H = (canvas.height = window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const colors = ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6', '#ef4444', '#a855f7', '#eab308'];
  const parts = Array.from({ length: 90 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 220 * dpr,
    y: H * 0.34 + (Math.random() - 0.5) * 60 * dpr,
    vx: (Math.random() - 0.5) * 15 * dpr,
    vy: (Math.random() * -13 - 3) * dpr,
    g: (0.34 + Math.random() * 0.16) * dpr,
    size: (5 + Math.random() * 6) * dpr,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.32,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  const start = performance.now();
  const DURATION = 1800;
  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, W, H);
    const life = Math.max(0, 1 - elapsed / DURATION);
    parts.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= 0.99;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (elapsed < DURATION) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W, H);
  }
  requestAnimationFrame(frame);
}

export default function Celebration() {
  const canvasRef = useRef(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onWon(e) {
      const { kunde, betrag, currency } = e.detail || {};
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(ts => [...ts, { id, kunde, betrag, currency }]);
      setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4200);
      if (!reducedMotion() && canvasRef.current) fireConfetti(canvasRef.current);
    }
    window.addEventListener('deal-won', onWon);
    return () => window.removeEventListener('deal-won', onWon);
  }, []);

  return (
    <>
      {/* Fullscreen-Canvas, blockiert keine Interaktion */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" aria-hidden="true" />
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id}
            style={{ animation: 'dealWonToast .28s cubic-bezier(.16,1,.3,1)' }}
            className="flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-lg px-4 py-3 min-w-[240px]">
            <span className="text-2xl" aria-hidden="true">🎉</span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-gray-800">Deal gewonnen</div>
              <div className="text-xs text-gray-600">
                {t.kunde} · <span className="font-bold text-green-700">{fmtBetrag(t.betrag, t.currency)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
