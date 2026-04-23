import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export function AdminLogin() {
  const { login, token } = useAdminAuth();
  const [email, setEmail] = useState('admin@spotme.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white/10 border border-white/10 backdrop-blur p-8 shadow-2xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-300 mb-3">Spot Me Admin</div>
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="text-sm text-slate-300 mt-2">Use your admin account to access moderation, users, reports, and analytics.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-slate-200 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-emerald-300"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-200 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-emerald-300"
            />
          </div>

          {error ? <div className="text-sm text-rose-300">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-400 text-slate-950 font-semibold py-3 transition hover:bg-emerald-300 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
