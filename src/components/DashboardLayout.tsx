import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CalendarCheck, 
  LogOut,
  GraduationCap,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Teachers', path: '/admin/teachers', icon: <Users className="h-5 w-5" /> },
          { label: 'Students', path: '/admin/students', icon: <GraduationCap className="h-5 w-5" /> },
          { label: 'Attendance', path: '/admin/attendance', icon: <CalendarCheck className="h-5 w-5" /> },
        ];
      case 'teacher':
        return [
          { label: 'Dashboard', path: '/teacher', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'My Students', path: '/teacher/students', icon: <GraduationCap className="h-5 w-5" /> },
          { label: 'Mark Attendance', path: '/teacher/attendance', icon: <CalendarCheck className="h-5 w-5" /> },
          { label: 'Reports', path: '/teacher/reports', icon: <ClipboardList className="h-5 w-5" /> },
        ];
      case 'student':
        return [
          { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'My Attendance', path: '/student/attendance', icon: <CalendarCheck className="h-5 w-5" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-sidebar-primary" />
            <span className="text-xl font-bold">AttendEase</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            <span className="font-bold">AttendEase</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Mobile navigation */}
        <nav className="flex gap-1 overflow-x-auto border-b bg-card p-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <h1 className="mb-6 text-2xl font-bold text-foreground">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
