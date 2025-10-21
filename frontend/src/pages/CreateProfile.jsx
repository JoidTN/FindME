import React, { useState } from "react";

export default function CreateProfile({ userId }) {
  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    contact_number: "",
    emergency_contact: "",
    email: "",
    allergies: "",
    hospital: "",
    medical_notes: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Guardando...");

    try {
      const res = await fetch(
        `https://findme-2u4v.onrender.com/api/users/${userId}/profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 👇 si ya usas token JWT en tu login
            // Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Error al crear perfil");
      const data = await res.json();
      console.log("Perfil creado:", data);
      setStatus("✅ Perfil creado con éxito");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error al crear perfil");
    }
  };

  return (
    <div className="container">
      <h2>Crear perfil a cargo</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="full_name"
          placeholder="Nombre completo"
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="birth_date"
          placeholder="Fecha de nacimiento"
          onChange={handleChange}
        />
        <input
          type="text"
          name="contact_number"
          placeholder="Número de contacto"
          onChange={handleChange}
        />
        <input
          type="text"
          name="emergency_contact"
          placeholder="Contacto de emergencia"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          onChange={handleChange}
        />
        <input
          type="text"
          name="allergies"
          placeholder="Alergias"
          onChange={handleChange}
        />
        <input
          type="text"
          name="hospital"
          placeholder="Hospital preferente"
          onChange={handleChange}
        />
        <textarea
          name="medical_notes"
          placeholder="Notas médicas o información adicional"
          onChange={handleChange}
        />
        <button type="submit">Crear perfil</button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}
