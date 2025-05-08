import Link from 'next/link';

export function Header() {
  return (
    <header className="py-3 px-4 bg-card border-b-2 border-foreground shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex justify-center sm:justify-start items-center">
        <Link href="/" className="text-2xl font-bold text-primary tracking-wider hover:opacity-80 transition-opacity">
          Planificador Pixelado
        </Link>
        {/* Futuro: Añadir selector de tema u otros elementos de navegación aquí */}
      </div>
    </header>
  );
}
