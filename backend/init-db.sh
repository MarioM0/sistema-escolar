#!/bin/bash
set -e

echo "🚀 Inicializando base de datos..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté disponible..."
while ! pg_isready -h postgres -U postgres -d sge_dev > /dev/null 2>&1; do
  echo "Esperando PostgreSQL..."
  sleep 1
done

echo "✅ PostgreSQL está disponible"

# Iniciar el servidor (que sincronizará las tablas y ejecutará seeders)
echo "🎯 Iniciando servidor backend..."
node src/server.js
