"use client";

import { useState } from 'react';
import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'; // Import cn

interface AddTaskFormProps {
  onAddTask: (newTask: Omit<Task, 'id' | 'completed'>) => void;
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

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(defaultIcons[0]);
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIconSelect = (iconUrl: string) => {
    setSelectedIcon(iconUrl);
    setCustomIconUrl(''); // Clear custom URL if default is selected
  };

  const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomIconUrl(url);
    // Basic validation for URL format (optional)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) { // Allow data URIs
        setSelectedIcon(url);
    } else if (url === '') {
       setSelectedIcon(defaultIcons[0]); // Reset to default if empty
    }
    // Potentially add more robust URL validation or image loading preview
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return; // Basic validation

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      iconUrl: selectedIcon,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSelectedIcon(defaultIcons[0]);
    setCustomIconUrl('');
    setIsDialogOpen(false); // Close dialog on successful submit
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className={cn("fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg btn-pixel")}> {/* Use btn-pixel style */}
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add New Task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card rounded-none border-2 border-foreground"> {/* Updated for pixel style */}
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Task</DialogTitle>
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
              className="rounded-none border-foreground" /* Updated for pixel style */
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Use the green watering can"
              className="rounded-none border-foreground" /* Updated for pixel style */
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
                  )} /* Updated for pixel style */
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
              className="rounded-none border-foreground" /* Updated for pixel style */
            />
             {customIconUrl && selectedIcon === customIconUrl && (
               <div className="mt-2 p-1 border-2 border-primary rounded-none w-fit"> {/* Updated for pixel style */}
                 <Image
                    src={customIconUrl}
                    alt="Custom Icon Preview"
                    width={48}
                    height={48}
                    className="image-pixelated"
                    data-ai-hint="custom pixel art"
                    onError={(e) => {
                      // Handle image loading error, maybe show a placeholder or default
                       console.error("Error loading custom icon:", e);
                       // Optionally reset to default if error:
                       // setSelectedIcon(defaultIcons[0]);
                       // setCustomIconUrl('');
                    }}
                  />
               </div>
             )}
          </div>
          <DialogFooter>
            <DialogClose> {/* Removed asChild prop to fix hydration error */}
               <Button type="button" variant="secondary" className="rounded-none border-foreground">Cancel</Button> {/* Updated for pixel style */}
            </DialogClose>
            <Button type="submit" className="btn-pixel">Add Task</Button> {/* Use btn-pixel style */}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
