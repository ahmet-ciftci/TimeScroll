# Database Development Guide

This guide explains where data engineers should implement the DatabaseManager singleton and define the database schema for TimeScroll.

## Overview

TimeScroll uses **SQLite** via `better-sqlite3` for local data persistence. All data access code lives in `src/data/`.

## Directory Structure

```
src/data/
├── DatabaseManager.js    # Singleton database connection
└── models/               # Database models and schemas
    ├── StudentModel.js
    ├── ClassroomModel.js
    ├── ExamModel.js
    └── ScheduleModel.js
```

## DatabaseManager Singleton

Create the DatabaseManager in `src/data/DatabaseManager.js`:

```javascript
// src/data/DatabaseManager.js
import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';

/**
 * DatabaseManager Singleton
 *
 * Manages SQLite database connection and provides
 * a centralized interface for all database operations.
 */
class DatabaseManager {
  static instance = null;

  constructor() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance;
    }

    const dbPath = join(app.getPath('userData'), 'timescroll.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');

    DatabaseManager.instance = this;
  }

  static getInstance() {
    if (!DatabaseManager.instance) {
      new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  initialize() {
    this.createTables();
  }

  createTables() {
    // Create all tables - see schema below
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export default DatabaseManager;
```

## Where to Place Models

Database models should be created in `src/data/models/`. Each model handles CRUD operations for a specific entity.

### Recommended Models

| File | Purpose |
|------|---------|
| `models/StudentModel.js` | Student data operations |
| `models/ClassroomModel.js` | Classroom/venue data |
| `models/ExamModel.js` | Examination records |
| `models/ScheduleModel.js` | Generated schedules |
| `models/CourseModel.js` | Course information |

### Example Model

```javascript
// src/data/models/StudentModel.js

class StudentModel {
  constructor(db) {
    this.db = db;
  }

  create(student) {
    const stmt = this.db.prepare(`
      INSERT INTO students (student_id, name, department, year)
      VALUES (@student_id, @name, @department, @year)
    `);
    return stmt.run(student);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM students WHERE id = ?');
    return stmt.get(id);
  }

  findAll() {
    const stmt = this.db.prepare('SELECT * FROM students');
    return stmt.all();
  }

  update(id, data) {
    const stmt = this.db.prepare(`
      UPDATE students SET name = @name, department = @department
      WHERE id = @id
    `);
    return stmt.run({ id, ...data });
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM students WHERE id = ?');
    return stmt.run(id);
  }
}

export default StudentModel;
```

## Recommended Schema

```sql
-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  year INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classrooms Table
CREATE TABLE IF NOT EXISTS classrooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  building TEXT,
  capacity INTEGER NOT NULL,
  has_computers BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  credits INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  requires_computers BOOLEAN DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Student-Course Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE(student_id, course_id)
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  semester TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 0
);

-- Schedule Slots (Individual exam assignments)
CREATE TABLE IF NOT EXISTS schedule_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER NOT NULL,
  exam_id INTEGER NOT NULL,
  classroom_id INTEGER NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);
```

## Using DatabaseManager in Controllers

```javascript
// In src/main/controllers/StudentController.js
import DatabaseManager from '../../data/DatabaseManager';
import StudentModel from '../../data/models/StudentModel';

const db = DatabaseManager.getInstance();
const studentModel = new StudentModel(db.db);

// Use model methods
const students = studentModel.findAll();
```

## Initializing Database on App Start

In `src/main/index.js`, initialize the database when the app starts:

```javascript
import DatabaseManager from '../data/DatabaseManager';

app.whenReady().then(() => {
  // Initialize database
  const db = DatabaseManager.getInstance();
  db.initialize();

  // ... rest of app setup
});
```

## Best Practices

1. **Prepared Statements:** Always use prepared statements (prevents SQL injection)
2. **Transactions:** Use transactions for multi-table operations
3. **Indexes:** Add indexes for frequently queried columns
4. **WAL Mode:** Enable WAL for better concurrent performance
5. **Error Handling:** Catch and handle database errors gracefully
6. **ES Modules:** Use `import/export` syntax throughout
