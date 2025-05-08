"use client";

import type { Task } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onEditRequest: (task: Task) => void;
}

export function TaskItem({ task, onToggleComplete, onDeleteRequest, onEditRequest }: TaskItemProps) {
  const handleCheckedChange = () => {
    onToggleComplete(task.id);
  };

  return (
    <Card
      className={cn(
        'flex items-start space-x-4 p-4 rounded-none transition-opacity duration-300 border-foreground',
        task.completed ? 'opacity-50 bg-muted' : 'opacity-100'
      )}
    >
      <div className="flex-shrink-0">
        <Image
          src={task.iconUrl}
          alt={task.title}
          width={48}
          height={48}
          className="image-pixelated rounded-none border border-border"
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
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 self-center ml-auto pl-2">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={handleCheckedChange}
          aria-labelledby={`label-${task.id}`}
          className="size-5 rounded-none border-foreground"
        />
        <Label
          htmlFor={`task-${task.id}`}
          id={`label-${task.id}`}
          className="sr-only"
        >
          Mark {task.title} as {task.completed ? 'incomplete' : 'complete'}
        </Label>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-none border-foreground hover:bg-accent/80"
          onClick={() => onEditRequest(task)}
          aria-label={`Edit task ${task.title}`}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-none border-destructive-foreground text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDeleteRequest(task.id)}
          aria-label={`Delete task ${task.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
