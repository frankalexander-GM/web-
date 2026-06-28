#!/usr/bin/env bash
# Supervisor: mantiene el servicio Java vivo, reiniciándolo si se cae.
set -e
cd "$(dirname "$0")"

JDK=/home/z/my-project/.jdk
JAVA="$JDK/bin/java"
JAR_CP="build:lib/*"

# Compilar primero si build no existe o si hay cambios
if [ ! -d build ] || [ src -nt build ]; then
    echo "🔨 Compilando Java..."
    mkdir -p build
    find src -name '*.java' > sources.txt
    "$JDK/bin/javac" -cp "lib/*" -d build @sources.txt
    rm -f sources.txt
    echo "✅ Compilación exitosa."
fi

echo "🚀 Iniciando supervisor del servicio Java (puerto 3005)..."
while true; do
    "$JAVA" -cp "$JAR_CP" com.streamverse.recommendation.Main
    EXIT_CODE=$?
    echo "⚠️  El servicio Java terminó (código $EXIT_CODE). Reiniciando en 2s..."
    sleep 2
done
