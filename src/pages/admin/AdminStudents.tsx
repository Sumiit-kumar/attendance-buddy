import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
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
import { UserPlus, Trash2, Copy, Check } from 'lucide-react';
import { User } from '@/types/attendance';
import { getTeachers, getStudents, addUser, generatePassword, deleteUser, getUserById } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

const AdminStudents: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [newStudent, setNewStudent] = useState({ name: '', email: '', teacherId: '' });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTeacher === 'all') {
      setStudents(getStudents());
    } else {
      setStudents(getStudents(selectedTeacher));
    }
  }, [selectedTeacher]);

  const loadData = () => {
    setTeachers(getTeachers());
    setStudents(getStudents());
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.teacherId) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const password = generatePassword();
    addUser({
      name: newStudent.name.trim(),
      email: newStudent.email.trim(),
      password,
      role: 'student',
      teacherId: newStudent.teacherId,
    });

    setGeneratedPassword(password);
    loadData();
    if (selectedTeacher !== 'all') {
      setStudents(getStudents(selectedTeacher));
    }
    toast({
      title: 'Student Added',
      description: `${newStudent.name} has been added successfully.`,
    });
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteUser(id);
      loadData();
      if (selectedTeacher !== 'all') {
        setStudents(getStudents(selectedTeacher));
      }
      toast({
        title: 'Student Deleted',
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
    setNewStudent({ name: '', email: '', teacherId: '' });
    setGeneratedPassword('');
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return 'N/A';
    const teacher = getUserById(teacherId);
    return teacher?.name || 'Unknown';
  };

  return (
    <DashboardLayout title="Manage Students">
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <CardTitle>All Students ({students.length})</CardTitle>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-[200px]">
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
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary" disabled={teachers.length === 0}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Assign student to a teacher. Login credentials will be auto-generated.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher">Assign to Teacher</Label>
                  <Select 
                    value={newStudent.teacherId} 
                    onValueChange={(value) => setNewStudent({ ...newStudent, teacherId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="jane@school.edu"
                  />
                </div>
                
                {generatedPassword && (
                  <div className="rounded-lg bg-success/10 p-4 border border-success/20">
                    <p className="text-sm font-medium text-success mb-2">Credentials Generated!</p>
                    <p className="text-sm"><strong>Email:</strong> {newStudent.email}</p>
                    <p className="text-sm"><strong>Password:</strong> {generatedPassword}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(`Email: ${newStudent.email}\nPassword: ${generatedPassword}`, 'credentials')}
                    >
                      {copiedId === 'credentials' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      Copy Credentials
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  {!generatedPassword ? (
                    <Button onClick={handleAddStudent} className="flex-1 gradient-primary">
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
            <p className="text-center text-muted-foreground py-8">Add teachers first before adding students.</p>
          ) : students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No students added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{student.password}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(student.password, student.id)}
                        >
                          {copiedId === student.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getTeacherName(student.teacherId)}</TableCell>
                    <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default AdminStudents;
