
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [studentEmail, setStudentEmail] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const router = useRouter();

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/student/dashboard');
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/teacher/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-xl md:grid md:grid-cols-2 md:gap-12">
        <div className="flex flex-col justify-center">
          <h2 className="mb-6 text-center text-3xl font-bold text-neutral-900">Student Login</h2>
          <form onSubmit={handleStudentLogin}>
            <div className="mb-4">
              <label htmlFor="student-email" className="block text-sm font-medium text-neutral-700">
                Email Address
              </label>
              <input
                id="student-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-neutral-200 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Login as Student
              </button>
            </div>
          </form>
        </div>
        <div className="mt-8 flex flex-col justify-center border-t border-neutral-200 pt-8 md:mt-0 md:border-t-0 md:border-l md:pl-12">
          <h2 className="mb-6 text-center text-3xl font-bold text-neutral-900">Teacher Login</h2>
          <form onSubmit={handleTeacherLogin}>
            <div className="mb-4">
              <label htmlFor="teacher-email" className="block text-sm font-medium text-neutral-700">
                Email Address
              </label>
              <input
                id="teacher-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-neutral-200 shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
              />
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg border border-transparent bg-secondary px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                Login as Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
