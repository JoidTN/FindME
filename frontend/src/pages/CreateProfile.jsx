import React, { useState } from "react";
import NFCWriterButton from "../shared/NFCWriterButton";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

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
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [createdProfile, setCreatedProfile] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Save profile client-side in localStorage and generate a one-time token
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Guardando...");
    try {
      const id = uuidv4();
      const profile = { id, ...form, created_at: Date.now() };
      // store profiles map
      const profiles = JSON.parse(localStorage.getItem("findme_profiles") || "{}");
      profiles[id] = profile;
      localStorage.setItem("findme_profiles", JSON.stringify(profiles));
      // generate a single-use token mapping
      const token = uuidv4();
      const tokens = JSON.parse(localStorage.getItem("findme_tokens") || "{}");
      // token will map to profile id and expiry (24h)
      tokens[token] = { profile_id: id, expires_at: Date.now() + 24 * 60 * 60 * 1000 };
      localStorage.setItem("findme_tokens", JSON.stringify(tokens));

      const link = window.location.origin + "/nfc/" + token;
      setGeneratedUrl(link);
      setCreatedProfile(profile);
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
        <input type="date" name="birth_date" onChange={handleChange} />
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
