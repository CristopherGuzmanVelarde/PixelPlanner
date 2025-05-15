
"use client";

import type { Task } from '@/types';
import { TaskItem } from './task-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onEditRequest: (task: Task) => void;
  className?: string; 
}

export function TaskList({ tasks, onToggleComplete, onDeleteRequest, onEditRequest, className }: TaskListProps) {
  // Empty state is now handled by the parent component (page.tsx)
  // if (!tasks.length) {
  //   return <p className={cn("text-center text-muted-foreground mt-8 flex-grow flex items-center justify-center", className)}>¡No hay tareas aún! Añade una para empezar.</p>;
  // }

  return (
    <div className={cn("h-full", className)}> 
      <ScrollArea className="h-full">
        <div className="grid grid-cols-1 gap-2 p-2 sm:gap-4 sm:p-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDeleteRequest={onDeleteRequest}
              onEditRequest={onEditRequest}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
