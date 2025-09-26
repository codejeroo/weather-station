import React, { useState } from 'react'
import { supabase } from '../supabaseClient'  // Import the client

export default function Nav({ current, onNavigate }) {
  const [open, setOpen] = useState(false)
  const links = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'chatbot', label: 'Chatbot' },
    { key: 'contact', label: 'Contact' },
    { key: 'settings', label: 'Settings' }
    
  ]

  function handleClick(key) {
    setOpen(false)
    onNavigate && onNavigate(key)
  }

  async function handleLogout() {
    setOpen(false)
    await supabase.auth.signOut()
  }

  return (
    <>
      <button className="nav-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        ☰
      </button>

      <nav className={`slide-nav ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="nav-inner">
          <div className="nav-brand">MicroClimate.AI</div>
          <ul className="nav-list">
            {links.map(l => (
              <li key={l.key} className="nav-item"><a href="#" onClick={(e) => { e.preventDefault(); handleClick(l.key) }} className={current===l.key? 'active':''}>{l.label}</a></li>
            ))}
            <li className="nav-item"><a href="#" onClick={(e) => { e.preventDefault(); handleLogout() }}>Logout</a></li>
          </ul>
        </div>
      </nav>
      {/* overlay */}
      <div className={`nav-backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
    </>
  )
}
