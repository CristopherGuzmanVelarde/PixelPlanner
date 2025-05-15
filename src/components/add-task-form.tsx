
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { generatePixelArtIconFromPrompt } from '@/ai/flows/generate-pixel-art-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ImageIcon } from 'lucide-react';

interface AddTaskFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaveTask: (taskData: { title: string; description?: string; iconUrl: string; category?: string; dueDate?: string; timeSpent?: number }) => void;
  taskToEdit: Task | null;
}

export function AddTaskForm({ isOpen, onOpenChange, onSaveTask, taskToEdit }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(''); // Stores AI generated icon or from taskToEdit
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [timeSpent, setTimeSpent] = useState<number | string>('');
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setSelectedIcon(taskToEdit.iconUrl || '');
        setCategory(taskToEdit.category || '');
        setDueDate(taskToEdit.dueDate || '');
        setTimeSpent(taskToEdit.timeSpent !== undefined ? taskToEdit.timeSpent : '');
      } else {
        // Reset for "add new" mode
        setTitle('');
        setDescription('');
        setSelectedIcon('');
        setCategory('');
        setDueDate('');
        setTimeSpent('');
      }
    }
  }, [isOpen, taskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        toast({
            title: "Título Requerido",
            description: "Por favor, ingresa un título para la tarea.",
            variant: "destructive",
        });
        return;
    }
    if (!selectedIcon) {
        toast({
            title: "Icono Requerido",
            description: "Por favor, genera un icono para la tarea.",
            variant: "destructive",
        });
        return;
    }

    onSaveTask({
      title: title.trim(),
      description: description.trim() || undefined,
      iconUrl: selectedIcon,
      category: category.trim() || undefined,
      dueDate: dueDate || undefined,
      timeSpent: timeSpent === '' ? undefined : Number(timeSpent),
    });
    onOpenChange(false); 
  };
  
  const handleGenerateIcon = useCallback(async () => {
    if (!title.trim()) {
      toast({
        title: "Título necesario para generar el icono",
        description: "Por favor, ingresa un título para la tarea para generar un icono relevante.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingIcon(true);
    setSelectedIcon(''); // Clear previous icon before generating new one
    try {
      const result = await generatePixelArtIconFromPrompt({ prompt: title });
      if (result.iconDataUri) {
        setSelectedIcon(result.iconDataUri);
        toast({
          title: "¡Icono Generado!",
          description: "Se ha creado un nuevo icono pixel art para tu tarea.",
        });
      } else {
        throw new Error("No se devolvió URI de datos del icono");
      }
    } catch (error) {
      console.error("Error generando icono:", error);
      toast({
        title: "Falló la Generación del Icono",
        description: "No se pudo generar un icono pixel art. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIcon(false);
    }
  }, [title, toast]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card rounded-none border-2 border-foreground flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {taskToEdit ? 'Editar Tarea' : 'Añadir Nueva Tarea'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-6 -mr-6"> {/* pr-6 and -mr-6 to account for scrollbar */}
          <form onSubmit={handleSubmit} id="task-form" className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-foreground">Título de la Tarea</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Regar las plantas"
                required
                className="rounded-none border-foreground bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-foreground">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Usar la regadera verde"
                className="rounded-none border-foreground bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-foreground">Categoría (Opcional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Hogar, Trabajo"
                className="rounded-none border-foreground bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate" className="text-foreground">Fecha de Entrega (Opcional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-none border-foreground bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeSpent" className="text-foreground">Tiempo Dedicado (minutos, Opcional)</Label>
              <Input
                id="timeSpent"
                type="number"
                value={timeSpent}
                min="0"
                onChange={(e) => setTimeSpent(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ej: 30"
                className="rounded-none border-foreground bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            {/* Icon Section */}
            <div className="grid gap-2">
              <Label className="text-foreground">Icono de la Tarea</Label>
              <div className="mt-1 p-1 border-2 border-dashed border-border rounded-none w-20 h-20 mx-auto flex items-center justify-center bg-muted/30">
                {selectedIcon && !isGeneratingIcon ? (
                  <Image
                    src={selectedIcon}
                    alt="Icono de la tarea"
                    width={64}
                    height={64}
                    className="image-pixelated object-contain"
                    data-ai-hint="generated pixelart"
                    onError={() => {
                      console.error("Error al cargar el icono generado:", selectedIcon);
                      toast({ title: "Error de Icono", description: "No se pudo cargar el icono generado.", variant: "destructive"});
                      setSelectedIcon(''); // Clear if error
                    }}
                  />
                ) : isGeneratingIcon ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateIcon}
                disabled={isGeneratingIcon || !title.trim()}
                className="rounded-none border-foreground mt-2 w-full hover:bg-accent hover:text-accent-foreground"
              >
                {isGeneratingIcon ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {isGeneratingIcon ? 'Generando...' : 'Generar Icono con IA'}
              </Button>
              {!selectedIcon && !isGeneratingIcon && (
                  <p className="text-xs text-muted-foreground text-center">
                      {title.trim() ? "Haz clic arriba para generar un icono." : "Ingresa un título para habilitar la generación de iconos."}
                  </p>
              )}
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t border-border">
          <DialogClose asChild>
             <Button type="button" variant="outline" className="rounded-none border-foreground hover:bg-muted">Cancelar</Button>
          </DialogClose>
          <Button type="submit" form="task-form" className="btn-pixel">
            {taskToEdit ? 'Guardar Cambios' : 'Añadir Tarea'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


    