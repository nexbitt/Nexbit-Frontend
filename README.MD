# RematesPaisa — Frontend

Interfaz de usuario del sistema de comercio electrónico RematesPaisa, construida con React + Vite. Consume la API REST del backend para gestionar productos, usuarios, pedidos y más.

## Requisitos Previos

- **Node.js** (v18 o superior)
- **Git**
- El **backend corriendo** en `http://localhost:3000`

---

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

3. Configura las variables de entorno. Duplica `.env.example` y renómbralo `.env`, luego actualiza:
   - `VITE_API_URL` — URL del backend (por defecto `http://localhost:3000`)

4. Inicia el servidor de desarrollo:
```bash
   npm run dev
```

> El frontend corre por defecto en `http://localhost:5173`

---

## Importante

Asegúrate de tener el backend corriendo antes de iniciar el frontend. Puedes seguir las instrucciones de instalación en el [repositorio del backend](https://github.com/equiposeis84/backend).

---

## Repositorios relacionados

- [Backend](https://github.com/equiposeis84/backend)
- [Mobile](https://github.com/equiposeis84/mobile)

