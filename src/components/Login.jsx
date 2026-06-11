import React, { useState } from 'react'
import { PORTAL_PASSWORD } from '../storage.js'

export default function Login({ onSuccess }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (pw === PORTAL_PASSWORD) onSuccess()
    else setErr(true)
  }

  return (
    <div className="login-page">
      <header className="topbar">
        <span className="wordmark">Brand Portal</span>
      </header>
      <form className="login-body" onSubmit={submit}>
        <h1>Welcome to the Brand Portal</h1>
        <input
          type="password" autoFocus value={pw}
          placeholder="Enter portal password"
          onChange={(e) => { setPw(e.target.value); setErr(false) }}
        />
        {err && <div className="login-error">Incorrect password. Try again.</div>}
        <button className="login-btn" type="submit">Enter portal</button>
      </form>
    </div>
  )
}
