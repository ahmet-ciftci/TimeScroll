# TimeScroll

A standalone desktop application for Windows designed to automate the creation of examination schedules for educational institutions.

## Architecture

TimeScroll follows a **Layered MVC Architecture** adapted for Electron:

```
┌─────────────────────────────────────────────┐
│           Presentation Layer (View)          │
│         React.js - Renderer Process          │
│           src/renderer/                      │
├─────────────────────────────────────────────┤
│         Application Logic (Controller)       │
│         Node.js - Main Process               │
│           src/main/                          │
├─────────────────────────────────────────────┤
│           Data Access Layer (Model)          │
│           SQLite via better-sqlite3          │
│           src/data/                          │
└─────────────────────────────────────────────┘
```

## Directory Structure

```
timescroll/
├── src/
│   ├── main/              # Electron Main Process
│   │   ├── controllers/   # Business logic controllers
│   │   └── index.js       # Entry point
│   ├── preload/           # Secure IPC bridge
│   │   └── index.js
│   ├── renderer/          # React Renderer Process
│   │   ├── src/
│   │   │   ├── assets/    # CSS and static assets
│   │   │   ├── components/# Reusable UI components
│   │   │   ├── views/     # Page-level views
│   │   │   ├── App.jsx    # Root component
│   │   │   └── main.jsx   # React entry
│   │   └── index.html     # HTML shell
│   └── data/              # Data Access Layer
│       └── models/        # Database models & schemas
├── docs/                  # Developer documentation
├── build/                 # Build resources (icons, etc.)
├── resources/             # App resources
└── package.json
```

## Tech Stack

- **Framework:** Electron 39.x
- **Build Tool:** electron-vite
- **Frontend:** React 19.x with Tailwind CSS
- **Database:** SQLite (via better-sqlite3)
- **Language:** JavaScript/Node.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd timescroll

# Install dependencies
npm install

# Start in development mode
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start in development mode with hot reload |
| `npm start` | Preview production build |
| `npm run build` | Build for all platforms |
| `npm run build:win` | Build for Windows |
| `npm run build:mac` | Build for macOS |
| `npm run build:linux` | Build for Linux |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Documentation

- [Frontend Guide](docs/FRONTEND_GUIDE.md) - UI development guidelines
- [Backend Guide](docs/BACKEND_GUIDE.md) - Controller and business logic
- [Database Guide](docs/DATABASE_GUIDE.md) - Data layer implementation

## Code Style

This project uses:
- **ESLint** for code quality
- **Prettier** for formatting
- **EditorConfig** for cross-IDE consistency

Run `npm run format` before committing to ensure consistent formatting.

## License

MIT
