# Wini (React Native + Backend)

Proyecto React Native organizado con enfoque MVVM, navegacion y backend SQLite.

## Estructura

```
App.tsx
backend/
  src/
    controllers/
    db/
    routes/
    services/
  package.json
  .env
src/
  components/
  config/
  models/
  navigation/
  services/
  viewmodels/
  views/
```

## Instalacion

```sh
npm install
cd backend
npm install
```

## Ejecutar

```sh
# App movil (Metro)
npm start

# Android
npm run android

# iOS (macOS)
npm run ios
```

```sh
# Backend
cd backend
npm run db:init
npm run dev
```

## Variables de entorno

### App movil

Crea un archivo `.env` en la raiz del proyecto con:

```sh
API_BASE_URL=http://localhost:3001/api
```

### Backend (SQLite)

Crea `backend/.env` con:

```sh
PORT=3001
DB_FILE=./data/wini.db
DB_HOST=localhost
DB_PORT=0
DB_USER=wini
DB_PASSWORD=wini
DB_NAME=wini
```

> En SQLite solo se usa `DB_FILE`. Los demas campos quedan disponibles si migras a otra base.

## Auth (API)
- Registro: `POST /api/auth/register` body `{ name, email, password, role }`
- Login: `POST /api/auth/login` body `{ email, password }`
- Respuesta: `{ token, user }`

## Dependencias de navegacion

Instala React Navigation:

```sh
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
```

Y las dependencias nativas (segun plataforma):

```sh
npm install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage
```
