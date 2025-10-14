'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserIcon, LockIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      router.push(`/student/dashboard?name=${encodeURIComponent(studentName.trim())}`);
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherName.trim()) {
      router.push(`/teacher/dashboard?name=${encodeURIComponent(teacherName.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl rounded-lg border bg-card shadow-lg md:grid md:grid-cols-2">
        {/* Student Login */}
        <div className="p-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-foreground">Student Login</h2>
          <form onSubmit={handleStudentLogin} className="space-y-6">
            <div>
              <Label htmlFor="student-name">Full Name</Label>
              <div className="relative mt-2">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="student-password">Password</Label>
              <div className="relative mt-2">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="student-password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-semibold">
              Login as Student
            </Button>
          </form>
        </div>

        {/* Teacher Login */}
        <div className="p-8 border-t md:border-t-0 md:border-l">
        <h2 className="mb-6 text-center text-3xl font-bold text-foreground">Teacher Login</h2>
          <form onSubmit={handleTeacherLogin} className="space-y-6">
            <div>
              <Label htmlFor="teacher-name">Full Name</Label>
              <div className="relative mt-2">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="teacher-name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="teacher-password">Password</Label>
              <div className="relative mt-2">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="teacher-password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-semibold">
              Login as Teacher
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
