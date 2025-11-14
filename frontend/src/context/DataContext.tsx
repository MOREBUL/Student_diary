import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  StudentImportRow,
  StudentProfile,
} from '../types'

interface CreateStudentPayload {
  firstName: string
  lastName: string
  email: string
  studentId: string
  group: string
  status?: StudentProfile['status']
  note?: string
  userId?: string
}

interface UpdateStudentPayload extends Partial<CreateStudentPayload> {}

interface CreateSessionPayload {
  discipline: string
  group: string
  date: string
  timeslot: string
  instructor?: string
  notes?: string
}

interface DataContextValue {
  students: StudentProfile[]
  sessions: AttendanceSession[]
  addStudent: (payload: CreateStudentPayload) => void
  updateStudent: (id: string, payload: UpdateStudentPayload) => void
  deleteStudent: (id: string) => void
  bulkDeleteStudents: (ids: string[]) => void
  bulkUpdateStudents: (ids: string[], payload: UpdateStudentPayload) => void
  importStudents: (rows: StudentImportRow[]) => number
  createSession: (payload: CreateSessionPayload) => void
  deleteSession: (sessionId: string) => void
  updateAttendance: (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    reason?: string,
  ) => void
}

const defaultStudents: StudentProfile[] = [
  {
    id: 'stu-1',
    userId: 'student-1',
    firstName: 'Анна',
    lastName: 'Лебедева',
    fullName: 'Анна Лебедева',
    email: 'a.lebedeva@misis.ru',
    studentId: '21БПМ101',
    group: 'БПМ-21-1',
    status: 'active',
    note: 'Староста группы',
  },
  {
    id: 'stu-2',
    firstName: 'Максим',
    lastName: 'Гордеев',
    fullName: 'Максим Гордеев',
    email: 'm.gordeev@misis.ru',
    studentId: '21БПМ102',
    group: 'БПМ-21-1',
    status: 'active',
  },
  {
    id: 'stu-3',
    firstName: 'Дарья',
    lastName: 'Фомина',
    fullName: 'Дарья Фомина',
    email: 'd.fomina@misis.ru',
    studentId: '21БПМ103',
    group: 'БПМ-21-2',
    status: 'active',
  },
]

const defaultSessions: AttendanceSession[] = [
  {
    id: 'session-1',
    discipline: 'Алгоритмы и структуры данных',
    group: 'БПМ-21-1',
    date: new Date().toISOString().slice(0, 10),
    timeslot: '08:30 — 10:05',
    instructor: 'Проф. И. А. Сафронов',
    notes: 'Контрольная работа',
    records: [
      { studentId: 'stu-1', status: 'present' },
      { studentId: 'stu-2', status: 'absent', reason: 'Болезнь' },
    ],
  },
]

const DataContext = createContext<DataContextValue | undefined>(undefined)

const composeFullName = (firstName: string, lastName: string) =>
  `${firstName.trim()} ${lastName.trim()}`.trim()

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useLocalStorage<StudentProfile[]>(
    'misis.students',
    defaultStudents,
  )
  const [sessions, setSessions] = useLocalStorage<AttendanceSession[]>(
    'misis.sessions',
    defaultSessions,
  )

  const addStudent = (payload: CreateStudentPayload) => {
    const id = crypto.randomUUID()
    const student: StudentProfile = {
      id,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      fullName: composeFullName(payload.firstName, payload.lastName),
      email: payload.email.trim().toLowerCase(),
      studentId: payload.studentId.trim(),
      group: payload.group.trim(),
      status: payload.status ?? 'active',
      note: payload.note?.trim(),
      userId: payload.userId,
    }
    setStudents([...students, student])
  }

  const updateStudent = (id: string, payload: UpdateStudentPayload) => {
    setStudents(
      students.map((student) =>
        student.id === id
          ? {
              ...student,
              ...payload,
              firstName: payload.firstName?.trim() ?? student.firstName,
              lastName: payload.lastName?.trim() ?? student.lastName,
              fullName: composeFullName(
                payload.firstName ?? student.firstName,
                payload.lastName ?? student.lastName,
              ),
              email: payload.email?.trim().toLowerCase() ?? student.email,
              studentId: payload.studentId?.trim() ?? student.studentId,
              group: payload.group?.trim() ?? student.group,
              note: payload.note?.trim() ?? student.note,
            }
          : student,
      ),
    )
  }

  const deleteStudent = (id: string) => {
    setStudents(students.filter((student) => student.id !== id))
    setSessions(
      sessions.map((session) => ({
        ...session,
        records: session.records.filter((record) => record.studentId !== id),
      })),
    )
  }

  const bulkDeleteStudents = (ids: string[]) => {
    setStudents(students.filter((student) => !ids.includes(student.id)))
    setSessions(
      sessions.map((session) => ({
        ...session,
        records: session.records.filter((record) => !ids.includes(record.studentId)),
      })),
    )
  }

  const bulkUpdateStudents = (ids: string[], payload: UpdateStudentPayload) => {
    setStudents(
      students.map((student) =>
        ids.includes(student.id)
          ? {
              ...student,
              ...payload,
              fullName: composeFullName(
                payload.firstName ?? student.firstName,
                payload.lastName ?? student.lastName,
              ),
            }
          : student,
      ),
    )
  }

  const importStudents = (rows: StudentImportRow[]) => {
    const sanitized = rows
      .filter(
        (row) =>
          row.firstName &&
          row.lastName &&
          row.email &&
          row.studentId &&
          row.group,
      )
      .map((row) => ({
        id: crypto.randomUUID(),
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        fullName: composeFullName(row.firstName, row.lastName),
        email: row.email.trim().toLowerCase(),
        studentId: row.studentId.trim(),
        group: row.group.trim(),
        status: row.status ?? 'active',
      }))

    if (!sanitized.length) return 0

    setStudents([...students, ...sanitized])
    return sanitized.length
  }

  const createSession = (payload: CreateSessionPayload) => {
    const groupStudents = students.filter((student) => student.group === payload.group)
    const records: AttendanceRecord[] = groupStudents.map((student) => ({
      studentId: student.id,
      status: 'present',
    }))

    const session: AttendanceSession = {
      id: crypto.randomUUID(),
      discipline: payload.discipline.trim(),
      group: payload.group.trim(),
      date: payload.date,
      timeslot: payload.timeslot,
      instructor: payload.instructor?.trim(),
      notes: payload.notes?.trim(),
      records,
    }

    setSessions([session, ...sessions])
  }

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter((session) => session.id !== sessionId))
  }

  const updateAttendance = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    reason?: string,
  ) => {
    setSessions(
      sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              records: session.records.map((record) =>
                record.studentId === studentId ? { ...record, status, reason } : record,
              ),
            }
          : session,
      ),
    )
  }

  return (
    <DataContext.Provider
      value={{
        students,
        sessions,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkDeleteStudents,
        bulkUpdateStudents,
        importStudents,
        createSession,
        deleteSession,
        updateAttendance,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

