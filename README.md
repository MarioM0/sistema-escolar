# Sistema Escolar

Proyecto de ejemplo para gestión escolar (backend + frontend). Este README cubre cómo levantar el sistema en local y con Docker, variables de entorno y notas sobre endpoints y migraciones.

**Resumen**: backend en `backend/` (Node.js + Sequelize + Postgres). frontend en `frontend/` (Vite + React + TypeScript).

**Requisitos**
- Node.js 18+ y npm
- Docker & Docker Compose (opcional para contenedores)

**Instalación local (sin Docker)**

1. Backend

```bash
cd backend
npm install
```

Configura variables de entorno (ver sección abajo) o copia `.env.example` si existe.

Ejecutar migraciones (requiere `sequelize-cli` instalado localmente o usar npx):

```bash
npx sequelize-cli db:migrate --config config/config.json
```

Iniciar backend:

```bash
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

**Usar Docker (rápido)**

```bash
docker-compose up --build
```

Esto creará contenedores para backend, frontend y la base de datos (si están definidos en `docker-compose.yml`).

**Variables de Entorno importantes (backend)**
- `NODE_ENV` - `development`/`production`
- `PORT` - puerto del servidor (ej. `3000`)
- `DATABASE_URL` o los valores en `backend/config/config.json` (host, user, password, database, port)
- `JWT_SECRET` - secreto para tokens JWT

Si usas Docker Compose, define estas variables en un archivo `.env` o en el `docker-compose.yml`.

**Migraciones**
Las migraciones están en `backend/migrations`. Se añadió una migración para:
- Agregar `deleted_at` a `calificaciones`.
- Agregar constraint `check_nota_range` para que `nota` esté entre 0 y 100.

Ejecuta migraciones con:

```bash
cd backend
npx sequelize-cli db:migrate --config config/config.json
```

**Endpoints relevantes**
- `POST /api/auth/login` - login
- `POST /api/control_escolar` - crear control escolar (admin)
- `GET /api/control_escolar/reporte` - listado de calificaciones (incluye alumno, materia y maestro)
- `DELETE /api/control_escolar/calificaciones/:id` - elimina (soft) una calificación

Colección Postman de ejemplo: `docs/postman_collection.json`.

Si quieres que ejecute las migraciones o pruebe algún endpoint, dime y lo hago.
