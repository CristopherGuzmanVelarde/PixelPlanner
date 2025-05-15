
"use client";

import { useState, useEffect, useCallback }
from 'react';
import type { Task } from '@/types';
import { TaskList } from '@/components/task-list';
import { AddTaskForm } from '@/components/add-task-form';
import { TaskReportModal } from '@/components/task-report-modal';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, ListChecks, Archive, Settings, Palette, FileText } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';

const generateId = () => Math.random().toString(36).substring(2, 15);

const loadTasksFromLocalStorage = (): Task[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const savedTasks = localStorage.getItem('pixelPlannerTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Error al cargar tareas desde localStorage:", error);
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
    console.error("Error al guardar tareas en localStorage:", error);
  }
};

type FilterType = "all" | "completed" | "active";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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
      setTaskToEdit(null);
    }
  }

  const handleSaveTask = useCallback((taskData: { title: string; description?: string; iconUrl: string; category?: string; dueDate?: string; timeSpent?: number }) => {
    const now = new Date().toISOString();
    if (taskToEdit) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskToEdit.id
            ? { ...taskToEdit, ...taskData, timeSpent: taskData.timeSpent || taskToEdit.timeSpent || 0, lastModified: now }
            : task
        )
      );
      toast({ title: "Tarea Actualizada", description: `La tarea "${taskData.title}" ha sido actualizada.` });
    } else {
      const newTask: Task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        iconUrl: taskData.iconUrl,
        category: taskData.category,
        dueDate: taskData.dueDate,
        timeSpent: taskData.timeSpent || 0,
        completed: false,
        createdAt: now,
        lastModified: now,
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      toast({ title: "Tarea Añadida", description: `La tarea "${taskData.title}" ha sido añadida.` });
    }
    setIsFormDialogOpen(false);
    setTaskToEdit(null);
  }, [taskToEdit, toast]);

  const handleToggleComplete = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed, lastModified: new Date().toISOString() } : task
      )
    );
  }, []);

  const handleDeleteRequest = (id: string) => {
    setTaskToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDeleteId) {
      const taskToDelete = tasks.find(t => t.id === taskToDeleteId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDeleteId));
      if (taskToDelete) {
        toast({ title: "Tarea Eliminada", description: `La tarea "${taskToDelete.title}" ha sido eliminada.` });
      }
    }
    setIsDeleteDialogOpen(false);
    setTaskToDeleteId(null);
  };

  const cancelDeleteTask = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDeleteId(null);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === "all" || (filter === "completed" && task.completed) || (filter === "active" && !task.completed);
    const matchesSearch = searchTerm === "" || task.title.toLowerCase().includes(searchTerm.toLowerCase()) || (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.lastModified || b.createdAt).getTime() - new Date(a.lastModified || a.createdAt).getTime();
    }
    return a.completed ? 1 : -1;
  });

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  const clearAllTasks = () => {
    setTasks([]);
    toast({ title: "Todas las Tareas Eliminadas", description: "Se han eliminado todas tus tareas." });
  };

  const markAllAsComplete = () => {
    setTasks(prevTasks => prevTasks.map(task => ({ ...task, completed: true, lastModified: new Date().toISOString() })));
    toast({ title: "Tareas Completadas", description: "Todas las tareas se han marcado como completadas." });
  };

  return (
    <div className="container mx-auto max-w-3xl py-4 sm:py-8 px-2 sm:px-4 h-full">
      <Card className="bg-card/90 backdrop-blur-sm rounded-none shadow-lg border-2 border-foreground h-full flex flex-col">
        <CardHeader className="text-center pb-4 relative">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-primary tracking-wider">
            PixelPlanner
          </CardTitle>
           <CardDescription className="text-xs sm:text-sm text-muted-foreground">Tus tareas diarias, ¡con un toque pixelado!</CardDescription>
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-none border-foreground h-8 w-8 sm:h-10 sm:w-10">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Opciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none border-foreground bg-card">
                <DropdownMenuLabel>Acciones Rápidas</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={markAllAsComplete} className="cursor-pointer hover:bg-accent/80">
                  <ListChecks className="mr-2 h-4 w-4" />
                  <span>Marcar Todas Como Completas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearAllTasks} className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive">
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Eliminar Todas las Tareas</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border"/>
                <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="cursor-pointer hover:bg-accent/80">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Ver Reporte de Tiempo</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border"/>
                 <DropdownMenuItem disabled className="cursor-not-allowed">
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Cambiar Tema (Próximamente)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <Separator className="mb-4 sm:mb-6 border-t-2 border-foreground"/>
        <CardContent className="flex flex-col flex-grow overflow-hidden p-2 sm:p-6">
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Progreso:</p>
              <p className="text-xs sm:text-sm font-semibold text-primary">{`${completedTasksCount} / ${totalTasksCount} completadas`}</p>
            </div>
            <Progress value={progressPercentage} className="h-2 sm:h-3 rounded-none bg-muted border border-foreground" indicatorClassName="bg-primary" />
          </div>

           <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-2 border-2 border-input bg-background rounded-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
            />
            <div className="flex gap-1 sm:gap-2">
              {(["all", "active", "completed"] as FilterType[]).map(filterType => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  onClick={() => setFilter(filterType)}
                  className={cn("capitalize flex-1 sm:flex-initial rounded-none border-foreground text-xs px-2 sm:px-3 py-1 h-auto sm:text-sm", filter === filterType && "btn-pixel")}
                >
                  {filterType === "all" ? "Todas" : filterType === "active" ? "Activas" : "Completas"}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col flex-grow overflow-hidden min-h-0">
            {isClient ? (
              <>
                {sortedTasks.length > 0 ? (
                  <TaskList
                    tasks={sortedTasks}
                    onToggleComplete={handleToggleComplete}
                    onDeleteRequest={handleDeleteRequest}
                    onEditRequest={handleOpenEditTaskDialog}
                    className="flex-grow" 
                  />
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                    {tasks.length === 0 ? (
                      <p className="text-muted-foreground">¡No hay tareas aún! Añade una para empezar.</p>
                    ) : searchTerm ? (
                      <p className="text-muted-foreground">No se encontraron tareas con "{searchTerm}".</p>
                    ) : (
                      <p className="text-muted-foreground">No hay tareas que coincidan con el filtro seleccionado.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-muted-foreground p-8 flex-grow flex items-center justify-center">Cargando tareas...</p>
            )}
          </div>
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
          <TaskReportModal
            isOpen={isReportModalOpen}
            onOpenChange={setIsReportModalOpen}
            tasks={tasks}
          />
          <Button
            onClick={handleOpenAddTaskDialog}
            className={cn("fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg btn-pixel border-2 border-primary-foreground")}
            aria-label="Añadir Nueva Tarea"
            title="Añadir Nueva Tarea"
          >
            <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="sr-only">Añadir Nueva Tarea</span>
          </Button>
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none border-2 border-foreground bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la tarea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteTask} className="rounded-none border-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="btn-pixel bg-destructive hover:bg-destructive/90 border-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
