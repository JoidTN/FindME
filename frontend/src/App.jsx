import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NFCView from './pages/NFCView'

export default function App(){
  return (
    <BrowserRouter>
      <header className="topbar">
        <Link to="/"><div className="logo">FindMe</div></Link>
        <a className="findlink" href="https://www.google.com/android/find" target="_blank" rel="noreferrer">Google Find My Device</a>
      </header>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/nfc/:token" element={<NFCView/>}/>
      </Routes>
    </BrowserRouter>

    import Register from './pages/Register';

  )
}
