
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
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

      try {
        const audio = new Audio('/notification.mp3'); 
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
    if (newMode === 'pomodoro') setPomodorosCompletedThisCycle(0); 
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const PixelBrainIcon = () => (
    <svg viewBox="0 0 32 32" fill="currentColor" className="mr-1.5 h-4 w-4 image-pixelated stroke-current stroke-1" aria-hidden="true">
      <title>Icono de Cerebro Pixelado para Pomodoro</title>
      <rect x="10" y="6" width="12" height="4" /><rect x="12" y="4" width="8" height="2" /><rect x="8" y="8" width="2" height="4" /><rect x="22" y="8" width="2" height="4" /><rect x="8" y="10" width="6" height="10" /><rect x="6" y="12" width="2" height="6" /><rect x="8" y="20" width="4" height="2" /><rect x="18" y="10" width="6" height="10" /><rect x="24" y="12" width="2" height="6" /><rect x="20" y="20" width="4" height="2" /><rect x="14" y="18" width="4" height="6" />
    </svg>
  );

  const PixelCoffeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mr-1.5 h-4 w-4 image-pixelated">
      <title>Pixel Coffee Icon</title>
      <path d="M6,2 L18,2 L18,4 L6,4 L6,2 Z M4,5 L20,5 L20,7 L4,7 L4,5 Z M4,8 L16,8 L16,18 L4,18 L4,8 Z M18,9 L22,9 L22,15 L18,15 L18,9 Z M6,19 L18,19 L18,21 L6,21 L6,19 Z"/>
    </svg>
  );

  const modeConfig = {
    pomodoro: { label: 'Pomodoro', icon: PixelBrainIcon, duration: POMODORO_DURATION },
    shortBreak: { label: 'Descanso Corto', icon: PixelCoffeeIcon, duration: SHORT_BREAK_DURATION },
    longBreak: { label: 'Descanso Largo', icon: PixelCoffeeIcon, duration: LONG_BREAK_DURATION },
  };


  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm rounded-none border-2 border-foreground shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 h-7 w-7 sm:h-8 sm:w-8 text-primary image-pixelated"
              aria-hidden="true"
            >
              <title>Pixel Clock Icon</title>
              <rect x="3" y="1" width="18" height="2" />
              <rect x="3" y="21" width="18" height="2" />
              <rect x="1" y="3" width="2" height="18" />
              <rect x="21" y="3" width="2" height="18" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="21" y="2" width="1" height="1" />
              <rect x="2" y="21" width="1" height="1" />
              <rect x="21" y="21" width="1" height="1" />
              <rect x="11" y="4" width="2" height="2" /> 
              <rect x="18" y="11" width="2" height="2" /> 
              <rect x="11" y="18" width="2" height="2" /> 
              <rect x="4" y="11" width="2" height="2" /> 
              <rect x="11" y="7" width="2" height="6" /> 
              <rect x="13" y="11" width="4" height="2" /> 
              <rect x="11" y="11" width="2" height="2" />
            </svg>
            Temporizador Pomodoro
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 sm:space-y-8">
          <div className="flex flex-wrap justify-center gap-2">
            {(Object.keys(modeConfig) as PomodoroMode[]).map((key) => {
              const IconComponent = modeConfig[key].icon;
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
                  <IconComponent />
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
              className="btn-pixel px-5 py-2.5 text-base" 
              aria-label={isActive ? "Pausar temporizador" : "Iniciar temporizador"}
            >
              {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />} 
              {isActive ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className="rounded-none border-2 border-foreground hover:bg-muted px-5 py-2.5 text-base shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))]" 
              aria-label="Reiniciar temporizador"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
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

    