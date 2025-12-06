# --- FASE 1: Construcción ---
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# --- FASE 2: Servir con NGINX ---
FROM nginx:alpine

# Copiamos el build de React
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 5173

# Reemplazar configuración por defecto (opcional)
CMD ["nginx", "-g", "daemon off;"]
