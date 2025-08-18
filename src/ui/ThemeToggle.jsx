import React from 'react'

export default function ThemeToggle({ theme, setTheme }){
  const isDark = theme === 'dark'

  function toggle(){
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div style={{position:'fixed', right:16, top:16, zIndex:120}}>
      <button onClick={toggle} aria-label="Toggle theme" style={{width:56, height:36, borderRadius:999, border:'none', background:'transparent', padding:6, display:'inline-flex', alignItems:'center', cursor:'pointer'}}>
        <div style={{width:44, height:28, borderRadius:999, background: isDark ? 'linear-gradient(90deg,#0f172a,#374151)' : 'linear-gradient(90deg,#fff,#f3f4f6)', boxShadow:'0 6px 16px rgba(2,6,23,0.08)', position:'relative', transition:'background 220ms'}}>
          <div style={{position:'absolute', top:2, left: isDark ? 22 : 4, width:24, height:24, borderRadius:999, background:isDark ? '#ffd166' : '#0f172a', display:'flex', alignItems:'center', justifyContent:'center', color:isDark ? '#6b2' : '#fff', transform: isDark ? 'translateX(0)' : 'translateX(0)', transition:'left 240ms cubic-bezier(.2,.9,.2,1)'}}>
            {isDark ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 100 12 6 6 0 000-12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>
      </button>
    </div>
  )
}
