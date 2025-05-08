"use client";

import type { Task } from '@/types';
import { TaskItem } from './task-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onEditRequest: (task: Task) => void;
}

export function TaskList({ tasks, onToggleComplete, onDeleteRequest, onEditRequest }: TaskListProps) {
  if (!tasks.length) {
    return <p className="text-center text-muted-foreground mt-8">¡No hay tareas aún! Añade una para empezar.</p>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)] sm:h-[calc(100vh-240px)]"> {/* Adjusted height for header and FAB */}
      <div className="grid grid-cols-1 gap-4 p-4">
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
  );
}
