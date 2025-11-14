export type Role = 'student' | 'admin'

export interface User {
  id: string
  role: Role
  fullName: string
  email: string
  password: string
  group?: string
  studentId?: string
}

export interface StudentProfile {
  id: string
  userId?: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  studentId: string
  group: string
  status: 'active' | 'academic leave' | 'expelled'
  note?: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface AttendanceRecord {
  studentId: string
  status: AttendanceStatus
  reason?: string
}

export interface AttendanceSession {
  id: string
  discipline: string
  group: string
  date: string
  timeslot: string
  instructor?: string
  notes?: string
  records: AttendanceRecord[]
}

export interface AuthSession {
  userId: string
  staySignedIn: boolean
}

export interface StudentImportRow {
  firstName: string
  lastName: string
  email: string
  studentId: string
  group: string
  status?: StudentProfile['status']
}

