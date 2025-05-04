"use client";

import type { Task } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete }: TaskItemProps) {
  const handleCheckedChange = () => {
    onToggleComplete(task.id);
  };

  return (
    <Card
      className={cn(
        'flex items-start space-x-4 p-4 rounded-sm transition-opacity duration-300', // Use rounded-sm for pixel feel
        task.completed ? 'opacity-50 bg-muted' : 'opacity-100'
      )}
    >
      <div className="flex-shrink-0">
        <Image
          src={task.iconUrl}
          alt={task.title}
          width={48} // Slightly larger for pixel art
          height={48}
          className="image-pixelated rounded-sm border border-border"
          data-ai-hint="pixel art icon"
        />
      </div>
      <div className="flex-1 min-w-0">
        <CardHeader className="p-0 mb-1">
          <CardTitle className={cn("text-lg font-semibold break-words", task.completed && "line-through")}>
            {task.title}
          </CardTitle>
        </CardHeader>
        {task.description && (
          <CardDescription className={cn("text-sm text-muted-foreground break-words", task.completed && "line-through")}>
            {task.description}
          </CardDescription>
        )}
      </div>
      <div className="flex items-center space-x-2 self-center ml-auto pl-4">
         <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCheckedChange}
            aria-labelledby={`label-${task.id}`}
            className="size-5 rounded-sm" // Use rounded-sm
          />
          <Label
            htmlFor={`task-${task.id}`}
            id={`label-${task.id}`}
            className="sr-only" // Hide label visually but keep for accessibility
          >
            Mark {task.title} as {task.completed ? 'incomplete' : 'complete'}
          </Label>
      </div>
    </Card>
  );
}
