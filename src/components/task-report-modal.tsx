
"use client";

import type { Task } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo, useEffect, useState } from 'react';

interface TaskReportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tasks: Task[];
}

interface ChartData {
  name: string;
  tiempo: number;
}

export function TaskReportModal({ isOpen, onOpenChange, tasks }: TaskReportModalProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalTimeSpent = useMemo(() => {
    return tasks.reduce((total, task) => total + (task.timeSpent || 0), 0);
  }, [tasks]);

  const tasksWithTime = useMemo(() => {
    return tasks.filter(task => (task.timeSpent || 0) > 0);
  }, [tasks]);

  const chartData: ChartData[] = useMemo(() => {
    return tasksWithTime.map(task => ({
      name: task.title.length > 15 ? `${task.title.substring(0, 15)}...` : task.title,
      tiempo: task.timeSpent || 0,
    }));
  }, [tasksWithTime]);

  if (!isClient) {
    return null; // Evita renderizar el modal en el servidor para prevenir errores de hidratación con Recharts
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card rounded-none border-2 border-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Reporte de Tiempo Dedicado</DialogTitle>
          <DialogDescription>
            Aquí puedes ver un resumen del tiempo invertido en tus tareas.
          </DialogDescription>
        </DialogHeader>

        {tasksWithTime.length > 0 ? (
          <>
            <div className="my-4 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} label={{ value: 'Minutos', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', style: {textAnchor: 'middle'} }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', paddingTop: '10px' }}/>
                  <Bar dataKey="tiempo" fill="hsl(var(--primary))" radius={[parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius')) || 0, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius')) || 0, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ScrollArea className="h-[200px] pr-4 mt-4 border border-border p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Tarea</TableHead>
                    <TableHead className="text-right">Tiempo (min)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasksWithTime.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell className="text-right">{task.timeSpent || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="mt-4 text-right font-semibold text-lg">
              Tiempo Total Dedicado: {totalTimeSpent} minutos
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" className="opacity-60 mb-3 image-pixelated stroke-muted-foreground fill-transparent">
              <title>No hay datos para el reporte</title>
              {/* Border */}
              <rect x="3" y="3" width="18" height="18" rx="0" strokeWidth="2" />
              {/* Grid lines (thinner) */}
              <line x1="3" y1="9" x2="21" y2="9" strokeWidth="1" className="stroke-muted-foreground/50" />
              <line x1="3" y1="15" x2="21" y2="15" strokeWidth="1" className="stroke-muted-foreground/50" />
              <line x1="9" y1="3" x2="9" y2="21" strokeWidth="1" className="stroke-muted-foreground/50" />
              <line x1="15" y1="3" x2="15" y2="21" strokeWidth="1" className="stroke-muted-foreground/50" />
              {/* "X" in the middle */}
              <line x1="7" y1="7" x2="17" y2="17" strokeWidth="2.5" />
              <line x1="17" y1="7" x2="7" y2="17" strokeWidth="2.5" />
            </svg>
            No hay tareas con tiempo registrado para mostrar en el reporte.
          </div>
        )}

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="rounded-none border-foreground hover:bg-muted">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
