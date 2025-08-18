import React, { useState, useRef, useEffect } from 'react'

const LOCAL_KEY = 'openrouter_api_key'

export default function Chatbot(){
  const [messages, setMessages] = useState([
    { role: 'system', content: "You're a weather station based on Butuan City." },
    { role: 'assistant', content: "Hi! I’m your Butuan City weather assistant. Ask me about the weather, what to wear, or any local advice!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LOCAL_KEY) || (import.meta.env.VITE_OPENROUTER_API_KEY || ''))
  const [saved, setSaved] = useState(() => !!localStorage.getItem(LOCAL_KEY))
  const listRef = useRef(null)

  useEffect(()=>{
    if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  },[messages, loading])

  function saveKey(){
    try{
      if(apiKey){
        localStorage.setItem(LOCAL_KEY, apiKey)
        setSaved(true)
      }
    }catch(e){
      console.error('Could not save key', e)
    }
  }

  function clearKey(){
    try{
      localStorage.removeItem(LOCAL_KEY)
      setSaved(false)
      setApiKey('')
    }catch(e){
      console.error('Could not clear key', e)
    }
  }

  function getRuntimeKey(){
    return localStorage.getItem(LOCAL_KEY) || apiKey || import.meta.env.VITE_OPENROUTER_API_KEY || ''
  }

  async function handleSend(e, forcedText){
    e && e.preventDefault && e.preventDefault()
    const raw = (typeof forcedText === 'string') ? forcedText : input
    const text = raw.trim()
  if(!text || loading) return

  const userMsg = { role: 'user', content: text }
  const nextMessages = [...messages, userMsg]
  setMessages(nextMessages)
  // always clear the input after sending
  setInput('')
  setLoading(true)

    const runtimeKey = getRuntimeKey()
    if(!runtimeKey){
      setMessages(m => [...m, { role: 'assistant', content: 'No API key provided. Please enter and save your OpenRouter API key.' }])
      setLoading(false)
      return
    }

    try{
      const body = { model: 'tngtech/deepseek-r1t2-chimera:free', messages: nextMessages }

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${runtimeKey}`
        },
        body: JSON.stringify(body)
      })

      if(!resp.ok) throw new Error(`API error ${resp.status}`)
      const data = await resp.json().catch(() => null)

      // robust extraction of assistant text
      let assistantText = ''
      const choice = data && data.choices && data.choices[0]
      if(choice){
        if(choice.message){
          if(typeof choice.message === 'string') assistantText = choice.message
          else if(typeof choice.message.content === 'string') assistantText = choice.message.content
          else if(Array.isArray(choice.message.content)) assistantText = choice.message.content.map(c=>c.text||c).join(' ')
          else if(choice.message.content && choice.message.content.text) assistantText = choice.message.content.text
        }
        assistantText = assistantText || choice.text || ''
      }

      if(!assistantText){
        assistantText = (data && (data.reply || data.text)) || 'No response.'
      }

      setMessages(m => [...m, { role: 'assistant', content: String(assistantText) }])
    }catch(err){
      console.error(err)
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I could not reach the chat service.' }])
    }finally{
      setLoading(false)
    }
  }

  const quickActions = [
    { label: '☀ Today\'s forecast', prompt: 'What is today\'s weather forecast for Butuan City?'} ,
    { label: '🌧 Rain alerts', prompt: 'Are there any rain alerts for Butuan City today?'} ,
    { label: '👕 What to wear', prompt: 'What should I wear today in Butuan City based on the weather?'}
  ]

  function onQuick(action){
    if(loading) return
    // set the input visually, and send immediately
    setInput(action.prompt)
    // small timeout to ensure UI updates, then send
    setTimeout(()=>handleSend(null, action.prompt), 50)
  }

  const masked = saved ? '•'.repeat(8) : apiKey ? apiKey : ''

  return (
    <div className="chatbot-page" style={{padding:'2rem'}}>
      <h1>Chatbot</h1>
      <p className="subtitle">Ask about weather, sensors, or the system.</p>

      <div style={{maxWidth:760, margin:'0 auto 1rem'}}>
        <label style={{display:'block', fontSize:13, marginBottom:6}}>OpenRouter API Key (client-side only)</label>
        <div style={{display:'flex', gap:8}}>
          <input style={{flex:1, padding:'8px 10px'}} value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Paste your OpenRouter API key here" />
          <button onClick={saveKey} type="button" style={{padding:'8px 12px'}} disabled={!apiKey}>Save</button>
          <button onClick={clearKey} type="button" style={{padding:'8px 12px'}} disabled={!apiKey && !saved}>Clear</button>
        </div>
        <div style={{fontSize:12, color:'var(--muted)', marginTop:6}}>
          {saved ? <>Saved key: <strong style={{fontFamily:'monospace'}}>{masked}</strong></> : <>Not saved. You can save the key to localStorage for convenience.</>}
        </div>
      </div>

  <div className="chat-window card" style={{maxWidth:760, margin:'1rem auto'}}>
  <div className="chat-list" ref={listRef} style={{maxHeight:360, overflowY:'auto', padding:12}}>
          {messages.map((m, i) => {
            if(m.role === 'system'){
              return <div key={i} className="chat-row system"><div className="bubble" style={{background:'transparent', color:'var(--muted)', textAlign:'center'}}>{m.content}</div></div>
            }
            const cls = m.role === 'user' ? 'user' : 'bot'
            return (
              <div key={i} className={`chat-row ${cls}`}>
                <div className="avatar">{cls === 'user' ? 'U' : 'B'}</div>
                <div className="bubble">{m.content}</div>
              </div>
            )
          })}

          {loading && (
            <div className={`chat-row bot typing`}>
              <div className="avatar">B</div>
              <div className="bubble"><span className="typing-dots"><span></span><span></span><span></span></span></div>
            </div>
          )}
        </div>
          {/* Quick Actions (above input) */}
            <div className="quick-actions-bar" style={{display:'flex', gap:8, flexWrap:'wrap', padding:'6px 12px', marginTop:8, alignItems:'center', borderRadius:8, backdropFilter:'blur(6px)'}}>
              {quickActions.map((a, idx) => (
                <button key={idx} className="quick-action-btn" onClick={()=>onQuick(a)} type="button" style={{padding:'8px 10px', borderRadius:8, cursor:'pointer', opacity:0.95}}>
                  {a.label}
                </button>
              ))}
            </div>

          <form className="chat-input" onSubmit={handleSend} style={{display:'flex', gap:8, padding:12}}>
          <input placeholder="Type a message..." value={input} onChange={e=>setInput(e.target.value)} disabled={loading || !getRuntimeKey()} style={{flex:1, padding:'10px'}} />
          <button type="submit" disabled={loading || !getRuntimeKey()} style={{padding:'10px 14px'}}>{loading ? '...' : 'Send'}</button>
        </form>
      </div>
    </div>
  )
}
