import { User, AttendanceRecord } from '@/types/attendance';

const USERS_KEY = 'attendance_users';
const ATTENDANCE_KEY = 'attendance_records';
const CURRENT_USER_KEY = 'attendance_current_user';

// Generate random password (8 characters)
export const generatePassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize default admin if no users exist
export const initializeStorage = (): void => {
  const users = getUsers();
  const adminExists = users.some(u => u.role === 'admin');
  
  if (!adminExists) {
    const admin: User = {
      id: 'admin-001',
      name: 'Administrator',
      email: 'admin',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    saveUsers([admin, ...users]);
  }
};

// Users CRUD
export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const addUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, newUser]);
  return newUser;
};

export const getUserById = (id: string): User | undefined => {
  return getUsers().find(u => u.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const getTeachers = (): User[] => {
  return getUsers().filter(u => u.role === 'teacher');
};

export const getStudents = (teacherId?: string): User[] => {
  const students = getUsers().filter(u => u.role === 'student');
  if (teacherId) {
    return students.filter(s => s.teacherId === teacherId);
  }
  return students;
};

export const deleteUser = (id: string): void => {
  const users = getUsers().filter(u => u.id !== id);
  saveUsers(users);
  // Also delete related attendance records
  const attendance = getAttendance().filter(a => a.studentId !== id);
  saveAttendance(attendance);
};

// Attendance CRUD
export const getAttendance = (): AttendanceRecord[] => {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAttendance = (records: AttendanceRecord[]): void => {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

export const markAttendance = (
  studentId: string,
  date: string,
  status: 'present' | 'absent',
  markedBy: string
): AttendanceRecord => {
  const records = getAttendance();
  
  // Check if attendance already exists for this student and date
  const existingIndex = records.findIndex(
    r => r.studentId === studentId && r.date === date
  );
  
  const record: AttendanceRecord = {
    id: existingIndex >= 0 ? records[existingIndex].id : generateId(),
    studentId,
    date,
    status,
    markedBy,
    markedAt: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  
  saveAttendance(records);
  return record;
};

export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  return getAttendance().filter(r => r.date === date);
};

export const getAttendanceByStudent = (studentId: string): AttendanceRecord[] => {
  return getAttendance().filter(r => r.studentId === studentId);
};

export const getAttendanceByDateRange = (
  startDate: string,
  endDate: string,
  studentIds?: string[]
): AttendanceRecord[] => {
  return getAttendance().filter(r => {
    const inRange = r.date >= startDate && r.date <= endDate;
    const matchesStudent = !studentIds || studentIds.includes(r.studentId);
    return inRange && matchesStudent;
  });
};

// Current user session
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get today's date formatted
export const getToday = (): string => {
  return formatDate(new Date());
};
