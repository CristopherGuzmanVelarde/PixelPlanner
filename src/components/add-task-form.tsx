"use client";

import { useState, useEffect } from 'react';
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
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaveTask: (taskData: { title: string; description?: string; iconUrl: string }) => void;
  taskToEdit: Task | null;
}

// Placeholder pixel art icons
const defaultIcons = [
  "https://picsum.photos/seed/pixel1/64/64",
  "https://picsum.photos/seed/pixel2/64/64",
  "https://picsum.photos/seed/pixel3/64/64",
  "https://picsum.photos/seed/pixel4/64/64",
  "https://picsum.photos/seed/pixel5/64/64",
  "https://picsum.photos/seed/pixel6/64/64",
];

export function AddTaskForm({ isOpen, onOpenChange, onSaveTask, taskToEdit }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(defaultIcons[0]);
  const [customIconUrl, setCustomIconUrl] = useState('');

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

    onSaveTask({
      title: title.trim(),
      description: description.trim() || undefined,
      iconUrl: selectedIcon,
    });
    onOpenChange(false); // Close dialog on successful submit
  };

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
            <div className="grid grid-cols-4 gap-2 mb-2">
              {defaultIcons.map((icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleIconSelect(icon)}
                  className={cn(
                    'p-1 border-2 rounded-none transition-all',
                    selectedIcon === icon
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
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
                    data-ai-hint="pixel art icon"
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
                    onError={(e) => {
                       console.error("Error loading custom icon:", e);
                    }}
                  />
               </div>
             )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" className="rounded-none border-foreground" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="btn-pixel">
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
