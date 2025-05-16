
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Palette as PaletteIcon, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PALETTE_SIZE = 5;

// Helper function to generate a random hex color
const getRandomHexColor = () => {
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += Math.floor(Math.random() * 16).toString(16);
  }
  return color;
};

// Helper function to determine if a color is light or dark
const isColorLight = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export function PixelPaletteGenerator() {
  const [palette, setPalette] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    generateNewPalette();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Generate a palette on initial mount (client-side only)

  const generateNewPalette = () => {
    const newPalette = Array.from({ length: PALETTE_SIZE }, getRandomHexColor);
    setPalette(newPalette);
  };

  const handleCopyColor = async (color: string) => {
    if (!navigator.clipboard) {
      toast({
        title: "Error",
        description: "El portapapeles no está disponible en este navegador.",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(color);
      toast({
        title: "Copiado",
        description: `${color} copiado al portapapeles.`,
      });
    } catch (err) {
      toast({
        title: "Error al Copiar",
        description: "No se pudo copiar el color.",
        variant: "destructive",
      });
      console.error('Error al copiar color:', err);
    }
  };

  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration mismatches
    // for components relying on Math.random or navigator.
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
         <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm rounded-none border-2 border-foreground shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-7 w-7 sm:h-8 sm:w-8 text-primary image-pixelated" aria-hidden="true">
                        <title>Pixel Palette Icon</title>
                        <rect x="2" y="7" width="4" height="10"/>
                        <rect x="7" y="7" width="4" height="10"/>
                        <rect x="12" y="7" width="4" height="10"/>
                        <rect x="17" y="7" width="4" height="10"/>
                        <path d="M2 7h4v10H2zM7 7h4v10H7zM12 7h4v10h12zM17 7h4v10h-4z"/>
                        <rect x="2" y="4" width="20" height="2"/>
                    </svg>
                    Generador de Paletas
                </CardTitle>
                <CardDescription>Cargando generador de paletas...</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 sm:space-y-8">
                <div className="animate-pulse flex space-x-2">
                    {Array.from({ length: PALETTE_SIZE }).map((_, index) => (
                        <div key={index} className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-none border border-foreground"></div>
                    ))}
                </div>
                <Button className="btn-pixel px-6 py-3 text-base" disabled>
                    Generar Nueva Paleta
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm rounded-none border-2 border-foreground shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-7 w-7 sm:h-8 sm:w-8 text-primary image-pixelated" aria-hidden="true">
                <title>Pixel Palette Icon</title>
                {/* Base del pincel/herramienta */}
                <rect x="10" y="16" width="4" height="6" /> 
                <rect x="8" y="14" width="8" height="2" />
                {/* Cerdas (simuladas con rectángulos) */}
                <rect x="6" y="10" width="2" height="4" />
                <rect x="9" y="8" width="2" height="6" />
                <rect x="12" y="8" width="2" height="6" />
                <rect x="15" y="10" width="2" height="4" />
                {/* Paleta */}
                <path d="M17.25 2.75a2.75 2.75 0 00-2.75 2.75c0 1.44.69 2.73 1.75 3.52V11.5A1.5 1.5 0 0014.75 13h-5.5A1.5 1.5 0 007.75 11.5V9.02c1.06-.79 1.75-2.08 1.75-3.52a2.75 2.75 0 00-2.75-2.75A2.75 2.75 0 004 5.5c0 .91.29 1.79.85 2.5H4v2h.5A1.5 1.5 0 006 11.5V12h8v-.5a1.5 1.5 0 001.5-1.5V9.5h.5v-2h-.85c.56-.71.85-1.59.85-2.5a2.75 2.75 0 00-2.75-2.75zM6.5 5.5a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25v.5a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-.5zm4.5 0a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25v.5a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-.5zm4.5 0a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25v.5a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-.5z"/>
            </svg>
            Generador de Paletas
          </CardTitle>
          <CardDescription>Crea paletas de colores de estilo pixel art al azar.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 sm:space-y-8">
          <div className="flex flex-wrap justify-center gap-2">
            {palette.map((color, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                  style={{ backgroundColor: color }}
                />
                <button
                  onClick={() => handleCopyColor(color)}
                  className={cn(
                    "mt-1.5 text-xs px-2 py-1 rounded-none border border-foreground bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-1 shadow-[1px_1px_0px_0px_hsl(var(--foreground))]",
                    "transition-opacity opacity-75 group-hover:opacity-100"
                    )}
                  title={`Copiar ${color}`}
                >
                  {color}
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <Button
            onClick={generateNewPalette}
            className="btn-pixel px-6 py-3 text-base"
            aria-label="Generar nueva paleta de colores"
          >
            <PaletteIcon className="mr-2 h-5 w-5" />
            Generar Nueva Paleta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

