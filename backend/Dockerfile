FROM node:20

# Instalar cliente de Postgres para usar pg_isready
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo package.json para aprovechar cache
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Hacer ejecutables los scripts
COPY wait-for.sh /wait-for.sh
COPY init-db.sh /init-db.sh
RUN chmod +x /wait-for.sh /init-db.sh

# Exponer el puerto del backend
EXPOSE 3000

# Comando de inicio con inicialización
CMD ["/init-db.sh"]
