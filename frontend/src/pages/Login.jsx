import React, {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
export default function Login(){
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [err,setErr]=useState('')
  const nav = useNavigate()
  const api = import.meta.env.VITE_API_URL || ''

  const submit = async (e)=>{
    e.preventDefault()
    setErr('')
    try{
      const r = await axios.post(api + '/api/login',{ email, password: pass })
      localStorage.setItem('fm_token', r.data.token)
      localStorage.setItem('fm_user', JSON.stringify(r.data.user))
      nav('/app')
    }catch(err){
      setErr('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div style={{maxWidth:420, margin:'60px auto'}}>
      <div className="container">
        <div className="header">
          <div className="logo">FindME</div>
          <div className="small">Prototipo</div>
        </div>
        <h2>Iniciar sesión</h2>
        <form className="form" onSubmit={submit}>
          <input className="input" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          {err && <div className="notice" style={{color:'#ffccd5'}}>{err}</div>}
          <div className="row">
            <button className="button" type="submit">Entrar</button>
            <Link to="/register" className="link">Crear cuenta</Link>
          </div>
        </form>
        <div className="footer">Usa cualquier correo y contraseña para registrarte (prototipo)</div>
      </div>
    </div>
  )
}
