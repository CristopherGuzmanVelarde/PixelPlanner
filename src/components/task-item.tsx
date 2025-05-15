
"use client";

import type { Task } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, CalendarDays, Clock } from 'lucide-react'; // Added CalendarDays, Clock
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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

  const formattedDueDate = task.dueDate
    ? format(parseISO(task.dueDate), "dd MMM yyyy", { locale: es })
    : null;

  return (
    <Card
      className={cn(
        'flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-none transition-opacity duration-300 border-foreground', // Adjusted padding and spacing
        task.completed ? 'opacity-60 bg-muted/50' : 'opacity-100 bg-card' // Slightly different opacity and bg for completed
      )}
    >
      <div className="flex-shrink-0 pt-1">
        <Image
          src={task.iconUrl}
          alt={task.title}
          width={48} // Intrinsic width for next/image
          height={48} // Intrinsic height for next/image
          className="image-pixelated rounded-none border border-border w-10 h-10 sm:w-12 sm:h-12 object-contain" // CSS controlled size
          data-ai-hint="pixel art icon"
        />
      </div>
      <div className="flex-1 min-w-0">
        <CardHeader className="p-0 mb-1">
          <CardTitle className={cn("text-base sm:text-lg font-semibold break-words", task.completed && "line-through text-muted-foreground")}>
            {task.title}
          </CardTitle>
        </CardHeader>
        {task.description && (
          <CardDescription className={cn("text-xs sm:text-sm text-muted-foreground break-words mb-1", task.completed && "line-through")}>
            {task.description}
          </CardDescription>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
          {task.category && (
            <span className="bg-secondary/50 text-secondary-foreground px-1.5 py-0.5 rounded-none text-[0.7rem] border border-secondary-foreground/30">
              {task.category}
            </span>
          )}
          {formattedDueDate && (
            <div className="flex items-center">
              <CalendarDays className="h-3 w-3 mr-1" />
              <span>{formattedDueDate}</span>
            </div>
          )}
          {(task.timeSpent !== undefined && task.timeSpent > 0) && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{task.timeSpent} min</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col space-y-1 sm:space-y-2 self-center ml-auto pl-1 sm:pl-2">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={handleCheckedChange}
          aria-labelledby={`label-${task.id}`}
          className="size-5 sm:size-5 rounded-none border-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary-foreground"
        />
        <Label
          htmlFor={`task-${task.id}`}
          id={`label-${task.id}`}
          className="sr-only"
        >
          Marcar {task.title} como {task.completed ? 'incompleta' : 'completa'}
        </Label>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-none border-foreground hover:bg-accent/80"
          onClick={() => onEditRequest(task)}
          aria-label={`Editar tarea ${task.title}`}
        >
          <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-none border-destructive-foreground text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDeleteRequest(task.id)}
          aria-label={`Eliminar tarea ${task.title}`}
        >
          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </Card>
  );
}
