import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SetPassword() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const token     = params.get('token');
  const mode      = params.get('mode'); // 'reset' or undefined (invite)

  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) { setError('Passwörter stimmen nicht überein'); return; }
    if (password.length < 8)    { setError('Passwort muss mindestens 8 Zeichen haben'); return; }
    setError('');
    setLoading(true);
    try {
      if (mode === 'reset') {
        await axios.post('/api/auth/reset/confirm', { token, new_password: password });
      } else {
        await axios.post('/api/auth/invite/accept', { token, password });
      }
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Setzen des Passworts');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen bg-[#1e1f21] flex items-center justify-center">
      <p className="text-red-400 text-sm">Ungültiger Link.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e1f21] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            {mode === 'reset' ? 'Passwort zurücksetzen' : 'Passwort festlegen'}
          </h1>
        </div>

        {success ? (
          <div className="bg-green-900/40 border border-green-700 text-green-300 text-sm rounded-xl p-4 text-center">
            Passwort gesetzt! Du wirst zur Anmeldung weitergeleitet …
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#2d2e30] rounded-xl border border-[#444] p-6 space-y-4">
            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded px-3 py-2">{error}</div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Neues Passwort</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#3c3c3c] border border-[#555] text-gray-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Passwort wiederholen</label>
              <input type="password" required value={password2} onChange={e => setPassword2(e.target.value)}
                className="w-full bg-[#3c3c3c] border border-[#555] text-gray-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors">
              {loading ? 'Speichern …' : 'Passwort speichern'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
