import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const AuthShell = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-info">
          <span className="badge">МИСИС • Электронный журнал</span>
          <h1>
            Посещаемость
            <br />
            под контролем
          </h1>
          <p>
            Отслеживайте занятия, отмечайте студентов, импортируйте списки и делитесь
            статистикой посещаемости в единой системе.
          </p>
          <div className="chips">
            <span className="chip">Импорт списков</span>
            <span className="chip">Отчеты по группам</span>
            <span className="chip">Роли администратор/студент</span>
          </div>
        </div>

        <div className="auth-form">
          <div className="tabs">
            <button
              className={`tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Войти
            </button>
            <button
              className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Регистрация
            </button>
          </div>
          {mode === 'login' ? (
            <LoginForm switchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm switchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthShell

