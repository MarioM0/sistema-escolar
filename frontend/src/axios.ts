// frontend/src/axios.ts
import axios from "axios";

// Función para obtener tokens del localStorage
const getAuthTokens = () => {
  try {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.error('Error al obtener tokens:', error);
    return null;
  }
};

// Configurar axios con interceptors
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://backend:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const tokens = getAuthTokens();
    
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas con renovación automática de tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 (token expirado) y no hemos reintentado aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        const tokens = getAuthTokens();
        if (tokens?.refreshToken) {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://backend:3000/api"}/auth/refresh`,
            { refreshToken: tokens.refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          if (refreshResponse.data?.success && refreshResponse.data?.accessToken) {
            // Actualizar el token en localStorage
            const newTokens = {
              ...tokens,
              accessToken: refreshResponse.data.accessToken
            };
            localStorage.setItem('authTokens', JSON.stringify(newTokens));
            
            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error al renovar token:', refreshError);
        // Si falla el refresh, limpiar tokens y redirigir a login
        localStorage.removeItem('authTokens');
        localStorage.removeItem('authUser');
        
        // Recargar la página para forzar logout
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
