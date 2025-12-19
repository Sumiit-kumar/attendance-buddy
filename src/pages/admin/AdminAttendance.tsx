import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Save, Filter } from 'lucide-react';
import { User, AttendanceRecord, StudentAttendanceSummary } from '@/types/attendance';
import { 
  getTeachers, 
  getStudents, 
  getAttendanceByDate, 
  markAttendance, 
  getToday,
  getUserById,
  getAttendanceByDateRange
} from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AdminAttendance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [viewMode, setViewMode] = useState<'mark' | 'summary'>('mark');
  const [summaryData, setSummaryData] = useState<StudentAttendanceSummary[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: getToday() });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadStudents();
    loadAttendance();
  }, [selectedTeacher, selectedDate]);

  const loadData = () => {
    setTeachers(getTeachers());
    loadStudents();
    loadAttendance();
  };

  const loadStudents = () => {
    if (selectedTeacher === 'all') {
      setStudents(getStudents());
    } else {
      setStudents(getStudents(selectedTeacher));
    }
  };

  const loadAttendance = () => {
    const records = getAttendanceByDate(selectedDate);
    const attendanceMap: Record<string, 'present' | 'absent'> = {};
    records.forEach(r => {
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

  const loadSummary = () => {
    if (!dateRange.start || !dateRange.end) {
      toast({
        title: 'Error',
        description: 'Please select a date range',
        variant: 'destructive',
      });
      return;
    }

    const filteredStudents = selectedTeacher === 'all' ? getStudents() : getStudents(selectedTeacher);
    const studentIds = filteredStudents.map(s => s.id);
    const records = getAttendanceByDateRange(dateRange.start, dateRange.end, studentIds);

    const summary: StudentAttendanceSummary[] = filteredStudents.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.id);
      const presentDays = studentRecords.filter(r => r.status === 'present').length;
      const absentDays = studentRecords.filter(r => r.status === 'absent').length;
      const totalDays = presentDays + absentDays;
      const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        totalDays,
        presentDays,
        absentDays,
        percentage,
      };
    });

    setSummaryData(summary);
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return 'N/A';
    const teacher = getUserById(teacherId);
    return teacher?.name || 'Unknown';
  };

  return (
    <DashboardLayout title="Attendance Management">
      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={viewMode === 'mark' ? 'default' : 'outline'}
          onClick={() => setViewMode('mark')}
        >
          <CalendarCheck className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
        <Button
          variant={viewMode === 'summary' ? 'default' : 'outline'}
          onClick={() => setViewMode('summary')}
        >
          <Filter className="h-4 w-4 mr-2" />
          View Summary
        </Button>
      </div>

      {viewMode === 'mark' ? (
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle>Mark Attendance</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label>Date:</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No students found.</p>
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
                      <TableHead>Teacher</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{getTeacherName(student.teacherId)}</TableCell>
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
      ) : (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <div className="flex items-center gap-4 flex-wrap mt-4">
              <div className="flex items-center gap-2">
                <Label>From:</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>To:</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-auto"
                />
              </div>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={loadSummary}>
                <Filter className="h-4 w-4 mr-2" />
                Load Summary
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {summaryData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Select a date range and click Load Summary.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Total Days</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.map((summary) => (
                    <TableRow key={summary.studentId}>
                      <TableCell className="font-medium">{summary.studentName}</TableCell>
                      <TableCell>{summary.studentEmail}</TableCell>
                      <TableCell className="text-center">{summary.totalDays}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {summary.presentDays}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          {summary.absentDays}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={summary.percentage >= 75 ? 'default' : 'destructive'}
                          className={summary.percentage >= 75 ? 'bg-success' : ''}
                        >
                          {summary.percentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default AdminAttendance;
