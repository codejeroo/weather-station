import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Maximize2, Send, User, Bot } from 'lucide-react'

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Hello! I\'m MicroClimate.AI. Ask me about weather patterns or climate data!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading])

  function getRuntimeKey() {
    return import.meta.env.VITE_OPENROUTER_API_KEY || ''
  }

  async function handleSend(e) {
    e && e.preventDefault && e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { id: Date.now(), from: 'user', text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    const runtimeKey = getRuntimeKey()
    if (!runtimeKey) {
      setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', text: 'No API key provided. Please set VITE_OPENROUTER_API_KEY in your .env file.' }])
      setLoading(false)
      return
    }

    try {
      const body = {
        model: 'tngtech/deepseek-r1t2-chimera:free',
        messages: nextMessages.map(msg => ({
          role: msg.from === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      }

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${runtimeKey}`
        },
        body: JSON.stringify(body)
      })

      if (!resp.ok) throw new Error(`API error: ${resp.status}`)

      const data = await resp.json()
      const botReply = data?.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that.'

      setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', text: botReply }])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`chat-widget ${isMinimized ? 'minimized' : 'expanded'} ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="chat-widget-header">
        <div className="chat-widget-title">
          <div className="chat-widget-icon">💬</div>
          <div>
            <h3>MicroClimate.AI</h3>
            <p className="status">Always here to help</p>
          </div>
        </div>
        <div className="chat-widget-controls">
          <button
            className="chat-widget-btn fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            <Maximize2 size={18} />
          </button>
          <button
            className="chat-widget-btn minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Messages (only show if not minimized) */}
      {!isMinimized && (
        <>
          <div className="chat-widget-messages" ref={listRef}>
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg ${msg.from}`}>
                <div className="msg-avatar">{msg.from === 'user' ? <User size={20} /> : <Bot size={20} />}</div>
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <div className="msg-avatar"><Bot size={20} /></div>
                <div className="msg-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="chat-widget-input">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type a message..."
              disabled={loading}
              rows="1"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="send-btn"
            >
              {loading ? <span style={{ display: 'inline-block' }}>⏳</span> : <Send size={20} />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
