# Frontend Development Guide

This guide explains where UI developers should create views and components for TimeScroll.

## Overview

The frontend is built with **React 19** and **Tailwind CSS**, running in Electron's renderer process. All UI code lives in `src/renderer/`.

## Directory Structure

```
src/renderer/
├── index.html              # HTML shell
└── src/
    ├── assets/             # CSS and static assets
    │   └── main.css        # Tailwind CSS entry
    ├── components/         # Reusable UI components
    ├── views/              # Page-level view components
    ├── App.jsx             # Root application component
    └── main.jsx            # React entry point
```

## Where to Create Views

Page-level views should be created in `src/renderer/src/views/`. Each view represents a distinct screen in the application.

### Recommended Views

| File | Purpose |
|------|---------|
| `views/DashboardView.jsx` | Main dashboard with schedule overview |
| `views/StudentView.jsx` | Student management interface |
| `views/ClassroomView.jsx` | Classroom/venue management |
| `views/ExamView.jsx` | Examination scheduling view |
| `views/SettingsView.jsx` | Application settings |

### Example View Structure

```javascript
// src/renderer/src/views/DashboardView.jsx

function DashboardView() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}

export default DashboardView;
```

## Where to Create Components

Reusable UI components should be created in `src/renderer/src/components/`. These are building blocks used across multiple views.

### Recommended Component Categories

```
components/
├── common/           # Buttons, inputs, modals
├── layout/           # Header, Sidebar, Footer
├── schedule/         # Schedule-related components
├── forms/            # Form components
└── tables/           # Data table components
```

### Example Component with Tailwind

```javascript
// src/renderer/src/components/common/Button.jsx

function Button({ children, onClick, variant = 'primary' }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`${baseClasses} ${variants[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
```

## Styling with Tailwind CSS

This project uses Tailwind CSS for styling. The main CSS file is at `src/renderer/src/assets/main.css`.

### Key Points

- Use Tailwind utility classes directly in JSX
- Customize theme in `tailwind.config.js`
- Add custom CSS in `main.css` when needed

## Communicating with Main Process

Use the `window.electron` and `window.api` objects exposed by the preload script:

```javascript
// Example: Use electron-toolkit APIs
const versions = window.electron.process.versions;

// Example: Use custom APIs (defined in preload)
const result = await window.api.someMethod(data);
```

## Development Workflow

```bash
# Start development with hot reload
npm run dev

# Lint your code
npm run lint

# Format with Prettier
npm run format
```

## Best Practices

1. **Component Naming:** Use PascalCase with `.jsx` extension
2. **One Component Per File:** Keep components focused and single-purpose
3. **Tailwind Classes:** Use utility classes, avoid custom CSS when possible
4. **State Management:** Consider using React Context for global state
5. **File Aliases:** Use `@renderer/` alias to import from renderer src
