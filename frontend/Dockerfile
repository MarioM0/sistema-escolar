# --- FASE 1: Construcción ---


FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- FASE 2: Servir con NGINX ---
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Aquí está el cambio clave
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


