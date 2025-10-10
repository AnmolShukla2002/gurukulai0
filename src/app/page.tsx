
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [studentEmail, setStudentEmail] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const router = useRouter();

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // No auth for now, just redirect
    router.push('/student/dashboard');
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // No auth for now, just redirect
    router.push('/teacher/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-lg md:grid md:grid-cols-2 md:gap-8">
        <div className="flex flex-col justify-center">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">Student Login</h2>
          <form onSubmit={handleStudentLogin}>
            <div className="mb-4">
              <label htmlFor="student-email" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Login as Student
              </button>
            </div>
          </form>
        </div>
        <div className="mt-8 flex flex-col justify-center md:mt-0">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">Teacher Login</h2>
          <form onSubmit={handleTeacherLogin}>
            <div className="mb-4">
              <label htmlFor="teacher-email" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
