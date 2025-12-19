import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarCheck, Save } from 'lucide-react';
import { User } from '@/types/attendance';
import { 
  getStudents, 
  getAttendanceByDate, 
  markAttendance, 
  getToday 
} from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate, students]);

  const loadStudents = () => {
    if (!user) return;
    setStudents(getStudents(user.id));
  };

  const loadAttendance = () => {
    const records = getAttendanceByDate(selectedDate);
    const studentIds = students.map(s => s.id);
    const attendanceMap: Record<string, 'present' | 'absent'> = {};
    records
      .filter(r => studentIds.includes(r.studentId))
      .forEach(r => {
        attendanceMap[r.studentId] = r.status;
      });
    setAttendance(attendanceMap);
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleBulkMark = (status: 'present' | 'absent') => {
    const newAttendance: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => {
      newAttendance[s.id] = status;
    });
    setAttendance(newAttendance);
  };

  const saveAttendance = () => {
    if (!user) return;
    
    students.forEach(student => {
      const status = attendance[student.id] || 'absent';
      markAttendance(student.id, selectedDate, status, user.id);
    });

    toast({
      title: 'Attendance Saved',
      description: `Attendance for ${selectedDate} has been saved.`,
    });
  };

  return (
    <DashboardLayout title="Mark Attendance">
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Mark Attendance
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label>Date:</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No students found. Add students first.</p>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => handleBulkMark('present')}>
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkMark('absent')}>
                  Mark All Absent
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendance[student.id] === 'present'}
                          onCheckedChange={() => handleAttendanceChange(student.id, 'present')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendance[student.id] === 'absent'}
                          onCheckedChange={() => handleAttendanceChange(student.id, 'absent')}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button onClick={saveAttendance} className="gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TeacherAttendance;
