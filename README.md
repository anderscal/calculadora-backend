# Calculadora Backend

API REST para operaciones matemáticas básicas.

## Requisitos

- Node.js
- npm

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor:
```bash
npm start
```

## Endpoints

- POST /api/calculate: Realiza operaciones matemáticas
  - Body: { "operation": "suma|resta|multiplicacion|division", "a": number, "b": number }

## Despliegue

Este proyecto está configurado para ser desplegado en Railway. 