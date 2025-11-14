import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

interface PersonalRecord {
  sessionId: string
  discipline: string
  date: string
  group: string
  timeslot: string
  status: 'present' | 'absent' | 'late'
  reason?: string
  instructor?: string
}

const StudentDashboard = () => {
  const { currentUser } = useAuth()
  const { students, sessions } = useData()

  const profile =
    students.find((student) => student.userId === currentUser?.id) ??
    students.find((student) => student.email === currentUser?.email)

  const personalRecords = useMemo(() => {
    if (!profile) return [] as PersonalRecord[]
    return sessions.reduce<PersonalRecord[]>((acc, session) => {
      const record = session.records.find((item) => item.studentId === profile.id)
      if (record) {
        acc.push({
          sessionId: session.id,
          discipline: session.discipline,
          date: session.date,
          group: session.group,
          timeslot: session.timeslot,
          status: record.status,
          reason: record.reason,
          instructor: session.instructor,
        })
      }
      return acc
    }, [])
  }, [profile, sessions])

  const stats = useMemo(() => {
    if (!personalRecords.length) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        attendanceRate: 0,
      }
    }
    const present = personalRecords.filter((record) => record.status === 'present').length
    const absent = personalRecords.filter((record) => record.status === 'absent').length
    const late = personalRecords.filter((record) => record.status === 'late').length
    return {
      total: personalRecords.length,
      present,
      absent,
      late,
      attendanceRate: Math.round((present / personalRecords.length) * 100),
    }
  }, [personalRecords])

  if (!profile) {
    return (
      <div className="panel empty-state">
        Профиль студента не найден. Обратитесь к администратору для связывания аккаунта.
      </div>
    )
  }

  return (
    <div className="grid">
      <section className="grid grid-2">
        <div className="panel">
          <div className="badge">Мой профиль</div>
          <h2 className="panel-title">{profile.fullName}</h2>
          <p className="panel-subtitle">
            Группа {profile.group} · зачётная книжка {profile.studentId}
          </p>
        </div>
        <div className="panel">
          <div className="badge">Индикаторы посещаемости</div>
          <div className="stat-value">{stats.attendanceRate}%</div>
          <p className="panel-subtitle">Посещаемость за весь период</p>
          <div className="chips" style={{ marginTop: '1rem' }}>
            <span className="chip">Присутствий: {stats.present}</span>
            <span className="chip">Отсутствий: {stats.absent}</span>
            <span className="chip">Опозданий: {stats.late}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="badge">Мои занятия</div>
            <h3 className="panel-title">История посещаемости</h3>
          </div>
        </div>
        <div className="attendance-table">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Дисциплина</th>
                <th>Пара</th>
                <th>Статус</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {personalRecords.map((record) => (
                <tr key={record.sessionId}>
                  <td>{record.date}</td>
                  <td>
                    <strong>{record.discipline}</strong>
                    <div className="panel-subtitle">{record.instructor}</div>
                  </td>
                  <td>{record.timeslot}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        record.status === 'present'
                          ? 'status-present'
                          : record.status === 'absent'
                            ? 'status-absent'
                            : 'status-late'
                      }`}
                    >
                      {record.status === 'present'
                        ? 'Присутствовал'
                        : record.status === 'absent'
                          ? 'Отсутствовал'
                          : 'Опоздал'}
                    </span>
                  </td>
                  <td>{record.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!personalRecords.length && (
            <div className="empty-state">Отметок посещаемости пока нет.</div>
          )}
        </div>
      </section>
    </div>
  )
}

export default StudentDashboard

