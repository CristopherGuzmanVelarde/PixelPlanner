export type Task = {
  id: string;
  title: string;
  description?: string;
  iconUrl: string; // URL for the pixel art image/icon
  completed: boolean;
  category?: string;
  dueDate?: string;
  timeSpent?: number; // in minutes
  createdAt: string;
  lastModified: string;
};
