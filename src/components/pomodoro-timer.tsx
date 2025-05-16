
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const POMODORO_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const POMODOROS_UNTIL_LONG_BREAK = 4;

type PomodoroMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export function PomodoroTimer() {
  const [mode, setMode] = useState<PomodoroMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [pomodorosCompletedThisCycle, setPomodorosCompletedThisCycle] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const getDuration = useCallback((currentMode: PomodoroMode) => {
    switch (currentMode) {
      case 'pomodoro':
        return POMODORO_DURATION;
      case 'shortBreak':
        return SHORT_BREAK_DURATION;
      case 'longBreak':
        return LONG_BREAK_DURATION;
      default:
        return POMODORO_DURATION;
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(getDuration(mode));
    }
  }, [mode, isActive, getDuration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
      
      // Notification and mode switch logic
      let notificationTitle = "";
      let nextMode: PomodoroMode = 'pomodoro';

      if (mode === 'pomodoro') {
        notificationTitle = "¡Pomodoro completado!";
        const newCompletedCount = pomodorosCompletedThisCycle + 1;
        setPomodorosCompletedThisCycle(newCompletedCount);
        if (newCompletedCount % POMODOROS_UNTIL_LONG_BREAK === 0) {
          nextMode = 'longBreak';
          toast({ title: notificationTitle, description: "¡Buen trabajo! Hora de un descanso largo." });
        } else {
          nextMode = 'shortBreak';
           toast({ title: notificationTitle, description: "Tómate un descanso corto." });
        }
      } else if (mode === 'shortBreak') {
        notificationTitle = "¡Descanso corto terminado!";
        nextMode = 'pomodoro';
        toast({ title: notificationTitle, description: "De vuelta al trabajo." });
      } else { // longBreak
        notificationTitle = "¡Descanso largo terminado!";
        nextMode = 'pomodoro';
        setPomodorosCompletedThisCycle(0); // Reset cycle
        toast({ title: notificationTitle, description: "¡A seguir produciendo!" });
      }
      setMode(nextMode);
      setTimeLeft(getDuration(nextMode));

      // Attempt to play a sound (requires user interaction first in most browsers)
      // You might want to add a dedicated "enable sound" button for better UX
      try {
        const audio = new Audio('/notification.mp3'); // Make sure you have this file in /public
        audio.play().catch(e => console.warn("Error al reproducir sonido:", e));
      } catch(e) {
        console.warn("No se pudo reproducir sonido de notificación:", e);
      }

    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, mode, pomodorosCompletedThisCycle, getDuration, toast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setTimeLeft(getDuration(mode));
  };

  const selectMode = (newMode: PomodoroMode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    if (newMode === 'pomodoro') setPomodorosCompletedThisCycle(0); // Reset if manually switching to pomodoro
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const modeConfig = {
    pomodoro: { label: 'Pomodoro', icon: Brain, duration: POMODORO_DURATION },
    shortBreak: { label: 'Descanso Corto', icon: Coffee, duration: SHORT_BREAK_DURATION },
    longBreak: { label: 'Descanso Largo', icon: Coffee, duration: LONG_BREAK_DURATION },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm rounded-none border-2 border-foreground shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
            <Timer className="mr-2 h-7 w-7 sm:h-8 sm:w-8" />
            Temporizador Pomodoro
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 sm:space-y-8">
          <div className="flex space-x-2">
            {(Object.keys(modeConfig) as PomodoroMode[]).map((key) => {
              const Icon = modeConfig[key].icon;
              return (
                <Button
                  key={key}
                  variant={mode === key ? 'default' : 'outline'}
                  onClick={() => selectMode(key)}
                  className={cn(
                    "capitalize rounded-none border-2 text-xs px-3 py-1.5 h-auto sm:text-sm",
                    mode === key ? "btn-pixel border-primary-foreground" : "border-foreground hover:bg-accent/50",
                    mode !== key && "shadow-[1px_1px_0px_0px_hsl(var(--foreground))] hover:shadow-[0.5px_0.5px_0px_0px_hsl(var(--foreground))]"
                  )}
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {modeConfig[key].label}
                </Button>
              );
            })}
          </div>

          <div className="font-mono text-6xl sm:text-8xl font-bold text-foreground select-none"
               style={{fontFeatureSettings: "'tnum' on, 'lnum' on"}}>
            {formatTime(timeLeft)}
          </div>

          <div className="flex space-x-3 sm:space-x-4">
            <Button
              onClick={toggleTimer}
              className="btn-pixel text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 h-auto"
              aria-label={isActive ? "Pausar temporizador" : "Iniciar temporizador"}
            >
              {isActive ? <Pause className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />}
              {isActive ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className="rounded-none border-2 border-foreground hover:bg-muted text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 h-auto shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))]"
              aria-label="Reiniciar temporizador"
            >
              <RotateCcw className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Reiniciar
            </Button>
          </div>
           {mode === 'pomodoro' && (
             <p className="text-sm text-muted-foreground">
                Pomodoros completados en este ciclo: {pomodorosCompletedThisCycle} / {POMODOROS_UNTIL_LONG_BREAK}
            </p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
