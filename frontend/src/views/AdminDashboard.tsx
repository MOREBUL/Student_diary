import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useData } from '../context/DataContext'
import type { AttendanceStatus, StudentProfile } from '../types'

const emptyStudentForm = {
  firstName: '',
  lastName: '',
  email: '',
  studentId: '',
  group: '',
  status: 'active' as StudentProfile['status'],
  note: '',
}

const AdminDashboard = () => {
  const {
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
  } = useData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | StudentProfile['status']>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [studentForm, setStudentForm] = useState(emptyStudentForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [importFeedback, setImportFeedback] = useState<string | null>(null)
  const [sessionForm, setSessionForm] = useState({
    discipline: '',
    group: '',
    date: new Date().toISOString().slice(0, 10),
    timeslot: '08:30 — 10:05',
    instructor: '',
    notes: '',
  })

  const groups = useMemo(
    () => Array.from(new Set(students.map((student) => student.group))),
    [students],
  )

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.group.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' ? true : student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const resetStudentForm = () => {
    setStudentForm(emptyStudentForm)
    setEditingId(null)
  }

  const handleStudentSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!studentForm.firstName || !studentForm.lastName || !studentForm.group) return

    if (editingId) {
      updateStudent(editingId, studentForm)
    } else {
      addStudent(studentForm)
    }
    resetStudentForm()
  }

  const handleEditStudent = (student: StudentProfile) => {
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentId: student.studentId,
      group: student.group,
      status: student.status,
      note: student.note ?? '',
    })
    setEditingId(student.id)
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredStudents.map((student) => student.id))
    }
  }

  const handleBulkStatus = (status: StudentProfile['status']) => {
    if (!selectedIds.length) return
    bulkUpdateStudents(selectedIds, { status })
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    if (!selectedIds.length) return
    bulkDeleteStudents(selectedIds)
    setSelectedIds([])
  }

  const parseCsv = (fileContent: string) => {
    const rows = fileContent.split(/\r?\n/).filter(Boolean)
    if (rows.length < 2) return []
    const headers = rows[0]
      .split(',')
      .map((header) => header.trim().toLowerCase())

    return rows.slice(1).map((row) => {
      const cells = row.split(',')
      const get = (key: string) => {
        const index = headers.indexOf(key)
        return index >= 0 ? cells[index]?.trim() ?? '' : ''
      }
      return {
        firstName: get('firstname') || get('имя'),
        lastName: get('lastname') || get('фамилия'),
        email: get('email'),
        studentId: get('studentid') || get('зачетка'),
        group: get('group') || get('группа'),
        status: (get('status') as StudentProfile['status']) || 'active',
      }
    })
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const parsed = parseCsv(text)
    const created = importStudents(parsed)

    setImportFeedback(
      created
        ? `Импортировано ${created} студентов`
        : 'Не удалось распознать данные. Проверьте формат CSV.',
    )
    event.target.value = ''
  }

  const handleCreateSession = (event: FormEvent) => {
    event.preventDefault()
    if (!sessionForm.discipline || !sessionForm.group) return
    createSession(sessionForm)
    setSessionForm({
      ...sessionForm,
      discipline: '',
      notes: '',
    })
  }

  const stats = [
    { label: 'Студентов в системе', value: students.length },
    { label: 'Групп в системе', value: groups.length },
    { label: 'Занятий создано', value: sessions.length },
  ]

  return (
    <div className="grid">
      <section className="grid grid-2">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="badge">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="badge">Управление студентами</div>
            <h3 className="panel-title">Списки и профили</h3>
          </div>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            Импорт CSV
            <input type="file" accept=".csv" hidden onChange={handleImport} />
          </label>
        </div>

        <div className="grid grid-2">
          <form onSubmit={handleStudentSubmit} className="panel">
            <div className="panel-header">
              <div>
                <div className="badge">
                  {editingId ? 'Редактирование студента' : 'Новый студент'}
                </div>
                <h4 className="panel-title">
                  {editingId ? 'Обновить профиль' : 'Быстрое добавление'}
                </h4>
              </div>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={resetStudentForm}>
                  Сбросить
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Имя</label>
                <input
                  className="input"
                  value={studentForm.firstName}
                  onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Фамилия</label>
                <input
                  className="input"
                  value={studentForm.lastName}
                  onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>E-mail</label>
                <input
                  className="input"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Группа</label>
                <input
                  className="input"
                  value={studentForm.group}
                  onChange={(e) => setStudentForm({ ...studentForm, group: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Номер зачетки</label>
                <input
                  className="input"
                  value={studentForm.studentId}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, studentId: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label>Статус</label>
                <select
                  className="select"
                  value={studentForm.status}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      status: e.target.value as StudentProfile['status'],
                    })
                  }
                >
                  <option value="active">Активен</option>
                  <option value="academic leave">Академ. отпуск</option>
                  <option value="expelled">Отчислен</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Примечание</label>
              <textarea
                className="textarea"
                rows={2}
                value={studentForm.note}
                onChange={(e) => setStudentForm({ ...studentForm, note: e.target.value })}
              />
            </div>

            <button className="btn btn-primary" type="submit">
              {editingId ? 'Сохранить изменения' : 'Добавить студента'}
            </button>
          </form>

          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="badge">Массовые операции</div>
                <h4 className="panel-title">Групповые действия</h4>
              </div>
            </div>
            <p className="panel-subtitle">
              Выберите студентов в таблице и примените действия к выделенным профилям.
            </p>
            <div className="chip-filter">
              <button type="button" onClick={() => handleBulkStatus('active')}>
                Пометить активными
              </button>
              <button type="button" onClick={() => handleBulkStatus('academic leave')}>
                В академ. отпуск
              </button>
              <button type="button" onClick={() => handleBulkStatus('expelled')}>
                Перевести в архив
              </button>
              <button type="button" onClick={handleBulkDelete}>
                Удалить
              </button>
            </div>
            {importFeedback && (
              <div className="chip" style={{ marginTop: '1.5rem' }}>
                {importFeedback}
              </div>
            )}
          </div>
        </div>

        <hr className="card-divider" />

        <div className="panel-header">
          <div>
            <div className="badge">Поиск студентов</div>
            <h3 className="panel-title">Каталог студентов</h3>
          </div>
          <input
            className="input"
            placeholder="Поиск по имени, группе, почте..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="chip-filter" style={{ marginBottom: '1rem' }}>
          {['all', 'active', 'academic leave', 'expelled'].map((status) => (
            <button
              key={status}
              type="button"
              className={statusFilter === status ? 'active' : ''}
              onClick={() => setStatusFilter(status as typeof statusFilter)}
            >
              {status === 'all'
                ? 'Все'
                : status === 'active'
                  ? 'Активные'
                  : status === 'academic leave'
                    ? 'Академ. отпуск'
                    : 'Архив'}
            </button>
          ))}
        </div>

        <div className="attendance-table">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === filteredStudents.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Студент</th>
                <th>Группа</th>
                <th>Почта</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student.id)}
                      onChange={() => toggleSelection(student.id)}
                    />
                  </td>
                  <td>
                    <strong>{student.fullName}</strong>
                    <div className="panel-subtitle">{student.studentId}</div>
                  </td>
                  <td>{student.group}</td>
                  <td>{student.email}</td>
                  <td>
                    <span
                      className="chip"
                      style={{
                        background:
                          student.status === 'active'
                            ? 'rgba(28,156,124,0.15)'
                            : student.status === 'academic leave'
                              ? 'rgba(245,159,0,0.12)'
                              : 'rgba(0,46,93,0.1)',
                      }}
                    >
                      {student.status === 'active'
                        ? 'Активен'
                        : student.status === 'academic leave'
                          ? 'Академ. отпуск'
                          : 'Архив'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-outline" onClick={() => handleEditStudent(student)}>
                      Редактировать
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => deleteStudent(student.id)}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredStudents.length && (
            <div className="empty-state">Совпадения не найдены. Попробуйте другой запрос.</div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="badge">Занятия и посещаемость</div>
            <h3 className="panel-title">Пары и отметки</h3>
          </div>
        </div>

        <form className="grid grid-2" onSubmit={handleCreateSession}>
          <div>
            <div className="input-group">
              <label>Дисциплина</label>
              <input
                className="input"
                value={sessionForm.discipline}
                onChange={(e) => setSessionForm({ ...sessionForm, discipline: e.target.value })}
                placeholder="Теория вероятностей"
                required
              />
            </div>
            <div className="input-group">
              <label>Группа</label>
              <select
                className="select"
                value={sessionForm.group}
                onChange={(e) => setSessionForm({ ...sessionForm, group: e.target.value })}
                required
              >
                <option value="">Выберите группу</option>
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Дата</label>
                <input
                  className="input"
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Пара</label>
                <input
                  className="input"
                  value={sessionForm.timeslot}
                  onChange={(e) => setSessionForm({ ...sessionForm, timeslot: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Преподаватель</label>
                <input
                  className="input"
                  value={sessionForm.instructor}
                  onChange={(e) => setSessionForm({ ...sessionForm, instructor: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Комментарий</label>
                <input
                  className="input"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                  placeholder="Тема, аудитория и т.д."
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">
              Создать занятие
            </button>
          </div>
          <div className="panel">
            <h4 className="panel-title">Как это работает?</h4>
            <p className="panel-subtitle">
              После создания занятия система автоматически подставит студентов выбранной
              группы. Можно редактировать статус каждого студента и фиксировать причины
              отсутствия.
            </p>
            <ul>
              <li>• статусы: присутствие, отсутствие, опоздание</li>
              <li>• причины отсутствия фиксируются текстово</li>
              <li>• записи можно редактировать и удалять</li>
            </ul>
          </div>
        </form>

        <div className="grid" style={{ marginTop: '2rem' }}>
          {sessions.map((session) => (
            <div key={session.id} className="panel">
              <div className="panel-header">
                <div>
                  <div className="badge">{session.group}</div>
                  <h4 className="panel-title">{session.discipline}</h4>
                  <p className="panel-subtitle">
                    {session.date} · {session.timeslot}
                  </p>
                </div>
                <button className="btn btn-ghost" onClick={() => deleteSession(session.id)}>
                  Удалить
                </button>
              </div>
              <div className="attendance-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Студент</th>
                      <th>Статус</th>
                      <th>Причина</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.records.map((record) => {
                      const student = students.find((s) => s.id === record.studentId)
                      if (!student) return null
                      return (
                        <tr key={record.studentId}>
                          <td>{student.fullName}</td>
                          <td>
                            <select
                              className="select"
                              value={record.status}
                              onChange={(e) =>
                                updateAttendance(
                                  session.id,
                                  record.studentId,
                                  e.target.value as AttendanceStatus,
                                  record.reason,
                                )
                              }
                            >
                              <option value="present">Присутствует</option>
                              <option value="absent">Отсутствует</option>
                              <option value="late">Опоздал</option>
                            </select>
                          </td>
                          <td>
                            <input
                              className="inline-input"
                              value={record.reason ?? ''}
                              placeholder="Причина"
                              onChange={(e) =>
                                updateAttendance(
                                  session.id,
                                  record.studentId,
                                  record.status,
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {!sessions.length && (
            <div className="empty-state">Занятия еще не созданы. Добавьте первое занятие.</div>
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard

