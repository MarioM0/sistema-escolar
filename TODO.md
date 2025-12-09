# TODO: Implementar conteo dinámico de solicitudes pendientes en Dashboard

## Tareas Pendientes

- [x] Agregar endpoint GET /count en backend/src/routes/solicitudes-registro-maestro.js para contar solicitudes con estado 'pendiente'
- [x] Actualizar frontend/src/components/Dashboard.tsx para:
  - Agregar estado para pendingRequestsCount
  - Crear función fetchPendingRequestsCount
  - Llamar la función en useEffect cuando currentView === "home"
  - Mostrar el conteo dinámico en la tarjeta "Pendientes" en lugar del valor estático "3"
