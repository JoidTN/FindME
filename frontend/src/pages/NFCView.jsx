import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NFCView(){
  const { token } = useParams()
  const [data,setData] = useState(null)
  const [err,setErr] = useState(null)

  useEffect(()=>{
    fetch(import.meta.env.VITE_API_URL + '/api/nfc/' + token)
      .then(r=> r.json().then(j=> ({ok:r.ok, body:j})))
      .then(res=> {
        if (!res.ok) setErr(res.body.error || 'Error')
        else setData(res.body)
      }).catch(e=> setErr('error'))
  },[token])

  if (err) return <div className="container"><h3>Error: {err}</h3></div>
  if (!data) return <div className="container"><h3>Cargando...</h3></div>

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
