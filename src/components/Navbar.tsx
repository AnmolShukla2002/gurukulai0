'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GeminiIcon } from './Icons';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const pathname = usePathname();

  const isStudentPath = pathname.startsWith('/student');
  const isTeacherPath = pathname.startsWith('/teacher');

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-foreground">
            Gurukul AI
          </Link>
          <div className="flex items-center space-x-6">
            {/* On the homepage, show both links */}
            {!isStudentPath && !isTeacherPath && (
              <>
                <Link href="/student/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Student
                </Link>
                <Link href="/teacher/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Teacher
                </Link>
              </>
            )}
            
            {/* Only show AI assistant button for teachers */}
            {isTeacherPath && (
              <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors">
                <GeminiIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
