
"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Usamos Textarea para más espacio
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Lightbulb, Wand2 } from 'lucide-react'; // Lightbulb como ícono para "idea"
import { useToast } from '@/hooks/use-toast';
import { generateProductivityTip } from '@/ai/flows/generate-productivity-tip-flow';
import { cn } from '@/lib/utils';

export function ProductivityBooster() {
  const [userInput, setUserInput] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetTip = useCallback(async () => {
    if (!userInput.trim()) {
      toast({
        title: "Entrada Requerida",
        description: "Por favor, describe tu tarea o cómo te sientes.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setTip(null);
    try {
      const result = await generateProductivityTip({ userInput });
      setTip(result.tip);
    } catch (error: any) {
      console.error("Error generando consejo de productividad:", error);
      toast({
        title: "Error de IA",
        description: error.message || "No se pudo generar un consejo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userInput, toast]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm rounded-none border-2 border-foreground shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-8 h-8 mr-2 image-pixelated fill-primary stroke-primary-foreground stroke-1" aria-hidden="true">
              <title>Icono de Cerebro Pixelado</title>
              {/* Parte superior del cerebro */}
              <rect x="10" y="6" width="12" height="4" />
              <rect x="12" y="4" width="8" height="2" />
              <rect x="8" y="8" width="2" height="4" />
              <rect x="22" y="8" width="2" height="4" />
              {/* Mitad izquierda */}
              <rect x="8" y="10" width="6" height="10" />
              <rect x="6" y="12" width="2" height="6" />
              <rect x="8" y="20" width="4" height="2" />
              {/* Mitad derecha */}
              <rect x="18" y="10" width="6" height="10" />
              <rect x="24" y="12" width="2" height="6" />
              <rect x="20" y="20" width="4" height="2" />
              {/* "Tallo" */}
              <rect x="14" y="18" width="4" height="6" />
            </svg>
            Potenciador de Productividad
          </CardTitle>
          <CardDescription>¿Necesitas un empujón? Describe tu tarea o ánimo y obtén un consejo de la IA.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ej: Escribir un informe, me siento sin motivación..."
            className="rounded-none border-2 border-input bg-input text-foreground placeholder:text-muted-foreground w-full min-h-[80px]"
            aria-label="Describe tu tarea o estado de ánimo"
          />
          <Button onClick={handleGetTip} disabled={isLoading} className="btn-pixel px-6 py-3 text-base w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
            {isLoading ? 'Pensando...' : 'Obtener Consejo Pixelado'}
          </Button>

          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-6 mt-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground">Generando un consejo productivo...</p>
            </div>
          )}

          {tip && !isLoading && (
            <Card className="w-full bg-background/50 rounded-none border-2 border-foreground p-4 mt-4">
              <CardHeader className="p-0 mb-2 text-center">
                <CardTitle className="text-lg text-primary flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 mr-2" /> ¡Aquí tienes un consejo!
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-center">
                <p className="text-base text-foreground whitespace-pre-wrap">{tip}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
