import './App.css'
import { AppShell } from './components/AppShell'
import { AppDataProvider } from './context/AppDataContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { DetailsPage } from './pages/DetailsPage'
import { ListPage } from './pages/ListPage'
import { LoginPage } from './pages/LoginPage'
import { navigate } from './utils/router'
import { usePathname } from './utils/usePathname'

function RouterView() {
  const path = usePathname()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated && path !== '/login') {
    navigate('/login')
    return null
  }

  if (isAuthenticated && (path === '/' || path === '/login')) {
    navigate('/list')
    return null
  }

  if (path === '/login') {
    return (
      <AppShell path={path}>
        <LoginPage />
      </AppShell>
    )
  }

  if (path === '/list') {
    return (
      <AppShell path={path}>
        <ListPage />
      </AppShell>
    )
  }

  if (path.startsWith('/details/')) {
    const employeeId = path.split('/details/')[1]
    return (
      <AppShell path={path}>
        <DetailsPage employeeId={employeeId} />
      </AppShell>
    )
  }

  if (path === '/analytics') {
    return (
      <AppShell path={path}>
        <AnalyticsPage />
      </AppShell>
    )
  }

  return (
    <AppShell path={path}>
      <section className="card">
        <h2>Page not found</h2>
        <button type="button" onClick={() => navigate('/list')}>
          Go to employee list
        </button>
      </section>
    </AppShell>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <RouterView />
      </AppDataProvider>
    </AuthProvider>
  )
}

export default App
