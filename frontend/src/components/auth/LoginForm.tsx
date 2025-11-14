import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../types'

interface LoginFormProps {
  switchToRegister: () => void
}

const LoginForm = ({ switchToRegister }: LoginFormProps) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@misis.ru')
  const [password, setPassword] = useState('admin1234')
  const [role, setRole] = useState<Role>('admin')
  const [staySignedIn, setStaySignedIn] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = login({ email, password, staySignedIn, role })
    if (!result.success) {
      setMessage(result.message ?? 'Ошибка авторизации')
    } else {
      setMessage(null)
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div>
        <h2>С возвращением!</h2>
        <p className="panel-subtitle">
          Используйте выданные данные для входа или зарегистрируйтесь.
        </p>
      </div>

      <div className="input-group">
        <label htmlFor="login-role">Тип входа</label>
        <select
          id="login-role"
          className="select"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="admin">Администратор</option>
          <option value="student">Студент</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="login-email">E-mail</label>
        <input
          id="login-email"
          className="input"
          placeholder="name@misis.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="login-password">Пароль</label>
        <input
          id="login-password"
          type="password"
          className="input"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="checkbox-row">
        <input
          id="stay-signed"
          type="checkbox"
          checked={staySignedIn}
          onChange={(e) => setStaySignedIn(e.target.checked)}
        />
        <label htmlFor="stay-signed">Оставаться в системе</label>
      </div>

      {message && (
        <div className="chip" style={{ background: 'rgba(214,69,69,0.12)', color: '#d64545' }}>
          {message}
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        Войти
      </button>

      <p className="panel-subtitle">
        Впервые в системе?{' '}
        <button type="button" className="button-link" onClick={switchToRegister}>
          Зарегистрироваться
        </button>
      </p>
    </form>
  )
}

export default LoginForm

