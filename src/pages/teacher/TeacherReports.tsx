import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Filter, ClipboardList } from 'lucide-react';
import { User, StudentAttendanceSummary } from '@/types/attendance';
import { 
  getStudents, 
  getAttendanceByDateRange,
  getToday
} from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TeacherReports: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [summaryData, setSummaryData] = useState<StudentAttendanceSummary[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: getToday() });

  useEffect(() => {
    if (user) {
      setStudents(getStudents(user.id));
    }
  }, [user]);

  const loadSummary = () => {
    if (!dateRange.start || !dateRange.end) {
      toast({
        title: 'Error',
        description: 'Please select a date range',
        variant: 'destructive',
      });
      return;
    }

    const studentIds = students.map(s => s.id);
    const records = getAttendanceByDateRange(dateRange.start, dateRange.end, studentIds);

    const summary: StudentAttendanceSummary[] = students.map(student => {
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

  return (
    <DashboardLayout title="Attendance Reports">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Attendance Summary
          </CardTitle>
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
            <Button onClick={loadSummary}>
              <Filter className="h-4 w-4 mr-2" />
              Load Summary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No students found.</p>
          ) : summaryData.length === 0 ? (
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
    </DashboardLayout>
  );
};

export default TeacherReports;
