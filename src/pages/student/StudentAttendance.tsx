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
import { Filter, CalendarCheck } from 'lucide-react';
import { AttendanceRecord } from '@/types/attendance';
import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceByStudent, getToday } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: getToday() });
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
    setFilteredRecords(attendance.sort((a, b) => b.date.localeCompare(a.date)));
    calculateStats(attendance);
  };

  const calculateStats = (data: AttendanceRecord[]) => {
    const presentDays = data.filter(a => a.status === 'present').length;
    const absentDays = data.filter(a => a.status === 'absent').length;
    const totalDays = presentDays + absentDays;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    setStats({ totalDays, presentDays, absentDays, percentage });
  };

  const applyFilter = () => {
    if (!dateRange.start || !dateRange.end) {
      toast({
        title: 'Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }

    const filtered = records.filter(
      r => r.date >= dateRange.start && r.date <= dateRange.end
    );
    setFilteredRecords(filtered.sort((a, b) => b.date.localeCompare(a.date)));
    calculateStats(filtered);
  };

  const resetFilter = () => {
    setDateRange({ start: '', end: getToday() });
    setFilteredRecords(records);
    calculateStats(records);
  };

  return (
    <DashboardLayout title="My Attendance">
      <Card className="shadow-lg border-0 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
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
            <Button onClick={applyFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
            <Button variant="outline" onClick={resetFilter}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.totalDays}</p>
              <p className="text-sm text-muted-foreground">Total Days</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-2xl font-bold text-success">{stats.presentDays}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-2xl font-bold text-destructive">{stats.absentDays}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <p className="text-2xl font-bold text-warning">{stats.percentage}%</p>
              <p className="text-sm text-muted-foreground">Attendance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records found.</p>
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
                {filteredRecords.map((record) => {
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

export default StudentAttendance;
