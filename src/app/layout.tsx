'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
        <main>{children}</main>
      </body>
    </html>
  );
}
