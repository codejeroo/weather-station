import React from 'react'
import ChatWindow from '../ui/ChatWindow'

export default function Chatbot(){
  return (
    <div className="chatbot-page" style={{padding:'2rem'}}>
      <h1>Chatbot</h1>
      <p className="subtitle">Ask about weather, sensors, or the system.</p>
      <ChatWindow />
    </div>
  )
}
