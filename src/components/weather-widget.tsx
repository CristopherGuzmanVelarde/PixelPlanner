
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Search, MapPin, Thermometer, Wind, Droplets, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Interfaces para los datos del clima (simulados)
interface WeatherData {
  location: string;
  temperature: number; // Celsius
  condition: string; // Ej: "Soleado", "Nublado", "Lluvioso"
  conditionCode: string; // Ej: "sunny", "cloudy", "rainy" (para iconos)
  humidity: number; // Porcentaje
  windSpeed: number; // km/h
}

// Iconos pixelados para el clima (SVGs en línea)
const WeatherPixelIcon = ({ conditionCode, className }: { conditionCode: string; className?: string }) => {
  const baseClasses = cn("w-16 h-16 sm:w-20 sm:h-20 image-pixelated text-foreground", className);

  switch (conditionCode) {
    case 'sunny':
      return (
        <svg viewBox="0 0 32 32" className={baseClasses} fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="1">
          <title>Soleado</title>
          <circle cx="16" cy="16" r="6" />
          <line x1="16" y1="4" x2="16" y2="8" />
          <line x1="16" y1="24" x2="16" y2="28" />
          <line x1="4" y1="16" x2="8" y2="16" />
          <line x1="24" y1="16" x2="28" y2="16" />
          <line x1="7" y1="7" x2="10" y2="10" />
          <line x1="22" y1="22" x2="25" y2="25" />
          <line x1="7" y1="25" x2="10" y2="22" />
          <line x1="22" y1="10" x2="25" y2="7" />
        </svg>
      );
    case 'cloudy':
      return (
        <svg viewBox="0 0 32 32" className={baseClasses} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1">
          <title>Nublado</title>
          <rect x="8" y="12" width="16" height="8" />
          <rect x="10" y="10" width="12" height="4" />
          <rect x="12" y="20" width="8" height="2" />
          <rect x="6" y="14" width="2" height="4" />
          <rect x="24" y="14" width="2" height="4" />
        </svg>
      );
    case 'partly-cloudy':
      return (
        <svg viewBox="0 0 32 32" className={baseClasses} stroke="hsl(var(--foreground))" strokeWidth="1">
          <title>Parcialmente Nublado</title>
          {/* Sol */}
          <circle cx="10" cy="10" r="5" fill="hsl(var(--accent))" />
          <line x1="10" y1="3" x2="10" y2="5" stroke="hsl(var(--accent))" />
          <line x1="3" y1="10" x2="5" y2="10" stroke="hsl(var(--accent))" />
          <line x1="15" y1="5" x2="13" y2="7" stroke="hsl(var(--accent))" />
           {/* Nube */}
          <rect x="12" y="15" width="15" height="7" fill="hsl(var(--muted))" />
          <rect x="14" y="13" width="11" height="3" fill="hsl(var(--muted))"/>
          <rect x="10" y="17" width="2" height="3" fill="hsl(var(--muted))"/>
          <rect x="27" y="17" width="2" height="3" fill="hsl(var(--muted))"/>
          <rect x="16" y="22" width="7" height="2" fill="hsl(var(--muted))"/>
        </svg>
      );
    case 'rainy':
      return (
        <svg viewBox="0 0 32 32" className={baseClasses} stroke="hsl(var(--foreground))" strokeWidth="1">
          <title>Lluvioso</title>
           {/* Nube */}
          <rect x="7" y="8" width="18" height="9" fill="hsl(var(--muted))" />
          <rect x="9" y="6" width="14" height="3" fill="hsl(var(--muted))"/>
          <rect x="5" y="10" width="2" height="5" fill="hsl(var(--muted))"/>
          <rect x="25" y="10" width="2" height="5" fill="hsl(var(--muted))"/>
          <rect x="11" y="17" width="10" height="2" fill="hsl(var(--muted))"/>
          {/* Gotas */}
          <line x1="10" y1="20" x2="12" y2="24" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <line x1="15" y1="22" x2="17" y2="26" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <line x1="20" y1="20" x2="22" y2="24" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <line x1="12" y1="25" x2="14" y2="29" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <line x1="17" y1="27" x2="19" y2="31" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        </svg>
      );
    default: // Icono por defecto o desconocido
      return (
        <svg viewBox="0 0 32 32" className={baseClasses} fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1">
          <title>Clima Desconocido</title>
          <rect x="8" y="8" width="16" height="16" rx="1" />
          <text x="16" y="20" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">?</text>
        </svg>
      );
  }
};


export function WeatherWidget() {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // Podrías intentar obtener la ubicación del usuario aquí o cargar una ubicación predeterminada
  }, []);

  const mockFetchWeather = useCallback(async (loc: string): Promise<WeatherData> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!loc.trim()) {
          reject(new Error("Por favor ingresa una ubicación."));
          return;
        }
        // Simular diferentes respuestas basadas en la entrada (muy simplificado)
        const lowerLoc = loc.toLowerCase();
        if (lowerLoc.includes("error")) {
          reject(new Error("No se pudo obtener el clima para esta ubicación."));
          return;
        }
        
        const conditions: WeatherData[] = [
          { location: loc, temperature: 25, condition: "Soleado", conditionCode: "sunny", humidity: 60, windSpeed: 10 },
          { location: loc, temperature: 15, condition: "Nublado", conditionCode: "cloudy", humidity: 80, windSpeed: 15 },
          { location: loc, temperature: 20, condition: "Parcialmente Nublado", conditionCode: "partly-cloudy", humidity: 70, windSpeed: 12 },
          { location: loc, temperature: 18, condition: "Lluvioso", conditionCode: "rainy", humidity: 90, windSpeed: 20 },
        ];
        resolve(conditions[Math.floor(Math.random() * conditions.length)]);
      }, 1500);
    });
  }, []);

  const handleFetchWeather = async () => {
    if (!location.trim()) {
      toast({ title: "Entrada Requerida", description: "Por favor, ingresa una ciudad.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    try {
      const data = await mockFetchWeather(location);
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error desconocido.");
      toast({ title: "Error de Clima", description: err.message || "No se pudo obtener el clima.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm rounded-none border-2 border-foreground shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-8 h-8 mr-2 image-pixelated fill-primary stroke-primary-foreground stroke-1" aria-hidden="true">
                <title>Icono de Nube y Sol Pixelado</title>
                <rect x="14" y="6" width="12" height="8" /> 
                <rect x="12" y="8" width="4" height="4" /> 
                <rect x="16" y="4" width="8" height="4" /> 
                <rect x="6" y="14" width="20" height="12" />
                <rect x="4" y="18" width="2" height="4" />
                <rect x="26" y="18" width="2" height="4" />
                <rect x="10" y="26" width="12" height="2" />
              </svg>
              Widget del Clima
            </CardTitle>
            <CardDescription>Cargando widget del clima...</CardDescription>
          </CardHeader>
          <CardContent className="animate-pulse flex flex-col items-center space-y-4">
            <div className="w-full h-8 bg-muted rounded-none border border-foreground"></div>
            <div className="w-1/2 h-10 bg-primary rounded-none border border-primary-foreground"></div>
            <div className="w-20 h-20 bg-muted rounded-none border border-foreground mt-4"></div>
            <div className="w-3/4 h-6 bg-muted rounded-none border border-foreground"></div>
            <div className="w-1/2 h-4 bg-muted rounded-none border border-foreground"></div>
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
            <svg viewBox="0 0 32 32" className="w-8 h-8 mr-2 image-pixelated fill-primary stroke-primary-foreground stroke-1" aria-hidden="true">
               <title>Icono de Nube y Sol Pixelado</title>
               {/* Sol (parte) */}
               <rect x="4" y="4" width="10" height="10" fill="hsl(var(--accent))" />
               <rect x="6" y="3" width="6" height="1" fill="hsl(var(--accent))" />
               <rect x="3" y="6" width="1" height="6" fill="hsl(var(--accent))" />
               {/* Nube */}
               <rect x="10" y="12" width="18" height="10" fill="hsl(var(--muted))" /> {/* Cuerpo principal */}
               <rect x="8" y="14" width="2" height="6" fill="hsl(var(--muted))" /> {/* Izquierda */}
               <rect x="28" y="14" width="2" height="6" fill="hsl(var(--muted))" /> {/* Derecha */}
               <rect x="12" y="10" width="14" height="2" fill="hsl(var(--muted))" /> {/* Arriba */}
               <rect x="12" y="22" width="14" height="2" fill="hsl(var(--muted))" /> {/* Abajo */}
            </svg>
            Widget del Clima
          </CardTitle>
          <CardDescription>Ingresa una ciudad para ver el clima (simulado).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Ciudad Gótica"
              className="rounded-none border-2 border-input bg-input text-foreground placeholder:text-muted-foreground flex-grow"
              aria-label="Ingresar ubicación"
              onKeyDown={(e) => { if (e.key === 'Enter') handleFetchWeather(); }}
            />
            <Button onClick={handleFetchWeather} disabled={isLoading} className="btn-pixel px-4 py-2 text-sm">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Buscar</span>
            </Button>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground">Buscando clima pixelado...</p>
            </div>
          )}

          {error && !isLoading && (
             <div className="flex flex-col items-center justify-center text-center p-6 text-destructive">
              <AlertTriangle className="h-10 w-10 mb-3" />
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {weatherData && !isLoading && !error && (
            <Card className="w-full bg-background/50 rounded-none border-2 border-foreground p-4 mt-4">
              <CardHeader className="p-0 mb-2 text-center">
                <CardTitle className="text-xl text-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5 mr-2" /> {weatherData.location}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col items-center space-y-3">
                <WeatherPixelIcon conditionCode={weatherData.conditionCode} />
                <p className="text-4xl font-bold text-foreground">
                  {weatherData.temperature}°C
                </p>
                <p className="text-lg text-muted-foreground">{weatherData.condition}</p>
                <div className="flex justify-around w-full text-sm text-muted-foreground pt-2 border-t border-border mt-2">
                  <div className="flex items-center">
                    <Droplets className="w-4 h-4 mr-1 text-primary/80" /> Hum: {weatherData.humidity}%
                  </div>
                  <div className="flex items-center">
                    <Wind className="w-4 h-4 mr-1 text-primary/80" /> Viento: {weatherData.windSpeed} km/h
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
           {!weatherData && !isLoading && !error && (
            <div className="text-center p-6 text-muted-foreground">
                <svg viewBox="0 0 32 32" className="w-16 h-16 mx-auto mb-2 image-pixelated opacity-70 fill-current">
                    <title>Ingresa una ubicación</title>
                    <path d="M16 2c-6.08 0-11 4.92-11 11s4.92 11 11 11 11-4.92 11-11S22.08 2 16 2zm0 20c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9z"/>
                    <path d="M15 8h2v6h-2zm0 8h2v2h-2z"/>
                    <path d="M12 18.59l-2.29-2.3-1.42 1.42L12 21.41l5.71-5.7-1.42-1.42z" opacity=".5"/>
                </svg>
                Ingresa una ciudad para ver el pronóstico del tiempo.
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

