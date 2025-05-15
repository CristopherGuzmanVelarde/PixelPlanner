import Link from 'next/link';

export function Header() {
  return (
    <header className="py-3 px-4 bg-card border-b-2 border-foreground shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex justify-center sm:justify-start items-center">
        <Link href="/" className="flex items-center text-2xl font-bold text-primary tracking-wider hover:opacity-80 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="butt"
            strokeLinejoin="miter" // Use miter for sharper corners
            className="h-7 w-7 mr-2 text-primary image-pixelated" // Added image-pixelated
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          PixelPlanner
        </Link>
        {/* Futuro: Añadir selector de tema u otros elementos de navegación aquí */}
      </div>
    </header>
  );
}
