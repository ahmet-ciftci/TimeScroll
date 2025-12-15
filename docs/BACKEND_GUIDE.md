# Backend Development Guide

This guide explains where logic developers should place business logic, controllers, and algorithms for TimeScroll.

## Overview

The backend logic runs in Electron's **main process** and handles all business operations, scheduling algorithms, and data orchestration. All backend code lives in `src/main/`.

## Directory Structure

```
src/main/
├── controllers/    # Business logic controllers
└── index.js        # Electron entry point

src/preload/
└── index.js        # Secure IPC bridge
```

## Where to Place Controllers

Business logic controllers should be created in `src/main/controllers/`. Each controller handles a specific domain of the application.

### Recommended Controllers

| File | Purpose |
|------|---------|
| `controllers/SchedulerController.js` | Exam scheduling logic & algorithms |
| `controllers/StudentController.js` | Student data operations |
| `controllers/ClassroomController.js` | Classroom/venue management |
| `controllers/ExamController.js` | Examination CRUD operations |
| `controllers/ExportController.js` | Schedule export functionality |

## Scheduler & Bin Packing Algorithm

The core scheduling algorithm should be implemented in `src/main/controllers/SchedulerController.js`.

### Recommended Structure

```javascript
// src/main/controllers/SchedulerController.js

/**
 * SchedulerController
 *
 * Handles examination scheduling using bin-packing
 * and constraint satisfaction algorithms.
 */
class SchedulerController {
  constructor(dbManager) {
    this.db = dbManager;
  }

  /**
   * Generate optimal exam schedule
   * @param {Object} constraints - Scheduling constraints
   * @returns {Object} Generated schedule
   */
  generateSchedule(constraints) {
    // Implement bin-packing algorithm here
    // Consider: time slots, room capacities, conflicts
  }

  /**
   * Bin-packing algorithm for room allocation
   * @param {Array} exams - Exams to schedule
   * @param {Array} rooms - Available rooms
   * @returns {Object} Room assignments
   */
  binPackRooms(exams, rooms) {
    // First-fit decreasing bin packing
  }

  /**
   * Check for scheduling conflicts
   * @param {Object} schedule - Proposed schedule
   * @returns {Array} List of conflicts
   */
  detectConflicts(schedule) {
    // Detect student conflicts, room overlaps
  }
}

export default SchedulerController;
```

## IPC Communication

Controllers communicate with the renderer process via IPC (Inter-Process Communication).

### Setting Up IPC Handlers

In `src/main/index.js`, register IPC handlers:

```javascript
import { ipcMain } from 'electron';
import SchedulerController from './controllers/SchedulerController';

const scheduler = new SchedulerController(dbManager);

ipcMain.handle('generate-schedule', async (event, constraints) => {
  return scheduler.generateSchedule(constraints);
});

ipcMain.handle('detect-conflicts', async (event, schedule) => {
  return scheduler.detectConflicts(schedule);
});
```

### Exposing Methods in Preload

Update `src/preload/index.js` to expose IPC methods:

```javascript
import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  generateSchedule: (constraints) =>
    ipcRenderer.invoke('generate-schedule', constraints),
  detectConflicts: (schedule) =>
    ipcRenderer.invoke('detect-conflicts', schedule),
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI);
  contextBridge.exposeInMainWorld('api', api);
}
```

## Using in Renderer

Call the exposed APIs from React components:

```javascript
// In a React component
async function handleGenerateSchedule() {
  const schedule = await window.api.generateSchedule({
    semester: 'Fall 2024',
    maxExamsPerDay: 3,
  });
  console.log(schedule);
}
```

## Best Practices

1. **Single Responsibility:** Each controller handles one domain
2. **Dependency Injection:** Pass DatabaseManager to controllers
3. **ES Modules:** Use `import/export` syntax (electron-vite supports it)
4. **Async Operations:** Use async/await for database operations
5. **Error Handling:** Wrap operations in try-catch blocks
6. **Logging:** Implement logging for debugging

## Algorithm Considerations

When implementing the scheduling algorithm:

- **Bin Packing:** Use First-Fit Decreasing (FFD) for room allocation
- **Conflict Detection:** Graph coloring for student exam conflicts
- **Time Slot Assignment:** Consider faculty availability
- **Optimization:** Minimize gaps, balance examiner load
