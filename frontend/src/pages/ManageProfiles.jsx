import React, {useEffect, useState} from 'react'
import axios from 'axios'

export default function ManageProfiles(){
  const api = import.meta.env.VITE_API_URL || ''
  const token = localStorage.getItem('fm_token')
  const [profiles,setProfiles] = useState([])
  const [loading,setLoading] = useState(false)
  const [form,setForm] = useState({name:'', allergies:'', emergency_number:'', emergency_email:'', hospital:'', note:''})
  const [editing,setEditing] = useState(null)
  const [msg,setMsg] = useState('')

  useEffect(()=>{ fetchProfiles() },[])

  const fetchProfiles = async ()=>{
    setLoading(true)
    try{
      const r = await axios.get(api + '/api/profiles', { headers: { Authorization: 'Bearer ' + token } })
      setProfiles(r.data)
    }catch(e){
      setMsg('Error cargando perfiles')
    }finally{ setLoading(false) }
  }

  const save = async ()=>{
    try{
      if(editing){
        const r = await axios.put(api + '/api/profiles/' + editing.id, form, { headers: { Authorization: 'Bearer ' + token } })
        setMsg('Actualizado')
      }else{
        const r = await axios.post(api + '/api/profiles', form, { headers: { Authorization: 'Bearer ' + token } })
        setMsg('Creado')
      }
      setForm({name:'', allergies:'', emergency_number:'', emergency_email:'', hospital:'', note:''})
      setEditing(null)
      fetchProfiles()
    }catch(e){
      setMsg('Error guardando')
    }
  }

  const edit = (p)=>{ setEditing(p); setForm({ name:p.name, allergies:p.allergies, emergency_number:p.emergency_number, emergency_email:p.emergency_email, hospital:p.hospital, note:p.note }) }
  const remove = async (id)=>{ if(!confirm('Eliminar ficha?')) return; await axios.delete(api + '/api/profiles/' + id, { headers: { Authorization: 'Bearer ' + token } }); fetchProfiles() }

  return (
    <div style={{maxWidth:980, margin:'24px auto'}}>
      <div className="container">
        <div className="topbar"><div className="logo">Administrar fichas</div></div>
        <div style={{marginTop:12}}>
          <div style={{display:'flex', gap:12}}>
            <input className="input" placeholder="Buscar..." />
            <button className="button" onClick={()=>{ setEditing(null); setForm({name:'',allergies:'',emergency_number:'',emergency_email:'',hospital:'',note:''}) }}>Agregar</button>
            <button className="button" onClick={fetchProfiles}>Actualizar</button>
          </div>

          <div style={{marginTop:12}}>
            <div className="small">Formulario</div>
            <div style={{display:'grid',gap:8, marginTop:8}}>
              <input className="input" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              <input className="input" placeholder="Alergias" value={form.allergies} onChange={e=>setForm({...form,allergies:e.target.value})} />
              <input className="input" placeholder="Número de emergencia" value={form.emergency_number} onChange={e=>setForm({...form,emergency_number:e.target.value})} />
              <input className="input" placeholder="Correo de emergencia" value={form.emergency_email} onChange={e=>setForm({...form,emergency_email:e.target.value})} />
              <input className="input" placeholder="Hospital" value={form.hospital} onChange={e=>setForm({...form,hospital:e.target.value})} />
              <textarea className="input" placeholder="Nota extra" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} rows={3} />
              <div style={{display:'flex',gap:8}}>
                <button className="button" onClick={save}>{editing? 'Guardar cambios':'Crear ficha'}</button>
                {editing && <button className="button" style={{background:'#ef4444'}} onClick={()=>{ setEditing(null); setForm({name:'',allergies:'',emergency_number:'',emergency_email:'',hospital:'',note:''}) }}>Cancelar</button>}
              </div>
              {msg && <div className="notice">{msg}</div>}
            </div>
          </div>

          <div style={{marginTop:18}}>
            <table className="table">
              <thead><tr><th>Nombre</th><th>Alergias</th><th>Tel emergencia</th><th>Acciones</th></tr></thead>
              <tbody>
                {profiles.map(p=>(
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.allergies}</td>
                    <td>{p.emergency_number}</td>
                    <td className="actions">
                      <button className="button" onClick={()=>edit(p)}>Editar</button>
                      <button className="button" style={{background:'#ef4444'}} onClick={()=>remove(p.id)}>Eliminar</button>
                      <button className="button" onClick={()=>navigator.clipboard.writeText(window.location.origin + '/app/upload?profile=' + p.id)}>Copiar link</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
