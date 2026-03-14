import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { navigate } from '../utils/router'

export function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()

    const ok = login(form.username.trim(), form.password)
    if (!ok) {
      setError('Invalid credentials. Hint: testuser / Test123')
      return
    }

    setError('')
    navigate('/list')
  }

  return (
    <section className="card login-card">
      <h2>Secure Login</h2>
      <p>Use the assignment credentials to continue.</p>
      <form onSubmit={submit} className="login-form">
        <label>
          Username
          <input
            value={form.username}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, username: event.target.value }))
            }
            autoComplete="username"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, password: event.target.value }))
            }
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="error">{error}</p> : null}
        <button type="submit">Login</button>
      </form>
    </section>
  )
}
