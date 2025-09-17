# ReactFilm - Star Wars Movies Application

Веб-приложение для просмотра информации о фильмах и персонажах из вселенной Star Wars, построенное на React + Vite с Express.js backend и SQLite базой данных.

## 🚀 Возможности

- 📺 Просмотр информации о фильмах Star Wars
- 👥 Просмотр персонажей и их связей с фильмами
- 🔍 Поиск персонажей по имени
- 📊 Административная панель с статистикой
- 📱 Адаптивный дизайн
- ⚡ Быстрый интерфейс на React с Redux Toolkit
- 🎯 API интеграция с SWAPI (Star Wars API)

## 🛠️ Технологический стек

### Frontend
- **React 19** - UI библиотека
- **Vite** - сборщик и dev сервер
- **Redux Toolkit** - управление состоянием
- **React Router** - маршрутизация
- **Framer Motion** - анимации
- **Swiper** - карусели

### Backend
- **Express.js** - веб-сервер
- **SQLite** (better-sqlite3) - база данных
- **CORS** - кросс-доменные запросы

## 📋 Требования

- **Node.js** версии 16.0 или выше
- **npm** или **yarn**

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/skl1menko/ReactFilm.git
cd ReactFilm
```

### 2. Установка зависимостей
```bash
npm install
npm install express
npm install better-sqlite3
npm install cors
```
### 3. Инициализация базы данных

Запустите сервер для создания базы данных:

```bash
npm run start
```

### 4. Запуск в режиме разработки

Откройте два терминала:

**Терминал 1 - Backend сервер:**
```bash
npm run start
```

**Терминал 2 - Frontend dev сервер:**
```bash
npm run dev
```

Приложение будет доступно по адресу:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📁 Структура проекта

```
ReactFilm/
├── src/                    # Frontend исходники
│   ├── components/         # React компоненты
│   ├── features/          # Redux слайсы
│   ├── pages/             # Страницы приложения
│   └── assets/            # Статические ресурсы
├── server/                # Backend исходники
│   ├── config/            # Конфигурация БД
│   ├── models/            # Модели данных
│   ├── routes/            # API маршруты
│   ├── services/          # Бизнес-логика
│   └── utils/             # Утилиты
├── public/                # Публичные файлы
└── database.db           # SQLite база данных
```

## 🔧 Доступные команды

```bash
# Разработка
npm run dev          # Запуск frontend dev сервера
npm run start        # Запуск backend сервера

# Сборка
npm run build        # Сборка для продакшена
npm run preview      # Предварительный просмотр сборки

# Линтинг
npm run lint         # Проверка кода с ESLint
```

## 🌐 API Endpoints

### Фильмы
- `GET /films` - Все фильмы
- `GET /films/:id` - Фильм по ID
- `GET /films/:id/characters` - Персонажи фильма

### Персонажи
- `GET /people` - Все персонажи
- `GET /people/:id` - Персонаж по ID
- `GET /people/search/:name` - Поиск персонажа

## 🔧 Настройка

### Переменные окружения

Создайте файл `.env` в корне проекта (опционально):

```env
PORT=3001
DB_PATH=./database.db
```

### Конфигурация Vite

Настройки находятся в `vite.config.js`. По умолчанию proxy настроен на `http://localhost:3001`.

