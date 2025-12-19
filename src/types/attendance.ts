// User roles in the system
export type UserRole = 'admin' | 'teacher' | 'student';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  teacherId?: string; // For students - which teacher they belong to
  createdAt: string;
}

// Attendance record
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD format
  status: 'present' | 'absent';
  markedBy: string; // User ID who marked the attendance
  markedAt: string;
}

// Attendance with student info for display
export interface AttendanceWithStudent extends AttendanceRecord {
  studentName: string;
  studentEmail: string;
}

// Stats for dashboard cards
export interface AttendanceStats {
  totalStudents: number;
  totalTeachers: number;
  presentToday: number;
  absentToday: number;
  attendancePercentage: number;
}

// Student attendance summary
export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}
