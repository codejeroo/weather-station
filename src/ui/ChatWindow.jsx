import React, { useState, useRef, useEffect } from 'react'

export default function ChatWindow(){
  const [messages, setMessages] = useState([
    { id:1, from: 'bot', text: 'Hello! Ask me about the weather.' }
  ])
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(()=>{
    if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  },[messages, loading])

  function send(){
    if(!value.trim() || loading) return
    const user = { id: Date.now(), from: 'user', text: value }
    setMessages(m => [...m, user])
    setValue('')
    setLoading(true)

    // call placeholder API endpoint /chat
    (async () => {
      try {
        const resp = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: user.text })
        })

        if (!resp.ok) throw new Error(`Server error: ${resp.status}`)

        const data = await resp.json().catch(() => null)
        const botText = data && (data.reply || data.text) ? (data.reply || data.text) : 'No response.'

        setMessages(m => [...m, { id: Date.now()+1, from: 'bot', text: String(botText) }])
      } catch (err) {
        console.error('chat error', err)
        setMessages(m => [...m, { id: Date.now()+1, from: 'bot', text: 'Sorry, I could not reach the chat service.' }])
      } finally {
        setLoading(false)
      }
    })()
  }

  function onKey(e){ if(e.key === 'Enter') send() }

  return (
    <div className="chat-window card">
      <div className="chat-list" ref={listRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`chat-row ${msg.from==='user'? 'user':'bot'}`}>
            <div className="avatar">{msg.from==='user'? 'U':'B'}</div>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className={`chat-row bot typing`}>
            <div className="avatar">B</div>
            <div className="bubble">
              <span className="typing-dots"><span></span><span></span><span></span></span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input placeholder="Type a message..." value={value} onChange={e=>setValue(e.target.value)} onKeyDown={onKey} disabled={loading} />
        <button onClick={send} disabled={loading}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  )
}
