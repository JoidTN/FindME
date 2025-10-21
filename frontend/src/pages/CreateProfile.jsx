import React, { useState } from 'react';

export default function CreateProfile() {
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    password: '',
    birth_date: '',
    allergies: '',
    hospital: '',
    contact_number: '',
    emergency_email: '',
    emergency_contact: '',
    medical_notes: '',
    blood_type: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log('Ficha creada:', data);
    alert('Ficha creada correctamente ✅');
  };

  return (
    <div className="create-profile">
      <h2>Crear ficha médica</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            type={key === 'birth_date' ? 'date' : 'text'}
            placeholder={key.replace('_', ' ')}
            value={form[key]}
            onChange={handleChange}
          />
        ))}
        <button type="submit">Crear ficha</button>
      </form>
    </div>
  );
}
