import React, { useState } from "react";

function CreateProfile({ userId, token }) {
  const [form, setForm] = useState({
    full_name: "",
    allergies: "",
    contact_number: "",
    email: "",
    emergency_contact: "",
  });
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error(error);
      alert("Error creando el perfil");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Crear Perfil a Cargo 👤</h2>
      <form onSubmit={handleSubmit}>
        <input name="full_name" placeholder="Nombre completo" onChange={handleChange} /><br />
        <input name="allergies" placeholder="Alergias" onChange={handleChange} /><br />
        <input name="contact_number" placeholder="Teléfono" onChange={handleChange} /><br />
        <input name="email" placeholder="Email" onChange={handleChange} /><br />
        <input name="emergency_contact" placeholder="Contacto de emergencia" onChange={handleChange} /><br />
        <button type="submit">Crear</button>
      </form>

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>✅ Perfil creado correctamente</h3>
          <p>ID: {response.id}</p>
          <button
            onClick={() =>
              window.location.href = `/nfc/${response.id}`
            }
          >
            Generar link NFC
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateProfile;
