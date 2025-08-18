import React, { useState } from 'react'

export default function Auth({ onAuth }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  async function submit(e){
    e.preventDefault()
    setError(null)
    if(!email || !password) return setError('Please enter email and password')

    // placeholder auth: accept any credentials, store token
    try{
      localStorage.setItem('auth_token','demo-token')
      onAuth && onAuth()
    }catch(err){
      setError('Failed to sign in')
    }
  }

  return (
    <div className="auth-page">
        <h1>Welcome to Weather Station</h1>
      <div className="auth-card card">
        <h2>Sign in</h2>
        <p className="subtitle">Welcome back — sign in to continue.</p>

        <form onSubmit={submit} className="auth-form">
          <label className="field">
            <div className="field-label">Email</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </label>

          <label className="field">
            <div className="field-label">Password</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </label>

          {error && <div className="form-error">{error}</div>}

          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button className="btn primary" type="submit">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  )
}
