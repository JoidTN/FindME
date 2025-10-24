import React, { useState } from "react";
import NFCWriterButton from "../shared/NFCWriterButton";
import { Link } from "react-router-dom";

export default function CreateProfile() {
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
  const [createdProfile, setCreatedProfile] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(null);

  const api = import.meta.env.VITE_API_URL || "https://findme-2u4v.onrender.com";
  const token = localStorage.getItem("fm_token");

  function getUserIdFromToken(tok) {
    try {
      if (!tok) return null;
      const parts = tok.split(".");
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.sub || payload.user_id || payload.id || payload.userId || null;
    } catch (e) {
      console.warn("No se pudo decodificar token JWT", e);
      return null;
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Guardando...");
    setCreatedProfile(null);
    setGeneratedUrl(null);

    if (!token) {
      setStatus("No estás autenticado. Inicia sesión primero.");
      return;
    }

    try {
      let userId = null;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      // 1) intenta /api/me
      try {
        const meRes = await fetch(`${api}/api/me`, { headers });
        if (meRes.ok) {
          const me = await meRes.json();
          userId = me.id || me.userId || me._id || null;
        }
      } catch (err) {
        // noop
      }

      // 2) fallback /api/users/me
      if (!userId) {
        try {
          const meRes = await fetch(`${api}/api/users/me`, { headers });
          if (meRes.ok) {
            const me = await meRes.json();
            userId = me.id || me.userId || me._id || null;
          }
        } catch (err) {}
      }

      // 3) fallback a token
      if (!userId) {
        userId = getUserIdFromToken(token);
      }

      if (!userId) {
        setStatus("No se pudo determinar el ID de usuario. Revisa tu autenticación o configura /api/me.");
        return;
      }

      const res = await fetch(`${api}/api/users/${userId}/profiles`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          full_name: form.full_name,
          birth_date: form.birth_date,
          contact_number: form.contact_number,
          emergency_contact: form.emergency_contact,
          email: form.email,
          allergies: form.allergies,
          hospital: form.hospital,
          medical_notes: form.medical_notes,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Error al crear perfil: ${res.status} ${text}`);
      }

      const data = await res.json();
      setCreatedProfile(data);
      // el backend puede devolver id o token; priorizamos token si existe
      const tokenOrId = data.token || data.id || data._id || data.profileToken || null;
      const link = window.location.origin + "/nfc/" + (tokenOrId || `profile-${Date.now()}`);
      setGeneratedUrl(link);
      setStatus("✅ Perfil creado con éxito. Usa el botón para escribir el link en NFC.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error al crear perfil: " + (err.message || err));
    }
  };

  return (
    <div className="container">
      <h2>Crear perfil a cargo</h2>
      <form onSubmit={handleSubmit} className="form">
        <input type="text" name="full_name" placeholder="Nombre completo" onChange={handleChange} required />
        <input type="date" name="birth_date" placeholder="Fecha de nacimiento" onChange={handleChange} />
        <input type="text" name="contact_number" placeholder="Número de contacto" onChange={handleChange} />
        <input type="text" name="emergency_contact" placeholder="Contacto de emergencia" onChange={handleChange} />
        <input type="email" name="email" placeholder="Correo" onChange={handleChange} />
        <input type="text" name="allergies" placeholder="Alergias" onChange={handleChange} />
        <input type="text" name="hospital" placeholder="Hospital preferente" onChange={handleChange} />
        <textarea name="medical_notes" placeholder="Notas médicas o información adicional" onChange={handleChange} />
        <button type="submit" className="button">Crear perfil</button>
      </form>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}

      {generatedUrl && (
        <div style={{ marginTop: 12 }}>
          <div className="small">Link generado para NFC:</div>
          <div style={{ wordBreak: "break-all", marginBottom: 8 }}>{generatedUrl}</div>
          <NFCWriterButton url={generatedUrl} />
          <div style={{ marginTop: 12 }}>
            <Link to="/dashboard" className="button">Volver al panel</Link>
          </div>
        </div>
      )}

      {createdProfile && (
        <pre style={{ marginTop: 12, background: "#f8f8f8", padding: 8, borderRadius: 6 }}>
          {JSON.stringify(createdProfile, null, 2)}
        </pre>
      )}
    </div>
  );
}
