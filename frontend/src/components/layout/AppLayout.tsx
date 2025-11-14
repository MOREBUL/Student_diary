import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { currentUser, logout } = useAuth()

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="toolbar">
          <div className="brand">
            <span>МИСИС</span>
            <strong>Электронный журнал</strong>
          </div>
          <div className="toolbar-actions">
            {currentUser && (
              <>
                <div className="chip">
                  {currentUser.role === 'admin' ? 'Администратор' : 'Студент'} ·{' '}
                  {currentUser.fullName}
                </div>
                <button className="btn btn-outline" onClick={logout}>
                  Выйти из системы
                </button>
              </>
            )}
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}

export default AppLayout

