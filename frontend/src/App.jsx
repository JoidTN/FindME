import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NFCView from './pages/NFCView'
import Register from './pages/Register'
import CreateProfile from "./pages/CreateProfile";

export default function App(){
  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="nav-container">
          <Link to="/" className="logo">FindMe</Link>
          <nav className="menu">
            <Link to="/">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
            <Link to="/dashboard">Panel</Link>
            <a 
              className="findlink" 
              href="https://www.google.com/android/find" 
              target="_blank" 
              rel="noreferrer"
            >
              Google Find My Device
            </a>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/nfc/:token" element={<NFCView/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/crear-perfil" element={<CreateProfile userId={1} />} />
      </Routes>
    </BrowserRouter>
  )
}
