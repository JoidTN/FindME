import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
export default function Dashboard(){
  const nav = useNavigate()
  const user = JSON.parse(localStorage.getItem('fm_user')||'null')
  const logout = ()=>{ localStorage.removeItem('fm_token'); localStorage.removeItem('fm_user'); nav('/') }

  return (
    <div style={{maxWidth:980, margin:'24px auto'}}>
      <div className="container">
        <div className="topbar">
          <div className="logo">FindME</div>
          <div className="row">
            <div className="small">Hola, {user?.name || user?.email}</div>
            <button className="button" onClick={logout} style={{marginLeft:12}}>Cerrar sesión</button>
          </div>
        </div>

        <h2 style={{marginTop:12}}>¿Qué quieres hacer?</h2>

        <div className="grid">
          <div className="card" onClick={()=>nav('/app/manage')}>
            <h3>👥 Administrar personas a cargo</h3>
            <p className="small">Agregar, editar, eliminar y actualizar fichas.</p>
          </div>

          <div className="card" onClick={()=>nav('/app/upload')}>
            <h3>📲 Subir al dispositivo</h3>
            <p className="small">Selecciona una ficha para subir al NFC (simulado).</p>
          </div>

          <div className="card" onClick={()=>window.open('https://www.google.com/android/find','_blank')}>
            <h3>📍 Ver ubicación</h3>
            <p className="small">Ir a Google Find My Device.</p>
          </div>

          <div className="card" onClick={logout}>
            <h3>🚪 Cerrar sesión</h3>
            <p className="small">Salir de la aplicación.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
