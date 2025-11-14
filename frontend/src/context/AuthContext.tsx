import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { AuthSession, Role, User } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface LoginPayload {
  email: string
  password: string
  staySignedIn: boolean
  role: Role
}

interface RegisterPayload {
  fullName: string
  email: string
  password: string
  role: Role
  group?: string
  studentId?: string
}

interface AuthResult {
  success: boolean
  message?: string
}

interface AuthContextValue {
  currentUser: User | null
  users: User[]
  login: (payload: LoginPayload) => AuthResult
  register: (payload: RegisterPayload) => AuthResult
  logout: () => void
}

const SESSION_KEY = 'misis.session'

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    role: 'admin',
    fullName: 'Администратор МИСИС',
    email: 'admin@misis.ru',
    password: 'admin1234',
  },
  {
    id: 'student-1',
    role: 'student',
    fullName: 'Анна Лебедева',
    email: 'a.lebedeva@misis.ru',
    password: 'student123',
    group: 'БПМ-21-1',
    studentId: '21БПМ101',
  },
]

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const isBrowser = typeof window !== 'undefined'
  const [users, setUsers] = useLocalStorage<User[]>('misis.users', defaultUsers)

  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      if (!isBrowser) return null
      const raw = window.localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as AuthSession) : null
    } catch {
      return null
    }
  })

  // Обновление имени администратора в существующих данных
  useEffect(() => {
    if (!isBrowser) return
    const adminUser = users.find((u) => u.id === 'admin-1' || u.email === 'admin@misis.ru')
    if (adminUser && adminUser.fullName.includes('МИСиС')) {
      setUsers(
        users.map((u) =>
          u.id === adminUser.id ? { ...u, fullName: 'Администратор МИСИС' } : u,
        ),
      )
    }
  }, [isBrowser, setUsers, users])

  useEffect(() => {
    if (!isBrowser) return
    if (session?.staySignedIn) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(SESSION_KEY)
    }
  }, [isBrowser, session])

  const currentUser = useMemo(
    () => users.find((user) => user.id === session?.userId) ?? null,
    [session, users],
  )

  const login = useCallback(
    ({ email, password, staySignedIn, role }: LoginPayload): AuthResult => {
      const normalizedEmail = email.trim().toLowerCase()
      const candidate = users.find(
        (user) => user.email.toLowerCase() === normalizedEmail && user.role === role,
      )

      if (!candidate) {
        return { success: false, message: 'Пользователь не найден' }
      }

      if (candidate.password !== password) {
        return { success: false, message: 'Неверный пароль' }
      }

      setSession({ userId: candidate.id, staySignedIn })
      if (!staySignedIn && isBrowser) {
        window.localStorage.removeItem(SESSION_KEY)
      }

      return { success: true }
    },
    [isBrowser, users],
  )

  const register = useCallback(
    ({ fullName, email, password, role, group, studentId }: RegisterPayload): AuthResult => {
      const normalizedEmail = email.trim().toLowerCase()

      if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'Пользователь с таким e-mail уже существует' }
      }

      const id = crypto.randomUUID()
      const newUser: User = {
        id,
        role,
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        group: role === 'student' ? group : undefined,
        studentId: role === 'student' ? studentId : undefined,
      }

      setUsers([...users, newUser])
      setSession({ userId: id, staySignedIn: true })

      return { success: true, message: 'Регистрация завершена' }
    },
    [setUsers, users],
  )

  const logout = useCallback(() => {
    setSession(null)
    if (isBrowser) {
      window.localStorage.removeItem(SESSION_KEY)
    }
  }, [isBrowser])

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      users,
      login,
      register,
      logout,
    }),
    [currentUser, users, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

