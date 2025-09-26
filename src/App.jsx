import React, { useState } from 'react'
import Nav from './ui/Nav'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import Settings from './pages/Settings'
import Contact from './pages/Contact'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import ThemeToggle from './ui/ThemeToggle'
import { supabase } from './supabaseClient'  // Import the client

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [authed, setAuthed] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [user, setUser] = useState(null)  // Track the authenticated user

  useEffect(() => {
    // Check for existing session on app load
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setAuthed(true)
        setUser(session.user)
      }
    }
    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuthed(true)
        setUser(session.user)
        setPage('dashboard')
      } else {
        setAuthed(false)
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function onAuth() {
    // This can be removed or updated if Auth component handles login directly
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
          {page === 'contact' && <Contact />}
        </>
      )}
    </div>
  )
}
