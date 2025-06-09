
# PixelPlanner: ¡Planifica tu día, al estilo pixel!

PixelPlanner es una aplicación web diseñada para ayudarte a organizar tus tareas diarias, gestionar tu tiempo con la técnica Pomodoro y obtener consejos de productividad, todo ello envuelto en una encantadora estética pixel art.

## ✨ Características Principales

*   **Gestión de Tareas Pixelada**:
    *   Añade, edita y elimina tareas.
    *   Marca tareas como completadas.
    *   Genera iconos pixel art únicos para cada tarea utilizando IA (Google Gemini).
    *   Asigna descripciones, categorías, fechas de entrega y tiempo dedicado a las tareas.
    *   Filtra tareas (todas, activas, completadas) y búscalalas por título, descripción o categoría.
    *   Visualiza el progreso general de tus tareas.
    *   Opción para marcar todas las tareas como completas o eliminar todas las tareas.
    *   Reporte de tiempo dedicado a las tareas con visualización gráfica.
*   **Temporizador Pomodoro Integrado**:
    *   Temporizador configurable para sesiones de trabajo (Pomodoro), descansos cortos y descansos largos.
    *   Notificaciones (toast) al finalizar cada ciclo.
    *   Contador de pomodoros completados para gestionar ciclos de descanso largo.
    *   Botones para iniciar, pausar y reiniciar el temporizador.
    *   Interfaz con temática pixel art.
*   **Potenciador de Productividad (IA)**:
    *   Obtén consejos de productividad personalizados y motivadores generados por IA (Google Gemini).
    *   Ingresa tu tarea actual, estado de ánimo o desafío para recibir un consejo útil.
*   **Tema Dinámico**:
    *   Cambia entre tema claro y oscuro.
    *   La preferencia de tema se guarda en el `localStorage`.
*   **Persistencia de Datos**:
    *   Las tareas se guardan en el `localStorage` del navegador, permitiendo que persistan entre sesiones.
*   **Diseño Pixel Art Cohesivo**:
    *   Interfaz de usuario con componentes estilizados para evocar la estética de los juegos retro (bordes nítidos, sombras pixeladas).
    *   Uso de SVGs personalizados e iconos generados por IA para mantener la temática.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
*   **UI**: [React](https://reactjs.org/)
*   **Componentes UI**: [ShadCN UI](https://ui.shadcn.com/)
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
*   **Inteligencia Artificial (GenAI)**: [Genkit (Google AI Studio)](https://ai.google.dev/genkit) con modelos Gemini.
*   **Iconos**: [Lucide React](https://lucide.dev/) y SVGs personalizados.
*   **Gestión de Estado (Cliente)**: React Hooks (`useState`, `useEffect`, `useCallback`).
*   **Notificaciones**: Componente Toast personalizado (`useToast`).

## 🚀 Empezando

### Prerrequisitos

*   Node.js (v18 o superior recomendado)
*   npm o yarn

### Instalación

1.  **Clona el repositorio (si aplica)**:
    ```bash
    git clone <url-del-repositorio>
    cd <nombre-del-directorio>
    ```

2.  **Instala las dependencias**:
    ```bash
    npm install
    # o
    # yarn install
    ```

3.  **Configura las variables de entorno**:
    Crea un archivo `.env.local` en la raíz del proyecto y añade tu clave API de Google Generative AI:
    ```env
    GOOGLE_GENAI_API_KEY=TU_API_KEY_AQUI
    ```
    Puedes obtener una API key desde [Google AI Studio](https://aistudio.google.com/app/apikey).

## ධ Ejecutando la Aplicación

1.  **Servidor de Desarrollo (Next.js)**:
    Para iniciar la aplicación en modo de desarrollo (con hot-reloading):
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002`.

2.  **Servidor de Desarrollo (Genkit)**:
    Para iniciar el servidor de desarrollo de Genkit (si deseas probar los flujos de IA de forma aislada o ver la UI de Genkit):
    ```bash
    npm run genkit:dev
    ```
    O con recarga automática:
    ```bash
    npm run genkit:watch
    ```
    Esto generalmente inicia la UI de Genkit en `http://localhost:4000`.

3.  **Build de Producción**:
    Para compilar la aplicación para producción:
    ```bash
    npm run build
    ```

4.  **Iniciar Servidor de Producción**:
    Para ejecutar la aplicación compilada:
    ```bash
    npm run start
    ```

## 📁 Estructura del Proyecto (Resumen)

```
pixelplanner/
├── .env.local              # Variables de entorno (¡NO SUBIR A GIT SI CONTIENE CLAVES!)
├── components.json         # Configuración de ShadCN UI
├── next.config.ts          # Configuración de Next.js
├── package.json            # Dependencias y scripts del proyecto
├── README.md               # Este archivo
├── tailwind.config.ts      # Configuración de Tailwind CSS
├── tsconfig.json           # Configuración de TypeScript
├── public/                 # Archivos estáticos (ej: notification.mp3)
└── src/
    ├── ai/                 # Lógica relacionada con Inteligencia Artificial (Genkit)
    │   ├── ai-instance.ts  # Instancia global de Genkit
    │   ├── dev.ts          # Punto de entrada para el desarrollo de flujos Genkit
    │   └── flows/          # Flujos de Genkit (ej: generación de iconos, consejos)
    ├── app/                # Rutas y layouts de la aplicación (App Router de Next.js)
    │   ├── globals.css     # Estilos globales y variables de tema CSS (ShadCN/Tailwind)
    │   ├── layout.tsx      # Layout raíz de la aplicación
    │   └── page.tsx        # Componente principal de la página de inicio
    ├── components/         # Componentes React reutilizables
    │   ├── layout/         # Componentes de layout (ej: Header)
    │   ├── ui/             # Componentes de ShadCN UI (botón, tarjeta, diálogo, etc.)
    │   ├── add-task-form.tsx
    │   ├── pomodoro-timer.tsx
    │   ├── productivity-booster.tsx
    │   ├── task-item.tsx
    │   ├── task-list.tsx
    │   └── task-report-modal.tsx
    ├── hooks/              # Hooks personalizados de React (ej: useToast, useMobile)
    ├── lib/                # Utilidades y funciones de ayuda (ej: cn para classnames)
    └── types/              # Definiciones de tipos TypeScript (ej: Task)
```

## 🎨 Estilo y Tema

*   **Tailwind CSS**: Utilizado para la mayoría del estilizado utility-first.
*   **ShadCN UI**: Proporciona una base de componentes accesibles y personalizables.
*   **Tema Personalizado**: Definido en `src/app/globals.css` usando variables CSS HSL. Esto permite cambiar fácilmente la paleta de colores para los temas claro y oscuro. El tema está diseñado para tener una estética pixel art con esquinas `rounded-none` por defecto.
*   **Clase `.image-pixelated`**: Se utiliza en imágenes y SVGs para forzar la renderización pixelada (evitando el anti-aliasing) cuando sea posible.

## 🧠 Funcionalidades de IA (Genkit)

La aplicación utiliza Genkit para interactuar con los modelos de IA de Google Gemini:

*   **Generación de Iconos para Tareas**:
    *   Flujo: `src/ai/flows/generate-pixel-art-flow.ts`
    *   Cuando un usuario crea o edita una tarea, puede generar un icono pixel art basado en el título de la tarea. El prompt de IA está diseñado para producir iconos de 32x32 con fondo transparente.
*   **Generación de Consejos de Productividad**:
    *   Flujo: `src/ai/flows/generate-productivity-tip-flow.ts`
    *   En la sección "Productividad", el usuario ingresa su tarea o estado de ánimo, y la IA genera un consejo breve, motivador y con un toque de la temática pixel/retro.

## 💾 Persistencia de Datos

*   **Tareas**: El estado de las tareas (lista, completadas, etc.) se guarda en el `localStorage` del navegador. Esto significa que las tareas permanecerán incluso si el usuario cierra la pestaña o el navegador.
*   **Tema (Claro/Oscuro)**: La preferencia de tema también se almacena en `localStorage` para que se aplique en futuras visitas.

## 📄 Licencia

Este proyecto es para fines de demostración.
```

