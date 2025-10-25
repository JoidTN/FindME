import React, {useEffect, useState} from 'react'
import axios from 'axios'
export default function UploadToDevice(){
  const api = import.meta.env.VITE_API_URL || ''
  const token = localStorage.getItem('fm_token')
  const [profiles,setProfiles] = useState([])
  const [sel,setSel] = useState('')
  const [msg,setMsg] = useState('')

  useEffect(()=>{ fetchProfiles() },[])

  async function fetchProfiles(){
    try{
      const r = await axios.get(api + '/api/profiles', { headers: { Authorization: 'Bearer ' + token } })
      setProfiles(r.data)
    }catch(e){
      setMsg('Error cargando')
    }
  }

  async function subir(){
    if(!sel) return setMsg('Selecciona una ficha')
    setMsg('Subiendo...')
    try{
      const r = await axios.post(api + '/api/upload-nfc/' + sel, {}, { headers: { Authorization: 'Bearer ' + token } })
      setMsg('✅ Subido correctamente')
    }catch(e){
      setMsg('Error al subir')
    }
  }

  return (
    <div style={{maxWidth:780, margin:'24px auto'}}>
      <div className="container">
        <div className="topbar"><div className="logo">Subir al dispositivo</div></div>
        <div style={{marginTop:12}}>
          <div className="small">Selecciona la ficha a subir:</div>
          <select className="input" value={sel} onChange={e=>setSel(e.target.value)}>
            <option value="">-- seleccionar --</option>
            {profiles.map(p=> <option key={p.id} value={p.id}>{p.name} — {p.emergency_number || p.emergency_email}</option>)}
          </select>
          <div style={{marginTop:12}} className="row">
            <button className="button" onClick={subir}>Subir</button>
            <button className="button" onClick={()=>navigator.clipboard.writeText('perfil:'+sel)}>Copiar</button>
          </div>
          {msg && <div className="notice" style={{marginTop:10}}>{msg}</div>}
        </div>
      </div>
    </div>
  )
}
