# PROJECT.md — Nexbit-Frontend
> Generado por el agente de planificación técnica.
> Creado: 2026-07-02 | Motivo: Documentación inicial del proyecto

## Origen
- **Tipo:** Heredado
- **Repositorio original:** `https://github.com/equiposeis84/frontend.git`
- **Archivos usados para inferencia:** `package.json`, `vite.config.js`, `index.html`, `src/App.jsx`, `src/index.css`, `README.MD`, estructura de `src/`

## Stack
- **Lenguaje:** JavaScript (JSX)
- **Framework:** React 19.2.4
- **Bundler:** Vite 8.0
- **Enrutamiento:** React Router DOM 7.13.1
- **Peticiones HTTP:** Axios 1.13.6
- **UI Framework:** Bootstrap 5.3.8 + Bootstrap Icons 1.13.1
- **Iconografía:** Lucide React 0.577.0
- **Tiempo real:** Socket.IO Client 4.8.3
- **Linter:** ESLint 9.39 + plugins React Hooks + React Refresh
- **Tipado:** PropTypes (@types/react 19.2.14 para IDE)
- **Gestor de paquetes:** npm

## Arquitectura
- **Tipo:** SPA (Single Page Application) con 3 layouts diferenciados
- **Patrón:** Basado en componentes funcionales + Context API para estado global
- **Estructura de carpetas en `src/`:**
  - `pages/` → 19 pantallas (una por ruta)
  - `components/features/` → Componentes de funcionalidad (TopBar, Sidebar, Chat, etc.)
  - `components/ui/` → Componentes UI reutilizables (modales, toasts, formularios)
  - `context/` → 4 contextos globales (Auth, Cart, Language, Socket)
  - `services/` → Servicios externos (authService)
  - `hooks/` → Custom hooks (useModalScroll)
  - `constants/` → Constantes (orderStatuses)
  - `assets/` → Recursos estáticos (hero.png)
  - `styles/` → Estilos adicionales

## Mapa de responsabilidades
| Ruta | Layout | Descripción |
|------|--------|-------------|
| `/usuario/inicio` | StoreLayout | Landing pública con hero |
| `/usuario/productos` | StoreLayout | Catálogo de productos |
| `/usuario/carrito` | StoreLayout | Carrito de compras |
| `/usuario/pedidos` | StoreLayout | Mis pedidos (invitado) |
| `/login`, `/register`, `/forgot-password` | Sin layout | Autenticación |
| `/cliente/*` | StoreLayout (auth) | Zona de cliente autenticado |
| `/admin/*` | AdminLayout | Panel de administración |
| `/repartidor/*` | RepartidorLayout | Panel de repartidor |

## Layouts del sistema
1. **StoreLayout** — TopBar fijo (64px o 106px con 2 niveles) + contenido scrollable. Para clientes e invitados.
2. **AdminLayout** — Sidebar negro fijo (220px colapsable a 60px) + contenido. Para administradores.
3. **RepartidorLayout** — Sidebar negro + ActiveBanner + contenido. Para repartidores.
4. **Auth** — Login/Register/ForgotPassword sin layout (centrado vertical).

## Temas y estilos
- **Tema:** "Antigravity" — blanco, negro y grises (sin colores primarios llamativos)
- **Tipografía:** Inter (Google Fonts) — pesos 300 a 900
- **CSS:** Variables CSS en `:root` de `index.css` (~7154 líneas de CSS completo)
- **Animaciones:** 11 animaciones definidas (fadeIn, slideUp, heroFadeIn, cartBump, etc.)
- **Sistema de diseño:** Documentado en el README raíz del monorepo

## Convenciones detectadas
- Archivos JSX con PascalCase (ej. `AdminSidebar.jsx`, `Login.jsx`)
- Context API para estado global, no Redux
- CSS vanilla con variables CSS (sin Tailwind, Sass o CSS Modules)
- Vite proxy para `/api` → `http://127.0.0.1:3000`
- ESLint con config plana (`eslint.config.js`)
- Sin tests automatizados configurados

## Restricciones
- Dependencia total del backend (Express :3000) para datos
- CORS configurado en backend para localhost:5173
- Sin modo offline ni service workers
- Sin PWA configurada
- Diseño responsive con breakpoints: 680px, 768px, 900px

## Estado actual
- **Completo:** Autenticación, CRUD de usuarios/roles/categorías/productos/proveedores, carrito, pedidos, perfil, panel admin, panel repartidor, chat, tickets
- **Funcional:** Store layout con landing page, tienda, carrito; Admin layout con sidebar; Repartidor layout con seguimiento de entregas

## Decisiones clave
- React 19 por ser la versión estable más reciente con mejor rendimiento
- Vite 8 sobre Create React App por velocidad de desarrollo y HMR
- CSS vanilla sobre Tailwind para mantener control total sobre el diseño "Antigravity"
- Context API sobre Redux para 4 contextos simples sin necesidad de middlewares
- React Router DOM v7 por su compatibilidad con React 19 y routing basado en layouts
