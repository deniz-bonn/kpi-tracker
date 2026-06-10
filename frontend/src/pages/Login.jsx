import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f21] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">KPI Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">Bitte melde dich an</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#2d2e30] rounded-xl border border-[#444] p-6 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">E-Mail</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#3c3c3c] border border-[#555] text-gray-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="name@beispiel.de"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Passwort</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#3c3c3c] border border-[#555] text-gray-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
          >
            {loading ? 'Anmelden …' : 'Anmelden'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Passwort vergessen? Wende dich an deinen Administrator.
        </p>
      </div>
    </div>
  );
}
