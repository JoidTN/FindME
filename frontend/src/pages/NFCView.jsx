import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NFCView(){
  const { token } = useParams()
  const [data,setData] = useState(null)
  const [err,setErr] = useState(null)

  useEffect(()=>{
    // Try backend first if configured
    const apiBase = import.meta.env.VITE_API_URL || "";
    if (apiBase) {
      fetch(apiBase + '/api/nfc/' + token)
        .then(r=> r.json().then(j=> ({ok:r.ok, body:j})))
        .then(res=> {
          if (!res.ok) setErr(res.body.error || 'Error')
          else setData(res.body)
        }).catch(e=>{
          console.warn("Backend fetch failed, falling back to localStorage", e);
          fallback();
        })
    } else {
      fallback();
    }

    function fallback(){
      try {
        const tokens = JSON.parse(localStorage.getItem("findme_tokens") || "{}");
        const mapping = tokens[token];
        if (!mapping) {
          setErr("Token no encontrado o vencido.");
          return;
        }
        if (mapping.expires_at && Date.now() > mapping.expires_at) {
          setErr("Token vencido.");
          // Optionally delete it
          delete tokens[token];
          localStorage.setItem("findme_tokens", JSON.stringify(tokens));
          return;
        }
        const profiles = JSON.parse(localStorage.getItem("findme_profiles") || "{}");
        const profile = profiles[mapping.profile_id];
        if (!profile) {
          setErr("Perfil no encontrado.");
          return;
        }
        setData(profile);
      } catch (e) {
        setErr("Error leyendo datos locales.");
      }
    }
  },[token])

  if (err) return <div className="container"><h2>Error</h2><p>{err}</p></div>
  if (!data) return <div className="container"><p>Cargando...</p></div>

  return (
    <div className="container">
      <h2>Ficha: {data.full_name}</h2>
      <p><b>Alergias:</b> {data.allergies || 'N/A'}</p>
      <p><b>Contacto:</b> {data.contact_number || 'N/A'}</p>
      <p><b>Email:</b> {data.email || 'N/A'}</p>
      <p><b>Notas:</b> {data.medical_notes || 'N/A'}</p>
      {data.last_lat && data.last_lng &&
        <p><a className="link" href={`https://www.google.com/maps/search/?api=1&query=${data.last_lat},${data.last_lng}`} target="_blank" rel="noreferrer">Ver ubicación en Google Maps</a></p>
      }
    </div>
  )
}
