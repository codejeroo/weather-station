import React, { useState, useEffect } from 'react'

function Switch({ id, checked, onChange, label }){
  return (
    <label className="setting-row">
      <div className="setting-label">{label}</div>
      <div className="setting-control">
        <label className="switch">
          <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
          <span className="slider" />
        </label>
      </div>
    </label>
  )
}

export default function Settings(){
  const [sms, setSms] = useState(false)
  const [email, setEmail] = useState(false)

  useEffect(()=>{
    try{
      const s = localStorage.getItem('settings_sms') === '1'
      const e = localStorage.getItem('settings_email') === '1'
      setSms(s); setEmail(e)
    }catch(e){ }
  },[])

  function onChangeSms(v){ setSms(v); try{ localStorage.setItem('settings_sms', v ? '1' : '0') }catch(e){} }
  function onChangeEmail(v){ setEmail(v); try{ localStorage.setItem('settings_email', v ? '1' : '0') }catch(e){} }

  function logout(){
    try{ localStorage.removeItem('auth_token') }catch(e){}
    // simple visible feedback
    window.location.reload()
  }

  return (
    <div className="settings-page" style={{padding:'2rem'}}>
      <h1>Settings</h1>
      <p className="subtitle">Control alerts and account actions.</p>

      <div className="card settings-panel">
        <Switch id="sms" label="Enable SMS Alerts" checked={sms} onChange={onChangeSms} />
        <Switch id="email" label="Enable Email Alerts" checked={email} onChange={onChangeEmail} />

        <div style={{height:12}} />

        <div className="logout-row">
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  )
}
