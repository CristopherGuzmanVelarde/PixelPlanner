
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
import { cn } from '@/lib/utils';
import { generatePixelArtIconFromPrompt } from '@/ai/flows/generate-pixel-art-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

interface AddTaskFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaveTask: (taskData: { title: string; description?: string; iconUrl: string; category?: string; dueDate?: string; timeSpent?: number }) => void;
  taskToEdit: Task | null;
}

const defaultIcons = [
  "https://placehold.co/64x64.png",
  "https://placehold.co/64x64.png",
  "https://placehold.co/64x64.png",
  "https://placehold.co/64x64.png",
  "https://placehold.co/64x64.png",
  "https://placehold.co/64x64.png",
];

const defaultIconHints: Record<number, string> = {
  0: "comida fruta",
  1: "trabajo computadora",
  2: "hobby libro",
  3: "salud corazon",
  4: "hogar casa",
  5: "social chat",
};


export function AddTaskForm({ isOpen, onOpenChange, onSaveTask, taskToEdit }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(defaultIcons[0]);
  const [customIconUrl, setCustomIconUrl] = useState('');
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
        setSelectedIcon(taskToEdit.iconUrl);
        setCategory(taskToEdit.category || '');
        setDueDate(taskToEdit.dueDate || '');
        setTimeSpent(taskToEdit.timeSpent !== undefined ? taskToEdit.timeSpent : '');
        if (!defaultIcons.includes(taskToEdit.iconUrl)) {
          setCustomIconUrl(taskToEdit.iconUrl);
        } else {
          setCustomIconUrl('');
        }
      } else {
        // Reset for "add new" mode
        setTitle('');
        setDescription('');
        setSelectedIcon(defaultIcons[0]);
        setCustomIconUrl('');
        setCategory('');
        setDueDate('');
        setTimeSpent('');
      }
    }
  }, [isOpen, taskToEdit]);

  const handleIconSelect = (iconUrl: string) => {
    setSelectedIcon(iconUrl);
    setCustomIconUrl(''); 
  };

  const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomIconUrl(url);
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) {
        setSelectedIcon(url);
    } else if (url === '') {
       setSelectedIcon(defaultIcons[0]);
    }
  };

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
            description: "Por favor, selecciona o genera un icono para la tarea.",
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
    try {
      const result = await generatePixelArtIconFromPrompt({ prompt: title });
      if (result.iconDataUri) {
        setSelectedIcon(result.iconDataUri);
        setCustomIconUrl(result.iconDataUri); 
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
        description: "No se pudo generar un icono pixel art. Por favor, inténtalo de nuevo o selecciona un icono predeterminado.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIcon(false);
    }
  }, [title, toast]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card rounded-none border-2 border-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {taskToEdit ? 'Editar Tarea' : 'Añadir Nueva Tarea'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título de la Tarea</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Regar las plantas"
              required
              className="rounded-none border-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Usar la regadera verde"
              className="rounded-none border-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Categoría (Opcional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Hogar, Trabajo"
              className="rounded-none border-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Fecha de Entrega (Opcional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-none border-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timeSpent">Tiempo Dedicado (minutos, Opcional)</Label>
            <Input
              id="timeSpent"
              type="number"
              value={timeSpent}
              min="0"
              onChange={(e) => setTimeSpent(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 30"
              className="rounded-none border-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label>Seleccionar Icono</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
              {defaultIcons.map((icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleIconSelect(icon)}
                  className={cn(
                    'p-1 border-2 rounded-none transition-all aspect-square flex items-center justify-center',
                    selectedIcon === icon
                      ? 'border-primary ring-2 ring-primary ring-offset-2 bg-primary/10'
                      : 'border-border hover:border-accent'
                  )}
                  aria-label={`Seleccionar icono ${index + 1}`}
                >
                  <Image
                    src={icon}
                    alt={`Icono predeterminado ${index + 1}`}
                    width={48}
                    height={48}
                    className="image-pixelated"
                    data-ai-hint={defaultIconHints[index] || "icono pixel art"}
                  />
                </button>
              ))}
            </div>
             <Label htmlFor="custom-icon">O Ingresa URL de Imagen</Label>
             <Input
              id="custom-icon"
              type="url"
              value={customIconUrl}
              onChange={handleCustomIconChange}
              placeholder="https://... o data:image/..."
              className="rounded-none border-foreground"
            />
             {customIconUrl && selectedIcon === customIconUrl && (
               <div className="mt-2 p-1 border-2 border-primary rounded-none w-fit">
                 <Image
                    src={customIconUrl}
                    alt="Vista Previa Icono Personalizado"
                    width={48}
                    height={48}
                    className="image-pixelated"
                    data-ai-hint="custom pixel art"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                       const target = e.target as HTMLImageElement;
                       console.error("Error al cargar URL de icono personalizado:", target.src);
                       // Optionally set to a fallback or clear the selection
                       // setSelectedIcon(defaultIcons[0]); 
                       // setCustomIconUrl('');
                    }}
                  />
               </div>
             )}
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateIcon}
              disabled={isGeneratingIcon || !title.trim()}
              className="rounded-none border-foreground mt-2 w-full"
            >
              {isGeneratingIcon ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isGeneratingIcon ? 'Generando...' : 'Generar Icono con IA'}
            </Button>
          </div>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
               <Button type="button" variant="outline" className="rounded-none border-foreground">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="btn-pixel">
              {taskToEdit ? 'Guardar Cambios' : 'Añadir Tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
