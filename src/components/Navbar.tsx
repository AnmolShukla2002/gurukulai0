
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Gurukul AI
          </Link>
          <div className="space-x-6">
            <Link href="/student/dashboard" className="text-neutral-700 hover:text-primary transition-colors">
              Student
            </Link>
            <Link href="/teacher/dashboard" className="text-neutral-700 hover:text-primary transition-colors">
              Teacher
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
