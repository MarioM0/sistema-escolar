# 📚 Sistema de Gestión y Reporte de Calificaciones Escolares

Sistema web distribuido para gestión de calificaciones escolares con roles de Maestro y Control Escolar (Admin).

---

## 🚀 Requisitos previos

- **Node.js** (v18+)
- **npm** o **pnpm**
- **PostgreSQL** (v13+)
- **Docker & Docker Compose** (opcional, para contenerización)
- **Git**

---

## 📦 Estructura del proyecto

```
sistema-escolar/
├── backend/              # API Node.js + Express + Sequelize
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── routes/       # Definición de endpoints
│   │   ├── models/       # Modelos Sequelize
│   │   ├── middleware/   # Autenticación y autorización
│   │   └── validators/   # Validación de datos
│   ├── migrations/       # Migraciones de BD
│   ├── seeders/         # Datos iniciales
│   ├── config/
│   ├── package.json
│   └── Dockerfile
├── frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml   # Orquestación de servicios
├── docs/
│   └── postman_collection.json  # Colección de API
└── README.md
```

---

## ⚙️ Instalación local (sin Docker)

### 1. Backend

```bash
cd backend
npm install
```

**Configurar variables de entorno:**

Crea un archivo `.env` en la carpeta `backend/`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=sge_dev
DB_PORT=5432
JWT_SECRET=tu-jwt-secret-super-seguro-2024
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

**Iniciar servidor (sincroniza tablas y seeders automáticamente):**

```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 🐳 Instalación con Docker (recomendado)

### Levantar todo con un comando:

```bash
docker-compose up --build
```

Esto levantará:
- **PostgreSQL** (puerto 5433)
- **Backend** (puerto 3000)
- **Frontend** (puerto 5173)

**Los seeders se ejecutan automáticamente** en el primer inicio, poblando la base de datos con:
- 1 usuario Admin (CONTROL_ESCOLAR)
- 2 usuarios Maestro
- 6 Materias
- 6 Alumnos

**Esperar a que se complete la inicialización:**

```bash
docker-compose logs -f backend_sge
```

Cuando veas `Servidor corriendo en puerto 3000`, todo está listo.

**Para detener los servicios:**

```bash
docker-compose down
```

Para una limpieza completa (incluyendo volúmenes):

```bash
docker-compose down --volumes
```

---

## 🔐 Credenciales por defecto

Las credenciales se crean automáticamente en el primer inicio:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | `admin@colegio.com` | `admin123` |
| Maestro 1 | `juan@colegio.com` | `prof123` |
| Maestro 2 | `ana@colegio.com` | `prof456` |

---

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Información del usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Maestro (requiere token JWT)

- `GET /api/maestro/alumnos` - Obtener alumnos asignados
- `POST /api/maestro/calificaciones` - Registrar calificación
- `GET /api/maestro/calificaciones` - Ver mis calificaciones

### Calificaciones (requiere token JWT)

- `GET /api/calificaciones/promedio-general` - Obtener promedio general
- `GET /api/calificaciones/alumno/:alumnoId` - Calificaciones de un alumno
- `POST /api/calificaciones` - Crear calificación
- `DELETE /api/calificaciones/:id` - Eliminar calificación

### Control Escolar / Admin (requiere token JWT)

- `GET /api/control_escolar/reporte` - Reporte de calificaciones
- `DELETE /api/control_escolar/calificaciones/:id` - Eliminar calificación

---

## 🗄️ Modelo de datos

### Usuarios
```sql
- id (PK)
- nombre
- email (UNIQUE)
- password_hash
- rol (MAESTRO | CONTROL_ESCOLAR)
- matricula (opcional)
- created_at, updated_at
```

### Alumnos
```sql
- id (PK)
- nombre
- matricula (UNIQUE)
- grupo
- fecha_nacimiento
- created_at, updated_at
```

### Materias
```sql
- id (PK)
- nombre
- codigo (UNIQUE)
- descripcion
- created_at, updated_at
```

### Calificaciones
```sql
- id (PK)
- alumno_id (FK)
- materia_id (FK)
- maestro_id (FK)
- nota (0-100)
- fecha_registro
- observaciones
- deleted_at (soft delete)
- created_at, updated_at
```

---

## 🏗️ Arquitectura

### Backend (MVC + Capas)

**Modelos** (`src/models/`)
- Define estructura de datos y relaciones
- Usa Sequelize ORM

**Controladores** (`src/controllers/`)
- Lógica de negocio
- Procesa requests y retorna respuestas

**Rutas** (`src/routes/`)
- Define endpoints
- Aplica middlewares y validadores

**Middlewares** (`src/middleware/`)
- `authenticateToken`: Valida JWT en rutas protegidas
- Autorización por roles

**Validadores** (`src/validators/`)
- Valida entrada de datos con `express-validator`

### Frontend (React + TypeScript)

**Componentes**
- `Dashboard.tsx` - Panel principal
- `LoginForm.tsx` - Formulario de login
- `ManageUsers.tsx` - Gestión de usuarios
- etc.

**Servicios**
- `axios.ts` - Cliente HTTP con interceptores para JWT

**Contexto**
- `auth-context.tsx` - Manejo global de autenticación

---

## 🔑 Seguridad

✅ **Implementado:**
- ✅ JWT para autenticación
- ✅ Contraseñas hasheadas con bcrypt
- ✅ CORS configurado
- ✅ Middleware de autenticación en rutas protegidas
- ✅ Validación de entrada con express-validator
- ✅ Soft delete para datos sensibles

---

## 🧪 Testing

Usa la colección Postman en `docs/postman_collection.json`:

1. Abre Postman
2. Importa el archivo JSON
3. Usa las variables de entorno: `{{ base_url }}` y `{{ token }}`

O ejecuta tests en el backend:

```bash
cd backend
npm test
```

---

## 🐛 Troubleshooting

### Error: "column 'created_at' does not exist"

Ejecuta las migraciones:

```bash
cd backend
npx sequelize-cli db:migrate
```

### Error: "ECONNREFUSED" en base de datos

Verifica que PostgreSQL esté corriendo:

```bash
docker ps  # Ver contenedores activos
```

### Puerto 5173 ya está en uso

Especifica otro puerto:

```bash
npm run dev -- --port 5174
```

---

## 📝 Notas de desarrollo

- Las rutas protegidas requieren header: `Authorization: Bearer <token>`
- El JWT expira en 24 horas
- Usa `POST /api/auth/refresh` para renovar el token
- Las migraciones se ejecutan automáticamente en Docker

---

## 🚀 Deployment

### Backend (Heroku/Railway)

```bash
git push heroku main
```

### Frontend (Vercel/Netlify)

```bash
npm run build
# Subir la carpeta 'dist/'
```

---

## 📞 Contacto & Soporte

Para reportar errores o sugerencias, abre un issue en GitHub.

---

**¡Hecho con ❤️ para sistema escolar!**
