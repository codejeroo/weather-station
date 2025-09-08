import React, { useState } from 'react'

export default function Contact(){
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e){
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleSubmit(e){
    e.preventDefault()
    // Placeholder: in a real app, send to backend or email service
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000) // Reset after 3 seconds
  }

  return (
    <div className="contact-page" style={{padding:'2rem', maxWidth:800, margin:'0 auto'}}>
      <h1>Contact Developer</h1>
      <p className="subtitle">Get in touch with the developer of this weather station app.</p>

      <div className="contact-form card" style={{marginTop:'2rem', padding:'2rem'}}>
        <h2>Send a Message</h2>
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <label>
            <div style={{marginBottom:'0.5rem'}}>Your Name</div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{width:'100%', padding:'0.75rem', borderRadius:8, border:'1px solid rgba(15,23,42,0.06)'}}
            />
          </label>
          <label>
            <div style={{marginBottom:'0.5rem'}}>Your Email</div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{width:'100%', padding:'0.75rem', borderRadius:8, border:'1px solid rgba(15,23,42,0.06)'}}
            />
          </label>
          <label>
            <div style={{marginBottom:'0.5rem'}}>Message</div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              style={{width:'100%', padding:'0.75rem', borderRadius:8, border:'1px solid rgba(15,23,42,0.06)', resize:'vertical'}}
            />
          </label>
          <button type="submit" style={{padding:'0.75rem 1.5rem', borderRadius:8, background:'var(--accent)', color:'white', border:'none', cursor:'pointer'}}>
            Send Message
          </button>
        </form>
        {submitted && <div style={{marginTop:'1rem', color:'var(--accent)'}}>Thank you! Your message has been sent.</div>}
      </div>

      <div className="developer-info card" style={{marginTop:'2rem', padding:'2rem'}}>
        <h2>About the Developer</h2>
        <p><strong>Name:</strong> Ralph Angelo Gonzaga</p>
        <p><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/ralph-angelo-gonzaga" target="_blank" rel="noopener noreferrer">My LinkedIn</a></p>
        <p><strong>Facebook:</strong> <a href="https://www.facebook.com/angelo.gonzaga0" target="_blank" rel="noopener noreferrer">My Facebook</a></p>
        <p><strong>GitHub:</strong> <a href="https://github.com/codejeroo" target="_blank" rel="noopener noreferrer">My GitHub</a></p>
      </div>
    </div>
  )
}
