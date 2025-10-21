import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const handle = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const j = await res.json();
      if (!res.ok) return alert(j.error || 'Error al registrar');
      alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
      nav('/');
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
  };

  return (
    <div className="container">
      <h2>Registro</h2>
      <input className="input" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
      <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="input" placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="button" onClick={handle}>Registrar</button>
      <p className="small" style={{ marginTop: 12 }}>¿Ya tienes cuenta? <a href="/">Inicia sesión</a></p>
    </div>
  );
}
