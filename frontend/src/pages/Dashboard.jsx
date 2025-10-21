import { useEffect, useState } from 'react'
import NFCWriterButton from '../shared/NFCWriterButton'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [profiles, setProfiles] = useState([])
  const nav = useNavigate()

  const token = localStorage.getItem('fm_token')
  const api = import.meta.env.VITE_API_URL

  useEffect(()=>{
    // demo: no user id extraction, so this fetch will likely fail unless adapted.
    const userId = 'me' // placeholder
    if (!token) { return }
    fetch(api + '/api/users/' + userId + '/profiles', { headers:{ Authorization: 'Bearer ' + token }})
      .then(r=>r.json().then(j=> ({ok:r.ok, body:j})))
      .then(res=> {
        if (!res.ok) { console.error(res.body); return }
        setProfiles(res.body)
      }).catch(e=> console.error(e))
  },[token])

  return (
    <div className="container">
      <h2>Perfiles a cargo</h2>
      <div style={{marginTop:12}}>
        {profiles.length===0 && <p>No hay perfiles cargados (demo). Puedes crear uno con el endpoint POST /api/users/:userId/profiles</p>}
        {profiles.map(p=> (
          <div key={p.id} style={{padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{p.full_name}</div>
                <div className="small">Alergias: {p.allergies || 'N/A'}</div>
              </div>
              <div>
                <button className="button" onClick={()=> nav('/nfc/' + (p.id))}>Generar NFC (demo)</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:20}}>
        <h3>Demo: escribir un link en NFC</h3>
        <p className="small">Genera un link en el backend y pégalo acá (demo usa id de perfil como token)</p>
        <NFCWriterButton url={window.location.origin + '/nfc/demo-token-123'} />
      </div>
    </div>
  )
}
