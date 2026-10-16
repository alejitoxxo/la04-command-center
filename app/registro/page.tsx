
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { browserDb } from '../../lib/supabase-browser';

export default function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [serverId, setServerId] = useState('');
  const [rank, setRank] = useState('member');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const { error } = await browserDb().auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name.trim(),
            server_id: serverId.trim(),
            requested_role: rank,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          'Registro enviado. Revisá tu correo para confirmar tu cuenta. Tu rango deberá ser aprobado por un superior.'
        );
      }
    } catch {
      setMessage('Ocurrió un error. Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="layout" style={{ maxWidth: 520 }}>
      <h1>Unite a LA 04</h1>
      <p>
        Registrate y solicitá tu rango dentro de la sede.
      </p>

      <form className="card" onSubmit={submit}>
        <label>
          Correo electrónico
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label>
          Nombre de personaje RP
          <input
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          ID del servidor
          <input
            required
            maxLength={40}
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
          />
        </label>

        <label>
          Rango solicitado
          <select
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          >
            <option value="member">Miembro</option>
            <option value="recruiter">Reclutador</option>
            <option value="manager">Gerente</option>
            <option value="leader">Líder</option>
          </select>
        </label>

        <button type="submit" disabled={busy}>
          {busy ? 'Enviando…' : 'Solicitar acceso'}
        </button>

        {message && <p role="status">{message}</p>}

        <p>
          ¿Ya tenés cuenta? <Link href="/login">Iniciar sesión</Link>
        </p>
      </form>
    </main>
  );
}
