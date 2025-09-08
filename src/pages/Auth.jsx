import React, { useState, useEffect } from 'react'

export default function Auth({ onAuth }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // load a nicer font for the title (client-only)
  useEffect(()=>{
    if(typeof document !== 'undefined' && !document.getElementById('poppins-font')){
      const l = document.createElement('link')
      l.id = 'poppins-font'
      l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'
      document.head.appendChild(l)
    }
  }, [])

  async function submit(e){
    e.preventDefault()
    setError(null)
    if(!email || !password) return setError('Please enter email and password')

    setLoading(true)
    try{
      // small fake delay to show loading animation
      await new Promise(r => setTimeout(r, 700))
      localStorage.setItem('auth_token','demo-token')
      onAuth && onAuth()
    }catch(err){
      setError('Failed to sign in')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh', padding:'2rem'}}>
      <div className="auth-header">
        <div style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:68, height:68, borderRadius:16, margin:'0 auto 12px', background:'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.06))'}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color:'var(--accent)'}}>
            <path d="M20 18.5a3.5 3.5 0 0 0 .5-6.974A5 5 0 0 0 7 8.5 4.5 4.5 0 0 0 7.5 17h12.5z" fill="currentColor" opacity="0.95" />
            <path d="M7.5 17H20a3 3 0 0 0 0-6h-.5" stroke="rgba(0,0,0,0.06)" strokeWidth="0" />
          </svg>
        </div>
        <h1 style={{fontFamily:"'Poppins', system-ui, Inter, sans-serif", fontSize:32, margin:0, letterSpacing:0.2}}>Weather Station</h1>
        <div style={{color:'var(--muted)', marginTop:8}}>Local weather and station assistant</div>
      </div>

      <div className="auth-card card" style={{width:420, padding:'30px 24px', borderRadius:12, boxShadow:'0 8px 30px rgba(16,24,40,0.08)'}}>
        <h2 style={{marginTop:0, marginBottom:6}}>Sign in</h2>
  <p className="subtitle" style={{marginTop:0, marginBottom:18}}>Welcome back — sign in to continue.</p>

  <form onSubmit={submit} className="auth-form" style={{marginTop:6}}>
          <label className="field" style={{display:'block', marginBottom:12}}>
            <div className="field-label" style={{marginBottom:6, fontSize:13}}>Email</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e6e9ef'}} />
          </label>

          <label className="field" style={{display:'block', marginBottom:12}}>
            <div className="field-label" style={{marginBottom:6, fontSize:13}}>Password</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e6e9ef'}} />
          </label>

          {error && <div className="form-error" style={{color:'var(--danger)', marginBottom:8}}>{error}</div>}

          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button className="btn primary" type="submit" disabled={loading} style={{flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8}}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 50 50" aria-hidden style={{display:'inline-block'}}>
                    <g transform="translate(25,25)">
                      <g>
                        <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
                        <path d="M20 0 A20 20 0 0 1 0 20" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round">
                          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1s" repeatCount="indefinite" />
                        </path>
                      </g>
                    </g>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
