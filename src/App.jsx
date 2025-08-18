import React, { useState } from 'react'
import Nav from './ui/Nav'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import { useEffect } from 'react'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [authed, setAuthed] = useState(false)

  useEffect(()=>{
    const t = localStorage.getItem('auth_token')
    setAuthed(!!t)
  },[])

  function onAuth(){
    setAuthed(true)
    setPage('dashboard')
  }

  return (
    <div className="app">
      {!authed ? (
        <Auth onAuth={onAuth} />
      ) : (
        <>
          <Nav current={page} onNavigate={setPage} />
          {page === 'dashboard' && <Dashboard />}
          {page === 'chatbot' && <Chatbot />}
          {page === 'settings' && <Settings />}
        </>
      )}
    </div>
  )
}
