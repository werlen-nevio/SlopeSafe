# SlopeSafe Web

A Vue.js web application for viewing Swiss avalanche safety information across ski resorts.

## Features

- **Resort Browser** - Search, filter, and sort ski resorts by name, danger level, or canton
- **Avalanche Danger Tracking** - Real-time danger levels with historical 7-day trends
- **Interactive Map** - MapLibre GL-powered map with resort markers and danger zone layers
- **User Accounts** - Register and login to access personalized features
- **Favorites** - Save resorts for quick access
- **Alert Rules** - Create custom alerts based on danger level thresholds
- **Weather Data** - Current conditions for each resort
- **Multi-language** - German and English support
- **Dark/Light Theme** - System preference detection with manual toggle
- **Embed Widgets** - QR code generation for sharing resort data

## Tech Stack

- **Vue.js 3** - Composition API with script setup
- **Vite** - Build tool and dev server
- **Pinia** - State management
- **Vue Router** - Client-side routing with auth guards
- **Vue I18n** - Internationalization
- **MapLibre GL** - Interactive maps
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **Headless UI** - Accessible UI components

## Prerequisites

- Node.js 20+
- npm
- Backend API running (default: `http://localhost:8000`)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=SlopeSafe
VITE_DEFAULT_LANGUAGE=de
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Docker

Build and run with Docker:

```bash
docker build -t slopesafe-web .
docker run -p 3000:3000 slopesafe-web
```

Or use docker-compose from the project root:

```bash
docker-compose up web
```

## Project Structure

```
src/
├── api/           # API client and endpoint modules
├── assets/        # CSS themes and static assets
├── components/    # Reusable Vue components
│   ├── alerts/    # Alert rule components
│   ├── common/    # Shared UI components
│   ├── embed/     # Embed widget components
│   └── resort/    # Resort-specific components
├── i18n/          # Internationalization config and locales
├── router/        # Vue Router configuration
├── stores/        # Pinia state stores
├── views/         # Page components
├── App.vue        # Root component
└── main.js        # Application entry point
```

## API Integration

The app communicates with the SlopeSafe backend API. Key endpoints:

| Endpoint | Description |
|----------|-------------|
| `/resorts` | List all resorts |
| `/resorts/search?q=` | Search resorts |
| `/resorts/{slug}` | Resort details |
| `/auth/login` | User authentication |
| `/auth/register` | User registration |
| `/favorites` | User favorites management |
| `/alert-rules` | Alert rules CRUD |
| `/historical/{slug}` | Historical danger data |
| `/weather/{slug}` | Weather information |

Authentication uses JWT tokens sent via `Authorization: Bearer` header.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Browser Support

Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge).

## License

Proprietary - All rights reserved.
