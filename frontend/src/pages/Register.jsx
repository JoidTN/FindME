import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
export default function Register(){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [msg,setMsg]=useState('')
  const nav = useNavigate()
  const api = import.meta.env.VITE_API_URL || ''

  const submit = async (e)=>{
    e.preventDefault()
    setMsg('')
    try{
      await axios.post(api + '/api/register',{ name, email, password: pass })
      setMsg('Cuenta creada. Puedes iniciar sesión.')
      setTimeout(()=>nav('/'),800)
    }catch(err){
      setMsg('Error al crear cuenta')
    }
  }

  return (
    <div style={{maxWidth:420, margin:'60px auto'}}>
      <div className="container">
        <div className="header"><div className="logo">FindME</div></div>
        <h2>Crear cuenta</h2>
        <form className="form" onSubmit={submit}>
          <input className="input" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          {msg && <div className="notice">{msg}</div>}
          <div className="row"><button className="button" type="submit">Registrar</button></div>
        </form>
      </div>
    </div>
  )
}
