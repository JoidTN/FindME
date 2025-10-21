import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const nav = useNavigate()

  const handle = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})
      })
      const j = await res.json()
      if (!res.ok) return alert(j.error || 'Login failed')
      localStorage.setItem('fm_token', j.token)
      // token payload might contain id in production; for demo, redirect to dashboard
      nav('/dashboard')
    } catch(e){ console.error(e); alert('error') }
  }

  return (
    <div className="container">
      <h2>Iniciar sesión</h2>
      <div style={{marginTop:12}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      </div>
      <div style={{marginTop:8}}>
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
      </div>
      <div style={{marginTop:12}}>
        <button className="button" onClick={handle}>Entrar</button>
      </div>
      <p className="small" style={{marginTop:12}}>Nota: registra usuarios desde el backend o agrega endpoint de registro en el frontend.</p>
    </div>
  )
}
