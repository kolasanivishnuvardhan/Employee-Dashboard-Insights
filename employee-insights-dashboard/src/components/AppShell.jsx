import { useAuth } from '../context/AuthContext'
import { navigate } from '../utils/router'

const links = [
  { href: '/list', label: 'Employees' },
  { href: '/analytics', label: 'Analytics' },
]

export function AppShell({ children, path }) {
  const { isAuthenticated, username, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Employee Insights Dashboard</h1>
          <p className="subtitle">Performance-focused UI with native browser APIs</p>
        </div>

        {isAuthenticated ? (
          <div className="auth-summary">
            <span>Signed in as {username}</span>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Logout
            </button>
          </div>
        ) : null}
      </header>

      {isAuthenticated ? (
        <nav className="nav-tabs">
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              className={path.startsWith(link.href) ? 'tab active' : 'tab'}
              onClick={() => navigate(link.href)}
            >
              {link.label}
            </button>
          ))}
        </nav>
      ) : null}

      <main>{children}</main>
    </div>
  )
}
