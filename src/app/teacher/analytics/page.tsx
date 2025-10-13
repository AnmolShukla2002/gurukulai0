'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  grade9Data, grade10Data, classAverages, scoreDistribution, predictiveData
} from '@/lib/mock-data';
import { Student } from '@/lib/mock-data';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('grade9');
  const data = activeTab === 'grade9' ? grade9Data : grade10Data;

  const averages = classAverages(data);
  const mathDistribution = scoreDistribution(data, 'math');
  const prediction = predictiveData(data);

  return (
    <div className="min-h-screen animated-gradient">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/teacher/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Student Performance Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="grade9">Grade 9</TabsTrigger>
            <TabsTrigger value="grade10">Grade 10</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-white/50 backdrop-blur-sm">
            <CardHeader><CardTitle>Student Scores</CardTitle></CardHeader>
            <CardContent className="h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Math</TableHead>
                    <TableHead>Science</TableHead>
                    <TableHead>History</TableHead>
                    <TableHead>English</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.scores.math}</TableCell>
                      <TableCell>{student.scores.science}</TableCell>
                      <TableCell>{student.scores.history}</TableCell>
                      <TableCell>{student.scores.english}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader><CardTitle>Class Averages</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={averages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader><CardTitle>Math Score Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={mathDistribution} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                    {mathDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 bg-white/50 backdrop-blur-sm">
            <CardHeader><CardTitle>Predictive Performance</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prediction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="current" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
