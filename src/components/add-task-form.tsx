
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
import { generatePixelArtIcon } from '@/ai/flows/generate-pixel-art-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddTaskFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaveTask: (taskData: { title: string; description?: string; iconUrl: string }) => void;
  taskToEdit: Task | null;
}

// Placeholder pixel art icons
const defaultIcons = [
  "https://picsum.photos/seed/food/64/64",
  "https://picsum.photos/seed/work/64/64",
  "https://picsum.photos/seed/hobby/64/64",
  "https://picsum.photos/seed/health/64/64",
  "https://picsum.photos/seed/home/64/64",
  "https://picsum.photos/seed/social/64/64",
];

const defaultIconHints: Record<string, string> = {
  "https://picsum.photos/seed/food/64/64": "food fruit",
  "https://picsum.photos/seed/work/64/64": "work computer",
  "https://picsum.photos/seed/hobby/64/64": "hobby book",
  "https://picsum.photos/seed/health/64/64": "health heart",
  "https://picsum.photos/seed/home/64/64": "home house",
  "https://picsum.photos/seed/social/64/64": "social chat",
};


export function AddTaskForm({ isOpen, onOpenChange, onSaveTask, taskToEdit }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(defaultIcons[0]);
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setSelectedIcon(taskToEdit.iconUrl);
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
    if (!title.trim()) return;
    if (!selectedIcon) {
        toast({
            title: "Icon Required",
            description: "Please select or generate an icon for the task.",
            variant: "destructive",
        });
        return;
    }

    onSaveTask({
      title: title.trim(),
      description: description.trim() || undefined,
      iconUrl: selectedIcon,
    });
    onOpenChange(false); // Close dialog on successful submit
  };
  
  const handleGenerateIcon = useCallback(async () => {
    if (!title.trim()) {
      toast({
        title: "Title needed for icon generation",
        description: "Please enter a task title to generate a relevant icon.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingIcon(true);
    try {
      const result = await generatePixelArtIcon({ prompt: title });
      if (result.iconDataUri) {
        setSelectedIcon(result.iconDataUri);
        setCustomIconUrl(result.iconDataUri); // Also set as custom URL so it's displayed as preview
        toast({
          title: "Icon Generated!",
          description: "A new pixel art icon has been created for your task.",
        });
      } else {
        throw new Error("No icon data URI returned");
      }
    } catch (error) {
      console.error("Error generating icon:", error);
      toast({
        title: "Icon Generation Failed",
        description: "Could not generate a pixel art icon. Please try again or select a default icon.",
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
            {taskToEdit ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Water the plants"
              required
              className="rounded-none border-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Use the green watering can"
              className="rounded-none border-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label>Select Icon</Label>
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
                  aria-label={`Select icon ${index + 1}`}
                >
                  <Image
                    src={icon}
                    alt={`Pixel icon ${index + 1}`}
                    width={48}
                    height={48}
                    className="image-pixelated"
                    data-ai-hint={defaultIconHints[icon] || "pixel art icon"}
                  />
                </button>
              ))}
            </div>
             <Label htmlFor="custom-icon">Or Enter Image URL</Label>
             <Input
              id="custom-icon"
              type="url"
              value={customIconUrl}
              onChange={handleCustomIconChange}
              placeholder="https://... or data:image/..."
              className="rounded-none border-foreground"
            />
             {customIconUrl && selectedIcon === customIconUrl && (
               <div className="mt-2 p-1 border-2 border-primary rounded-none w-fit">
                 <Image
                    src={customIconUrl}
                    alt="Custom Icon Preview"
                    width={48}
                    height={48}
                    className="image-pixelated"
                    data-ai-hint="custom pixel art"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                       const target = e.target as HTMLImageElement;
                       console.error("Error loading custom icon URL:", target.src);
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2v0Z"/><path d="M12 12a10 10 0 0 0-4.5 8.13"/><path d="m17.5 6.5-1.5 1.5"/><path d="m6.5 17.5-1.5 1.5"/><path d="m17.5 17.5-1.5-1.5"/><path d="m6.5 6.5-1.5-1.5"/><path d="M12 6.5V5"/><path d="m20 14.2-.5.5M4 9.8l-.5-.5"/><path d="M17.5 12h1.5"/><path d="M5 12h1.5"/></svg> /* Sparkles icon */
              )}
              {isGeneratingIcon ? 'Generating...' : 'Generate Icon with AI'}
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="rounded-none border-foreground">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="btn-pixel">
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

