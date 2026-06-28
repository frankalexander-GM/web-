#!/usr/bin/env bash
# Compila y ejecuta el servicio Java de recomendaciones.
# Usa el JDK portable descargado en /home/z/my-project/.jdk
set -e
cd "$(dirname "$0")"

JDK=/home/z/my-project/.jdk
JAVAC="$JDK/bin/javac"
JAVA="$JDK/bin/java"

# Compilar
echo "🔨 Compilando Java..."
mkdir -p build
find src -name '*.java' > sources.txt
"$JAVAC" -cp "lib/*" -d build @sources.txt
rm sources.txt
echo "✅ Compilación exitosa."

# Ejecutar
echo "🚀 Iniciando servicio en puerto 3005..."
exec "$JAVA" -cp "build:lib/*" com.streamverse.recommendation.Main
