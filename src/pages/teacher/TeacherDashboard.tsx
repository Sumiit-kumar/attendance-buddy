import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, CalendarCheck, Percent } from 'lucide-react';
import { User, AttendanceRecord } from '@/types/attendance';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getStudents, 
  getAttendanceByDate, 
  getToday,
  getAttendance
} from '@/lib/localStorage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [presentToday, setPresentToday] = useState(0);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;
    
    const myStudents = getStudents(user.id);
    setStudents(myStudents);
    
    const todayAttendance = getAttendanceByDate(getToday());
    const myStudentIds = myStudents.map(s => s.id);
    const myTodayAttendance = todayAttendance.filter(a => myStudentIds.includes(a.studentId));
    setPresentToday(myTodayAttendance.filter(a => a.status === 'present').length);
    
    // Calculate overall attendance percentage
    const allRecords = getAttendance().filter(a => myStudentIds.includes(a.studentId));
    const totalRecords = allRecords.length;
    const presentRecords = allRecords.filter(a => a.status === 'present').length;
    setOverallPercentage(totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0);
  };

  return (
    <DashboardLayout title="Teacher Dashboard">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="My Students"
          value={students.length}
          icon={<GraduationCap className="h-6 w-6" />}
          variant="primary"
        />
        <StatsCard
          title="Present Today"
          value={presentToday}
          icon={<CalendarCheck className="h-6 w-6" />}
          variant="success"
        />
        <StatsCard
          title="Absent Today"
          value={students.length - presentToday}
          icon={<CalendarCheck className="h-6 w-6" />}
          variant="destructive"
        />
        <StatsCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          icon={<Percent className="h-6 w-6" />}
          variant="warning"
        />
      </div>

      {/* Recent Students */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>My Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No students added yet. Go to "My Students" to add students.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.slice(0, 5).map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
