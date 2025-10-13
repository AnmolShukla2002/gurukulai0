'use client';

import Link from 'next/link';
import { GeminiIcon } from './Icons';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  return (
    <nav className="bg-gray-900/50 backdrop-blur-lg text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">
            Gurukul AI
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/student/dashboard" className="hover:text-gray-300 transition-colors">
              Student
            </Link>
            <Link href="/teacher/dashboard" className="hover:text-gray-300 transition-colors">
              Teacher
            </Link>
            <button onClick={toggleSidebar} className="hover:text-gray-300 transition-colors">
              <GeminiIcon className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
