import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../types'

interface RegisterFormProps {
  switchToLogin: () => void
}

const RegisterForm = ({ switchToLogin }: RegisterFormProps) => {
  const { register } = useAuth()
  const [role, setRole] = useState<Role>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [group, setGroup] = useState('')
  const [studentId, setStudentId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (password.length < 6) {
      setMessage('Пароль должен содержать минимум 6 символов')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Пароли не совпадают')
      return
    }

    const result = register({
      role,
      fullName,
      email,
      password,
      group,
      studentId,
    })

    if (!result.success) {
      setSuccess(false)
      setMessage(result.message ?? 'Не удалось зарегистрироваться')
    } else {
      setSuccess(true)
      setMessage(result.message ?? 'Регистрация завершена')
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setGroup('')
      setStudentId('')
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div>
        <h2>Создать профиль</h2>
        <p className="panel-subtitle">
          Зарегистрируйтесь как студент или администратор системы.
        </p>
      </div>

      <div className="input-group">
        <label htmlFor="register-role">Роль в системе</label>
        <select
          id="register-role"
          className="select"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="student">Студент</option>
          <option value="admin">Администратор</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="register-name">ФИО</label>
        <input
          id="register-name"
          className="input"
          placeholder="Полное имя"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="register-email">Корпоративный e-mail</label>
        <input
          id="register-email"
          className="input"
          placeholder="name@misis.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {role === 'student' && (
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="register-group">Группа</label>
            <input
              id="register-group"
              className="input"
              placeholder="БПМ-21-1"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="register-studentid">Номер зачетки</label>
            <input
              id="register-studentid"
              className="input"
              placeholder="21БПМ101"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="input-group">
          <label htmlFor="register-password">Пароль</label>
          <input
            id="register-password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="register-repeat">Повторите пароль</label>
          <input
            id="register-repeat"
            type="password"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div
          className="chip"
          style={{
            background: success ? 'rgba(28,156,124,0.15)' : 'rgba(214,69,69,0.12)',
            color: success ? 'var(--success)' : 'var(--danger)',
          }}
        >
          {message}
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        Создать аккаунт
      </button>

      <p className="panel-subtitle">
        Уже есть учетная запись?{' '}
        <button type="button" className="button-link" onClick={switchToLogin}>
          Войти
        </button>
      </p>
    </form>
  )
}

export default RegisterForm

