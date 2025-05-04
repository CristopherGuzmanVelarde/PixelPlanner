"use client"; // Required for useState and event handlers

import { useState, useEffect } from 'react';
import type { Task } from '@/types';
import { TaskList } from '@/components/task-list';
import { AddTaskForm } from '@/components/add-task-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Helper to generate unique IDs (replace with a robust library like uuid in a real app)
const generateId = () => Math.random().toString(36).substring(2, 15);

// Function to safely get data from localStorage
const loadTasksFromLocalStorage = (): Task[] => {
  if (typeof window === 'undefined') {
    return []; // Return empty array during SSR
  }
  try {
    const savedTasks = localStorage.getItem('pixelPlannerTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Failed to load tasks from localStorage:", error);
    return [];
  }
};

// Function to safely save data to localStorage
const saveTasksToLocalStorage = (tasks: Task[]) => {
   if (typeof window === 'undefined') {
    return; // Do nothing during SSR
  }
  try {
    localStorage.setItem('pixelPlannerTasks', JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks to localStorage:", error);
  }
};


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false); // State to track client-side mounting

  // Load tasks from localStorage only on the client side after mount
  useEffect(() => {
    setIsClient(true); // Indicate component has mounted client-side
    setTasks(loadTasksFromLocalStorage());
  }, []); // Empty dependency array ensures this runs once on mount

  // Save tasks to localStorage whenever tasks state changes (only on client)
  useEffect(() => {
    if (isClient) { // Only save if running on the client
      saveTasksToLocalStorage(tasks);
    }
  }, [tasks, isClient]);

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: generateId(),
      completed: false,
    };
    setTasks((prevTasks) => [newTask, ...prevTasks]); // Add new task to the beginning
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Sort tasks: incomplete first, then complete
  const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed === b.completed) {
          return 0; // Keep original order if same completion status
      }
      return a.completed ? 1 : -1; // Incomplete tasks come first
  });


  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card className="bg-card/80 backdrop-blur-sm rounded-none shadow-md border-2 border-foreground"> {/* Updated for pixel style */}
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-primary tracking-wide">
            Pixel Planner
          </CardTitle>
           <p className="text-muted-foreground">Your daily tasks, pixelated.</p>
        </CardHeader>
        <Separator className="mb-4 border-t-2 border-foreground"/> {/* Thicker separator */}
        <CardContent>
           {/* Only render TaskList and AddTaskForm on the client */}
           {isClient ? (
            <>
              <TaskList tasks={sortedTasks} onToggleComplete={handleToggleComplete} />
              <AddTaskForm onAddTask={handleAddTask} />
            </>
           ) : (
             <p className="text-center text-muted-foreground p-8">Loading tasks...</p> // Placeholder during SSR/initial load
           )}
        </CardContent>
      </Card>
    </div>
  );
}
