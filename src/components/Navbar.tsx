
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          AI Learning Tools
        </Link>
        <div className="space-x-4">
          <Link href="/student/dashboard" className="text-gray-300 hover:text-white">
            Student Dashboard
          </Link>
          <Link href="/teacher/dashboard" className="text-gray-300 hover:text-white">
            Teacher Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
