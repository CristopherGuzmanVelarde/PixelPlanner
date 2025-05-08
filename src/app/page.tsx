"use client";

import { useState, useEffect } from 'react';
import type { Task } from '@/types';
import { TaskList } from '@/components/task-list';
import { AddTaskForm } from '@/components/add-task-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

const generateId = () => Math.random().toString(36).substring(2, 15);

const loadTasksFromLocalStorage = (): Task[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const savedTasks = localStorage.getItem('pixelPlannerTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Failed to load tasks from localStorage:", error);
    return [];
  }
};

const saveTasksToLocalStorage = (tasks: Task[]) => {
   if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem('pixelPlannerTasks', JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks to localStorage:", error);
  }
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setTasks(loadTasksFromLocalStorage());
  }, []);

  useEffect(() => {
    if (isClient) {
      saveTasksToLocalStorage(tasks);
    }
  }, [tasks, isClient]);

  const handleOpenAddTaskDialog = () => {
    setTaskToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditTaskDialog = (task: Task) => {
    setTaskToEdit(task);
    setIsFormDialogOpen(true);
  };

  const handleFormDialogValidOpenChange = (open: boolean) => {
    setIsFormDialogOpen(open);
    if (!open) {
      setTaskToEdit(null); // Reset taskToEdit when dialog is closed
    }
  }

  const handleSaveTask = (taskData: { title: string; description?: string; iconUrl: string }) => {
    if (taskToEdit) {
      // Edit existing task
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskToEdit.id
            ? { ...taskToEdit, ...taskData }
            : task
        )
      );
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        completed: false,
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
    }
    setIsFormDialogOpen(false);
    setTaskToEdit(null);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteRequest = (id: string) => {
    setTaskToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDeleteId) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDeleteId));
    }
    setIsDeleteDialogOpen(false);
    setTaskToDeleteId(null);
  };

  const cancelDeleteTask = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDeleteId(null);
  };
  
  const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed === b.completed) {
          return 0;
      }
      return a.completed ? 1 : -1;
  });

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card className="bg-card/80 backdrop-blur-sm rounded-none shadow-md border-2 border-foreground">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-primary tracking-wide">
            Pixel Planner
          </CardTitle>
           <p className="text-muted-foreground">Your daily tasks, pixelated.</p>
        </CardHeader>
        <Separator className="mb-4 border-t-2 border-foreground"/>
        <CardContent>
           {isClient ? (
            <>
              <TaskList
                tasks={sortedTasks}
                onToggleComplete={handleToggleComplete}
                onDeleteRequest={handleDeleteRequest}
                onEditRequest={handleOpenEditTaskDialog}
              />
            </>
           ) : (
             <p className="text-center text-muted-foreground p-8">Loading tasks...</p>
           )}
        </CardContent>
      </Card>

      {isClient && (
        <>
          <AddTaskForm
            isOpen={isFormDialogOpen}
            onOpenChange={handleFormDialogValidOpenChange}
            onSaveTask={handleSaveTask}
            taskToEdit={taskToEdit}
          />
          <Button
            onClick={handleOpenAddTaskDialog}
            className={cn("fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg btn-pixel")}
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add New Task</span>
          </Button>
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none border-2 border-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteTask} className="rounded-none border-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="btn-pixel bg-destructive hover:bg-destructive/90 border-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
