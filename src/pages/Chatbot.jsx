import React, { useState, useRef, useEffect } from 'react'

export default function Chatbot(){
  const [messages, setMessages] = useState([
    { role: 'system', content: "You're a weather station based on Butuan City." },
    { role: 'assistant', content: "Hi! I’m your Butuan City weather assistant. Ask me about the weather, what to wear, or any local advice!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(()=>{
    if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  },[messages, loading])

  function getRuntimeKey(){
    return import.meta.env.VITE_OPENROUTER_API_KEY || ''
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
      setMessages(m => [...m, { role: 'assistant', content: 'No API key provided. Please set VITE_OPENROUTER_API_KEY in your .env file.' }])
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

  return (
    <div className="chatbot-page" style={{padding:'2rem'}}>
      <h1>Chatbot</h1>
      <p className="subtitle">Ask about weather, sensors, or the system.</p>

      <div className="chat-window card" style={{margin:'1rem auto'}}>
        <div className="chat-list" ref={listRef} style={{overflowY:'auto', padding:12}}>
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

        <form className="chat-input" onSubmit={handleSend}>
          <input placeholder="Type a message..." value={input} onChange={e=>setInput(e.target.value)} disabled={loading || !getRuntimeKey()} />
          <button type="submit" disabled={loading || !getRuntimeKey()}>{loading ? '...' : 'Send'}</button>
        </form>
      </div>
    </div>
  )
}
