import { useEffect, useState } from "react";
import NFCWriterButton from "../shared/NFCWriterButton";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const token = localStorage.getItem("fm_token");
  const api = import.meta.env.VITE_API_URL || "https://findme-2u4v.onrender.com";

  function getUserIdFromToken(tok) {
    try {
      const parts = tok.split(".");
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.sub || payload.user_id || payload.id || payload.userId || null;
    } catch (e) {
      console.warn("No se pudo decodificar el token JWT", e);
      return null;
    }
  }

  useEffect(() => {
    if (!token) {
      setError("No hay token de autenticación. Inicia sesión primero.");
      return;
    }
    if (!api) {
      setError("VITE_API_URL no está configurado.");
      return;
    }

    let cancelled = false;
    const headers = { Authorization: "Bearer " + token, "Content-Type": "application/json" };

    async function fetchProfiles() {
      setLoading(true);
      setError(null);
      try {
        let userId = null;
        try {
          let res = await fetch(api + "/api/me", { headers });
          if (res.ok) {
            const me = await res.json();
            userId = me.id || me.userId || me._id || null;
          }
        } catch (e) {}

        if (!userId) {
          try {
            let res = await fetch(api + "/api/users/me", { headers });
            if (res.ok) {
              const me = await res.json();
              userId = me.id || me.userId || me._id || null;
            }
          } catch (e) {}
        }

        if (!userId) {
          userId = getUserIdFromToken(token);
        }

        if (!userId) {
          setError("No se pudo determinar el ID de usuario (no hay /api/me y el token no contiene id).");
          setProfiles([]);
          return;
        }

        const resProfiles = await fetch(`${api}/api/users/${userId}/profiles`, { headers });
        if (!resProfiles.ok) {
          const text = await resProfiles.text().catch(() => null);
          throw new Error(`Error al obtener perfiles: ${resProfiles.status} ${text || ""}`);
        }
        const body = await resProfiles.json();
        if (!cancelled) setProfiles(Array.isArray(body) ? body : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfiles();
    return () => {
      cancelled = true;
    };
  }, [token, api]);

  return (
    <div className="container">
      <h2>Perfiles a cargo</h2>

      {loading && <p>Cargando perfiles...</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      <div style={{ marginTop: 12 }}>
        {!loading && profiles.length === 0 && !error && (
          <div>
            <p>No hay perfiles cargados.</p>
            <p>Puedes crear uno desde la opción Crear perfil.</p>
            <Link to="/crear-perfil" className="button">Crear perfil</Link>
          </div>
        )}

        {profiles.map((p) => (
          <div key={p.id || p._id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{p.full_name || p.name || "Sin nombre"}</div>
                <div className="small">Usuario: {p.username || p.user || "N/A"}</div>
                <div className="small">Fecha de nacimiento: {p.birthdate || p.birth_date || p.dob || "N/A"}</div>
                <div className="small">Número de emergencia: {p.emergency_number || p.contact_number || p.phone_emergency || "N/A"}</div>
                <div className="small">Correo de emergencia: {p.emergency_email || p.email || "N/A"}</div>
                <div className="small">Alergias: {p.allergies || p.allergies || p.alergias || "N/A"}</div>
                <div className="small">Hospital: {p.hospital || "N/A"}</div>
                <div className="small">Nota: {p.medical_notes || p.note || p.nota || "N/A"}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="button" onClick={() => nav("/nfc/" + (p.id || p._id))}>Generar NFC</button>
                <Link to={"/crear-perfil"} className="button">Editar</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Demo: escribir un link en NFC</h3>
        <p className="small">Genera un link en el backend y pégalo acá (demo usa id de perfil como token)</p>
        <NFCWriterButton url={window.location.origin + "/nfc/demo-token-123"} />
      </div>
    </div>
  );
}
