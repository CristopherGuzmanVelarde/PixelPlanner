"use client";

import type { Task } from '@/types';
import { TaskItem } from './task-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
}

export function TaskList({ tasks, onToggleComplete }: TaskListProps) {
  if (!tasks.length) {
    return <p className="text-center text-muted-foreground mt-8">No tasks yet! Add one to get started.</p>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
      <div className="grid grid-cols-1 gap-4 p-4">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} />
        ))}
      </div>
    </ScrollArea>
  );
}
