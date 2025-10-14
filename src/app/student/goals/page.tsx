'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, TargetIcon, PlusIcon, Loader2Icon, CheckCircle2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const googleColors = {
  red: '#EA4335',
};

interface Goal {
  _id: string;
  title: string;
  target: number;
  progress: number;
  completed: boolean;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/student/goals');
      if (!response.ok) throw new Error('Failed to fetch goals.');
      const result = await response.json();
      if (result.success) setGoals(result.data);
      else throw new Error(result.error);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim() || newGoalTarget < 1) return;
    try {
      const response = await fetch('/api/student/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newGoalTitle, target: newGoalTarget }),
      });
      if (!response.ok) throw new Error('Failed to create goal.');
      const result = await response.json();
      if (result.success) {
        fetchGoals(); // Re-fetch to get the new goal
        setNewGoalTitle('');
        setNewGoalTarget(1);
        setIsModalOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-foreground">Goals & Progress</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Set New Goal
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
            <div className="inline-block p-4 bg-red-500/10 text-red-500 rounded-full mb-6">
                <TargetIcon className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Your Goals</h1>
            <p className="text-xl text-muted-foreground">Track your learning journey and stay motivated.</p>
        </div>

        {loading ? (
          <div className="flex justify-center"><Loader2Icon className="h-12 w-12 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="text-center text-red-600 bg-red-500/10 p-4 rounded-lg">{error}</div>
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.map(goal => (
              <Card 
                key={goal._id} 
                className={`bg-card border border-border flex flex-col transition-all duration-300 hover:-translate-y-1 ${goal.completed ? 'opacity-70' : ''}`}
                style={{ boxShadow: `0 4px 25px -5px ${googleColors.red}44`}}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{goal.title}</span>
                    {goal.completed && <CheckCircle2Icon className="h-6 w-6 text-green-500" />}
                  </CardTitle>
                  <CardDescription>Target: {goal.target} chapters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm text-muted-foreground mt-2">{goal.progress} / {goal.target} Completed</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border-2 border-dashed border-border rounded-lg">
            <TargetIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-medium text-foreground">No goals set yet</h2>
            <p className="text-muted-foreground mt-2">Click the button above to set your first learning goal.</p>
          </div>
        )}
      </main>

      {/* Create Goal Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set a New Learning Goal</DialogTitle>
            <DialogDescription>
              Define what you want to achieve. Your progress will be tracked as you create chapters.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="e.g., Master World War II"
              />
            </div>
            <div>
              <Label htmlFor="goal-target">How many chapters to complete?</Label>
              <Input
                id="goal-target"
                type="number"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(parseInt(e.target.value, 10))}
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateGoal}>Set Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
