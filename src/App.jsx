import React, { useState } from 'react'
import Nav from './ui/Nav'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import ThemeToggle from './ui/ThemeToggle'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [authed, setAuthed] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(()=>{
    const t = localStorage.getItem('auth_token')
    setAuthed(!!t)
  },[])

  function onAuth(){
    setAuthed(true)
    setPage('dashboard')
  }

  useEffect(()=>{
    // apply theme class to document root
    if(typeof document !== 'undefined'){
      document.documentElement.classList.toggle('theme-dark', theme === 'dark')
      localStorage.setItem('theme', theme)
    }
  },[theme])

  return (
    <div className="app">
      {!authed ? (
        <Auth onAuth={onAuth} />
      ) : (
        <>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <Nav current={page} onNavigate={setPage} />
          {page === 'dashboard' && <Dashboard />}
          {page === 'chatbot' && <Chatbot />}
          {page === 'settings' && <Settings />}
        </>
      )}
    </div>
  )
}
