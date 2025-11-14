import './App.css'
import AuthShell from './components/auth/AuthShell'
import AppLayout from './components/layout/AppLayout'
import AdminDashboard from './views/AdminDashboard'
import StudentDashboard from './views/StudentDashboard'
import { useAuth } from './context/AuthContext'

const App = () => {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <AuthShell />
  }

  return (
    <AppLayout>
      {currentUser.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </AppLayout>
  )
}

export default App
