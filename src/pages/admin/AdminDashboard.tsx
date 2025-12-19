import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, GraduationCap, CalendarCheck, UserPlus, Trash2, Copy, Check } from 'lucide-react';
import { User } from '@/types/attendance';
import { 
  getTeachers, 
  getStudents, 
  addUser, 
  generatePassword, 
  deleteUser,
  getAttendanceByDate,
  getToday
} from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [presentToday, setPresentToday] = useState(0);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '' });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTeachers(getTeachers());
    setStudents(getStudents());
    const todayAttendance = getAttendanceByDate(getToday());
    setPresentToday(todayAttendance.filter(a => a.status === 'present').length);
  };

  const handleAddTeacher = () => {
    if (!newTeacher.name.trim() || !newTeacher.email.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const password = generatePassword();
    addUser({
      name: newTeacher.name.trim(),
      email: newTeacher.email.trim(),
      password,
      role: 'teacher',
    });

    setGeneratedPassword(password);
    loadData();
    toast({
      title: 'Teacher Added',
      description: `${newTeacher.name} has been added successfully.`,
    });
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will also remove all their students.`)) {
      // Delete all students of this teacher first
      const teacherStudents = getStudents(id);
      teacherStudents.forEach(s => deleteUser(s.id));
      deleteUser(id);
      loadData();
      toast({
        title: 'Teacher Deleted',
        description: `${name} has been removed.`,
      });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setNewTeacher({ name: '', email: '' });
    setGeneratedPassword('');
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Teachers"
          value={teachers.length}
          icon={<Users className="h-6 w-6" />}
          variant="primary"
        />
        <StatsCard
          title="Total Students"
          value={students.length}
          icon={<GraduationCap className="h-6 w-6" />}
          variant="success"
        />
        <StatsCard
          title="Present Today"
          value={presentToday}
          icon={<CalendarCheck className="h-6 w-6" />}
          variant="warning"
        />
        <StatsCard
          title="Absent Today"
          value={students.length - presentToday}
          icon={<CalendarCheck className="h-6 w-6" />}
          variant="destructive"
        />
      </div>

      {/* Recent Teachers */}
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Teachers</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Enter teacher details. Login credentials will be auto-generated.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    placeholder="john@school.edu"
                  />
                </div>
                
                {generatedPassword && (
                  <div className="rounded-lg bg-success/10 p-4 border border-success/20">
                    <p className="text-sm font-medium text-success mb-2">Credentials Generated!</p>
                    <p className="text-sm"><strong>Email:</strong> {newTeacher.email}</p>
                    <p className="text-sm"><strong>Password:</strong> {generatedPassword}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(`Email: ${newTeacher.email}\nPassword: ${generatedPassword}`, 'credentials')}
                    >
                      {copiedId === 'credentials' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      Copy Credentials
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  {!generatedPassword ? (
                    <Button onClick={handleAddTeacher} className="flex-1 gradient-primary">
                      Generate & Add
                    </Button>
                  ) : (
                    <Button onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }} className="flex-1">
                      Done
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No teachers added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => {
                  const studentCount = getStudents(teacher.id).length;
                  return (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{studentCount}</TableCell>
                      <TableCell>{new Date(teacher.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default AdminDashboard;
