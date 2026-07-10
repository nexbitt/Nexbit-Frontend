# RematesPaisa — Frontend

Interfaz de usuario del sistema de comercio electrónico RematesPaisa, construida con React 19 + Vite 8. Consume la API REST del backend para gestionar productos, usuarios, pedidos y más.

## Stack

| Categoría | Tecnología |
|-----------|-----------|
| Framework | React 19.2 + React DOM 19.2 |
| Bundler | Vite 8 |
| Enrutamiento | React Router DOM 7.13 |
| Peticiones HTTP | Axios 1.13 |
| Tiempo real | Socket.IO Client 4.8 |
| UI / Iconos | Bootstrap 5.3, Bootstrap Icons 1.13, Lucide React 0.577 |
| Linter | ESLint 9.39 + React Hooks + React Refresh |

## Requisitos Previos

- **Node.js** v18 o superior
- **Git**
- El **backend corriendo** en `http://localhost:3000`

## Instalación y Ejecución

1. Clona el repositorio:
   ```bash
   git clone https://github.com/equiposeis84/frontend.git
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. (Opcional) Crea un archivo `.env` en la raíz con la URL del backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   > Si no se define, usa `http://localhost:3000` por defecto.

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   > El frontend corre por defecto en `http://localhost:5173`

## Scripts Disponibles

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Inicia servidor de desarrollo con HMR |
| `npm run build` | Compila para producción en `dist/` |
| `npm run preview` | Previsualiza la compilación de producción |
| `npm run lint` | Ejecuta ESLint sobre el código |

## Importante

Asegúrate de tener el backend corriendo antes de iniciar el frontend. Las instrucciones están en el [repositorio del backend](https://github.com/equiposeis84/backend).

## Repositorios Relacionados

- [Backend](https://github.com/equiposeis84/backend)
- [Mobile](https://github.com/equiposeis84/mobile)
