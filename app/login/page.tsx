
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { browserDb } from '../../lib/supabase-browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const { error: loginError } =
      await browserDb().auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setBusy(false);
      return;
    }

    window.location.href = '/';
  }

  return (
    <main className="layout" style={{ maxWidth: 480 }}>
      <h1>LA 04 · Iniciar sesión</h1>

      <form className="card" onSubmit={submit}>
        <label>
          Correo
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button disabled={busy}>
          {busy ? 'Ingresando…' : 'Entrar'}
        </button>

        <p>
          ¿Todavía no tenés cuenta?{' '}
          <Link href="/registro">Solicitar acceso</Link>
        </p>
      </form>
    </main>
  );
}
