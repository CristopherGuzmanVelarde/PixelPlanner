
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/types';
import { TaskList } from '@/components/task-list';
import { AddTaskForm } from '@/components/add-task-form';
import { TaskReportModal } from '@/components/task-report-modal';
import { PomodoroTimer } from '@/components/pomodoro-timer'; // Nueva importación
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, ListChecks, Archive, Settings, FileText, Info, Loader2, Sun, Moon, ListTodo, Timer } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
type Theme = "light" | "dark";
type ActiveSection = "tasks" | "pomodoro"; // Nuevo tipo

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
  const [theme, setTheme] = useState<Theme>('light');
  const [activeSection, setActiveSection] = useState<ActiveSection>('tasks'); // Nuevo estado
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setTasks(loadTasksFromLocalStorage());

    const storedTheme = localStorage.getItem('pixelPlannerTheme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      saveTasksToLocalStorage(tasks);
    }
  }, [tasks, isClient]);

  useEffect(() => {
    if (isClient) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('pixelPlannerTheme', theme);
    }
  }, [theme, isClient]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleOpenAddTaskDialog = () => {
    setTaskToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditTaskDialog = (task: Task) => {
    setTaskToEdit(task);
    setIsFormDialogOpen(true);
  };

  const handleFormDialogClose = (open: boolean) => {
    setIsFormDialogOpen(open);
    if (!open) {
      setTaskToEdit(null);
    }
  };

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
        toast({ title: "Tarea Eliminada", description: `La tarea "${taskToDelete.title}" ha sido eliminada.`, variant: "destructive" });
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
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
                          task.title.toLowerCase().includes(searchTermLower) || 
                          (task.description && task.description.toLowerCase().includes(searchTermLower)) ||
                          (task.category && task.category.toLowerCase().includes(searchTermLower));
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
    toast({ title: "Todas las Tareas Eliminadas", description: "Se han eliminado todas tus tareas.", variant: "destructive" });
  };

  const markAllAsComplete = () => {
    setTasks(prevTasks => prevTasks.map(task => ({ ...task, completed: true, lastModified: new Date().toISOString() })));
    toast({ title: "Tareas Completadas", description: "Todas las tareas se han marcado como completadas." });
  };

  return (
    <TooltipProvider>
    <div className="container mx-auto max-w-3xl py-4 sm:py-8 px-2 sm:px-4 h-full">
      <Card className="bg-card/90 backdrop-blur-sm rounded-none shadow-lg border-2 border-foreground h-full flex flex-col">
        <CardHeader className="text-center pb-4 relative">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-primary tracking-wider">
            PixelPlanner
          </CardTitle>
           <CardDescription className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
             Tus tareas y pomodoros, ¡con un toque pixelado! 
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help text-muted-foreground/70 hover:text-muted-foreground"/>
                </TooltipTrigger>
                <TooltipContent className="rounded-none border-foreground bg-popover text-popover-foreground shadow-md max-w-xs">
                    <p className="text-xs">Los iconos de las tareas se generan con IA. Elige un buen título para mejores resultados.</p>
                </TooltipContent>
            </Tooltip>
            </CardDescription>
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-none border-foreground hover:bg-accent/20 h-8 w-8 sm:h-10 sm:w-10">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Opciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none border-2 border-foreground bg-card shadow-xl">
                <DropdownMenuLabel>Opciones Generales</DropdownMenuLabel>
                 <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer hover:!bg-accent/80 focus:!bg-accent/90">
                  {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  <span>Cambiar a Tema {theme === 'light' ? 'Oscuro' : 'Claro'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuLabel>Acciones de Tareas</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={markAllAsComplete} disabled={activeSection !== 'tasks'} className="cursor-pointer hover:!bg-accent/80 focus:!bg-accent/90">
                  <ListChecks className="mr-2 h-4 w-4" />
                  <span>Marcar Todas Como Completas</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} disabled={activeSection !== 'tasks'} className="cursor-pointer hover:!bg-accent/80 focus:!bg-accent/90">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Ver Reporte de Tiempo</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearAllTasks} disabled={activeSection !== 'tasks'} className="text-destructive cursor-pointer hover:!bg-destructive/10 hover:!text-destructive focus:!bg-destructive/20 focus:!text-destructive">
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Eliminar Todas las Tareas</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <div className="flex justify-center border-b-2 border-foreground mb-1 sm:mb-2">
          <Button
            variant={activeSection === 'tasks' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('tasks')}
            className={cn(
              "flex-1 sm:flex-none rounded-none px-4 py-3 text-sm sm:text-base",
              activeSection === 'tasks' ? "border-b-0 border-x-2 border-t-2 border-primary-foreground btn-pixel shadow-none" : "text-muted-foreground hover:bg-accent/10",
              activeSection !== 'tasks' && "border-transparent"
            )}
          >
            <ListTodo className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Tareas
          </Button>
          <Button
            variant={activeSection === 'pomodoro' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('pomodoro')}
            className={cn(
              "flex-1 sm:flex-none rounded-none px-4 py-3 text-sm sm:text-base",
              activeSection === 'pomodoro' ? "border-b-0 border-x-2 border-t-2 border-primary-foreground btn-pixel shadow-none" : "text-muted-foreground hover:bg-accent/10",
              activeSection !== 'pomodoro' && "border-transparent"
            )}
          >
            <Timer className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Pomodoro
          </Button>
        </div>
        
        <CardContent className="flex flex-col flex-grow overflow-hidden p-2 sm:p-6">
          {activeSection === 'tasks' && (
            <>
              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Progreso:</p>
                  <p className="text-xs sm:text-sm font-semibold text-primary">{`${completedTasksCount} / ${totalTasksCount} completadas`}</p>
                </div>
                <Progress 
                  value={progressPercentage} 
                  aria-label={`Progreso de tareas: ${Math.round(progressPercentage)}% completado`}
                  className="h-2 sm:h-3 rounded-none bg-muted border border-foreground" 
                  indicatorClassName="bg-primary" 
                />
              </div>

               <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
                <input
                  type="text"
                  placeholder="Buscar tareas (título, desc, categoría)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow p-2 border-2 border-input bg-input rounded-none focus:ring-2 focus:ring-ring focus:border-ring text-sm placeholder:text-muted-foreground/80"
                />
                <div className="flex gap-1 sm:gap-2">
                  {(["all", "active", "completed"] as FilterType[]).map(filterType => (
                    <Button
                      key={filterType}
                      variant={filter === filterType ? "default" : "outline"}
                      onClick={() => setFilter(filterType)}
                      className={cn(
                        "capitalize flex-1 sm:flex-initial rounded-none border-2 text-xs px-2 py-1 h-auto sm:text-sm",
                        filter === filterType ? "btn-pixel border-primary-foreground" : "border-foreground hover:bg-accent/50",
                        filter !== filterType && "shadow-[1px_1px_0px_0px_hsl(var(--foreground))] hover:shadow-[0.5px_0.5px_0px_0px_hsl(var(--foreground))]"
                      )}
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
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" className="opacity-50 mb-4 image-pixelated fill-current text-muted-foreground">
                          <title>Lista de tareas vacía</title>
                          {/* Top Roll Part */}
                          <rect x="4" y="4" width="24" height="4" />
                          <rect x="3" y="5" width="1" height="2" />
                          <rect x="28" y="5" width="1" height="2" />
                          {/* Paper Part */}
                          <rect x="6" y="8" width="20" height="18" />
                          {/* Bottom Roll Part */}
                          <rect x="4" y="26" width="24" height="4" />
                          <rect x="3" y="25" width="1" height="2" />
                          <rect x="28" y="25" width="1" height="2" />
                          {/* Subtle page content indication */}
                          <rect x="9" y="12" width="14" height="2" className="fill-current text-muted-foreground/60" />
                          <rect x="9" y="16" width="14" height="2" className="fill-current text-muted-foreground/60" />
                          <rect x="9" y="20" width="10" height="2" className="fill-current text-muted-foreground/60" />
                        </svg>
                        {tasks.length === 0 ? (
                          <p className="text-muted-foreground">¡No hay tareas aún! Añade una para empezar.</p>
                        ) : searchTerm ? (
                          <p className="text-muted-foreground">No se encontraron tareas con "{searchTerm}".</p>
                        ) : (
                           <p className="text-muted-foreground">No hay tareas que coincidan con el filtro <span className="font-semibold text-foreground/80">{filter === "all" ? "todas" : filter}</span>.</p>
                        )}
                         <Button onClick={handleOpenAddTaskDialog} className="mt-6 btn-pixel">
                            <Plus className="mr-2 h-4 w-4" /> Añadir Primera Tarea
                         </Button>
                      </div>
                    )}
                  </>
                ) : (
                   <div className="flex-grow flex flex-col items-center justify-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-center text-muted-foreground">Cargando tareas pixeladas...</p>
                  </div>
                )}
              </div>
            </>
          )}
          {activeSection === 'pomodoro' && (
            <PomodoroTimer />
          )}
        </CardContent>
      </Card>

      {isClient && activeSection === 'tasks' && (
        <>
          <AddTaskForm
            isOpen={isFormDialogOpen}
            onOpenChange={handleFormDialogClose}
            onSaveTask={handleSaveTask}
            taskToEdit={taskToEdit}
          />
          <TaskReportModal
            isOpen={isReportModalOpen}
            onOpenChange={setIsReportModalOpen}
            tasks={tasks}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleOpenAddTaskDialog}
                className={cn("fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg btn-pixel border-2 border-primary-foreground")}
                aria-label="Añadir Nueva Tarea"
              >
                <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
                <span className="sr-only">Añadir Nueva Tarea</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="rounded-none border-foreground bg-popover text-popover-foreground shadow-md">
                <p>Añadir Nueva Tarea</p>
            </TooltipContent>
          </Tooltip>
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none border-2 border-foreground bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la tarea de tu lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteTask} className="rounded-none border-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="btn-pixel bg-destructive hover:bg-destructive/90 border-destructive-foreground text-destructive-foreground hover:text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}

