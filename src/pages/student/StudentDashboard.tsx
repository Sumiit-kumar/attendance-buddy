import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Percent, CalendarX, Calendar } from 'lucide-react';
import { AttendanceRecord } from '@/types/attendance';
import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceByStudent } from '@/lib/localStorage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;
    
    const attendance = getAttendanceByStudent(user.id);
    setRecords(attendance.sort((a, b) => b.date.localeCompare(a.date)));
    
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const totalDays = presentDays + absentDays;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    setStats({ totalDays, presentDays, absentDays, percentage });
  };

  return (
    <DashboardLayout title="Student Dashboard">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Days"
          value={stats.totalDays}
          icon={<Calendar className="h-6 w-6" />}
          variant="primary"
        />
        <StatsCard
          title="Present Days"
          value={stats.presentDays}
          icon={<CalendarCheck className="h-6 w-6" />}
          variant="success"
        />
        <StatsCard
          title="Absent Days"
          value={stats.absentDays}
          icon={<CalendarX className="h-6 w-6" />}
          variant="destructive"
        />
        <StatsCard
          title="Attendance %"
          value={`${stats.percentage}%`}
          icon={<Percent className="h-6 w-6" />}
          variant="warning"
          subtitle={stats.percentage >= 75 ? 'Good standing' : 'Needs improvement'}
        />
      </div>

      {/* Recent Attendance */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.slice(0, 10).map((record) => {
                  const date = new Date(record.date);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {date.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell>
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.status === 'present' ? 'default' : 'destructive'}
                          className={record.status === 'present' ? 'bg-success' : ''}
                        >
                          {record.status === 'present' ? 'Present' : 'Absent'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboard;
