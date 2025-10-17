'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserIcon, LockIcon } from 'lucide-react';

const GREETINGS = [
  "Hello",
  "Hola",
  "Bonjour",
  "Ciao",
  "你好",
  "こんにちは",
];

const BENEFITS = [
  "Generate lesson plans in seconds.",
  "Create personalized quizzes instantly.",
  "Empower students with an AI learning buddy.",
  "Save hours of prep work every week."
];

export default function LoginPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [currentGreeting, setCurrentGreeting] = useState(0);

  useEffect(() => {
    const benefitInterval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % BENEFITS.length);
    }, 3000);
    return () => clearInterval(benefitInterval);
  }, []);

  useEffect(() => {
    const greetingInterval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % GREETINGS.length);
    }, 1000);
    return () => clearInterval(greetingInterval);
  }, []);

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
  
  const handleGuestLogin = () => {
    router.push(`/student/dashboard?name=Guest`);
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden flex-col items-center justify-center overflow-hidden p-8 lg:flex"
        style={{
          backgroundImage: 'url(/logo.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      </div>
      <div className="flex items-center justify-center py-12 bg-background">
        <div className="mx-auto grid w-[380px] gap-8 p-6">
          <div className="grid gap-2 text-center">
            <div className="h-12">
              <h1 key={currentGreeting} className="text-3xl font-bold animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
                {GREETINGS[currentGreeting]}
              </h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Select your role to sign in to your account
            </p>
          </div>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
              <form onSubmit={handleStudentLogin} className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="student-name" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your name" required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="student-password" type="password" placeholder="Enter your password" required className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full font-semibold text-md h-12">Login as Student</Button>
              </form>
            </TabsContent>
            <TabsContent value="teacher">
              <form onSubmit={handleTeacherLogin} className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="teacher-name" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Enter your name" required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="teacher-password" type="password" placeholder="Enter your password" required className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full font-semibold text-md h-12">Login as Teacher</Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="text-center">
            <Button variant="link" onClick={handleGuestLogin}>
                Or, try a live demo as a Guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}