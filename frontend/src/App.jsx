import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ManageProfiles from './pages/ManageProfiles'
import UploadToDevice from './pages/UploadToDevice'

function RequireAuth({ children }){
  const token = localStorage.getItem('fm_token')
  if(!token) return <Navigate to="/" replace />
  return children
}

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/app" element={
        <RequireAuth><Dashboard/></RequireAuth>
      } />
      <Route path="/app/manage" element={
        <RequireAuth><ManageProfiles/></RequireAuth>
      } />
      <Route path="/app/upload" element={
        <RequireAuth><UploadToDevice/></RequireAuth>
      } />
    </Routes>
  )
}
