# 🚀 INICIO RÁPIDO

## En 3 pasos:

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/MarioM0/sistema-escolar.git
cd sistema-escolar
```

### 2️⃣ Levantar con Docker (Recomendado)
```bash
docker-compose up --build
```

### 3️⃣ Acceder a la aplicación
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Postman:** Importar `docs/postman_collection.json`

---

## 👤 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| 👨‍💼 Admin | `admin@colegio.com` | `admin123` |
| 👨‍🏫 Maestro | `juan@colegio.com` | `prof123` |
| 👩‍🏫 Maestra | `ana@colegio.com` | `prof456` |

---

## 📱 Funcionalidades

### 🔐 Administrador (Control Escolar)
- Ver dashboard con estadísticas globales
- Ver reporte completo de calificaciones
- Eliminar calificaciones erróneas
- Visualizar promedio general de estudiantes

### 👨‍🏫 Maestro
- Ver alumnos asignados a mis grupos
- Registrar calificaciones
- Ver mis calificaciones registradas
- Editar calificaciones (historial)

### 📊 Dashboard
- Contador de estudiantes
- Contador de maestros
- Solicitudes pendientes
- **Promedio general en tiempo real** ✨

---

## 🛠️ Desarrollo Local (sin Docker)

### Backend
```bash
cd backend
npm install
npm run dev
# Puerto 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Puerto 5173
```

---

## 📚 Documentación Completa

- 📘 **README.md** - Guía completa
- ✅ **CUMPLIMIENTO_REQUISITOS.md** - Matriz de requisitos
- 📋 **CAMBIOS_IMPLEMENTADOS.md** - Mejoras realizadas
- ✔️ **CHECKLIST_FINAL.md** - Todas las características

---

## 🎯 Casos de Uso

### Caso 1: Login y Ver Dashboard
1. Abrir http://localhost:5173
2. Loguear con `admin@colegio.com` / `admin123`
3. Ver Dashboard con estadísticas

### Caso 2: Maestro Registra Calificaciones
1. Loguear con `juan@colegio.com` / `prof123`
2. Ir a "Nuevo Usuario" → Tab "Solicitudes de Registro"
3. Ver alumnos del grupo
4. Registrar calificaciones

### Caso 3: Admin Revisa Reportes
1. Loguear con `admin@colegio.com` / `admin123`
2. Ir a "Ver Reportes"
3. Ver tabla de calificaciones
4. Eliminar calificaciones si es necesario

---

## 🧪 Testing con Postman

1. Abrir Postman
2. **Import** → Seleccionar `docs/postman_collection.json`
3. Variables de entorno:
   - `base_url`: `http://localhost:3000/api`
   - `token`: Se obtiene del login

### Endpoint de ejemplo:
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@colegio.com",
  "password": "admin123"
}
```

Respuesta:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "nombre": "Admin",
    "email": "admin@colegio.com",
    "rol": "CONTROL_ESCOLAR"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🔍 Estructura Técnica

### Arquitectura MVC
```
Backend:
├── Controllers (lógica de negocio)
├── Routes (endpoints)
├── Models (Sequelize)
├── Middleware (autenticación)
└── Validators (validación)
```

### Seguridad
- ✅ JWT para autenticación
- ✅ bcrypt para contraseñas
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Soft delete en datos sensibles

---

## 📞 Solución de Problemas

### Puerto en uso
```bash
# Cambiar puerto en frontend
npm run dev -- --port 5174
```

### Base de datos no conecta
```bash
# Reiniciar PostgreSQL en Docker
docker-compose down
docker-compose up --build
```

### Token expirado
- La aplicación auto-renueva tokens
- Si no funciona, vuelve a loguear

---

## ✨ Características Destacadas

- ✅ Dashboard con promedio general en tiempo real
- ✅ Arquitectura MVC profesional
- ✅ JWT con refresh tokens
- ✅ Validación automática de datos
- ✅ Soft delete para calificaciones
- ✅ Histórico de calificaciones
- ✅ Reporte de estadísticas
- ✅ Interfaz responsive con Tailwind

---

**¡Todo listo para usar! 🎉**

Para más detalles, ver **README.md**
