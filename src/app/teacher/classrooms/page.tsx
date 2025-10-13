'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PlusIcon, Trash2Icon, BookOpenIcon, PencilIcon, Loader2Icon, ArrowLeftIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MOCK_TEACHER_ID = 'mock-teacher-123';

interface Classroom {
  _id: string;
  name: string;
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);


  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/classrooms?teacherId=${MOCK_TEACHER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch classrooms');
      const result = await response.json();
      if (result.success) {
        setClassrooms(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleCreateClassroom = async () => {
    if (!newClassroomName.trim()) return;

    try {
      const response = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassroomName, teacherId: MOCK_TEACHER_ID }),
      });

      if (!response.ok) throw new Error('Failed to create classroom');

      const result = await response.json();
      if (result.success) {
        setClassrooms([...classrooms, result.data]);
        setNewClassroomName('');
        setIsModalOpen(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred while creating the classroom.');
    }
  };

  const handleDeleteClassroom = async () => {
    if (!classroomToDelete) return;

    try {
      const response = await fetch(`/api/classrooms/${classroomToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete classroom');
      }

      const result = await response.json();
      if (result.success) {
        setClassrooms(classrooms.filter(c => c._id !== classroomToDelete._id));
        setClassroomToDelete(null); 
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting the classroom.');
    }
  };


  const ClassroomCard = ({ name, id }: { name: string, id: string }) => (
    <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-lg z-10"></div>
        <div className="relative z-20 p-6 flex flex-col h-full">
            <div className="flex-grow">
                <div className="flex items-center justify-center h-16 w-16 bg-primary rounded-full text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <BookOpenIcon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate">{name}</h3>
                <p className="text-gray-600 mb-4">Classroom</p>
            </div>
            <div className="mt-auto">
                <Link href={`/teacher/classrooms/${id}`}>
                    <Button className="w-full font-semibold">View Details</Button>
                </Link>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800" disabled>
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setClassroomToDelete({ _id: id, name })}>
                        <Trash2Icon className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen animated-gradient">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/teacher/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Manage Classrooms</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Classroom
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2Icon className="h-12 w-12 animate-spin text-white" />
          </div>
        ) : error ? (
          <div className="text-center text-red-200 bg-red-800/50 p-4 rounded-lg">{error}</div>
        ) : classrooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {classrooms.map((classroom) => (
              <ClassroomCard key={classroom._id} name={classroom.name} id={classroom._id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg">
            <h2 className="text-xl font-medium text-gray-700">No classrooms yet</h2>
            <p className="text-gray-500 mt-2">Click the button above to create your first classroom.</p>
          </div>
        )}
      </main>

      {/* Create Classroom Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Classroom</DialogTitle>
            <DialogDescription>
              Enter a name for your new classroom. You can manage question papers within it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="classroom-name">Classroom Name</Label>
            <Input
              id="classroom-name"
              value={newClassroomName}
              onChange={(e) => setNewClassroomName(e.target.value)}
              placeholder="e.g., Grade 10 - Physics"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateClassroom}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={!!classroomToDelete} onOpenChange={() => setClassroomToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the classroom "{classroomToDelete?.name}" and all its associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteClassroom}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
