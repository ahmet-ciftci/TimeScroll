# TimeScroll

TimeScroll is a Windows desktop application designed to automate the creation of examination schedules for educational institutions. Built with Electron and React, it provides an elegant solution for managing complex scheduling requirements.

The application uses intelligent algorithms to:
- **Allocate classrooms** efficiently using bin-packing algorithms
- **Detect conflicts** for students enrolled in multiple courses
- **Generate optimized schedules** that respect time constraints and room capacities

Whether you're scheduling exams for a single department or an entire university, TimeScroll streamlines the process with a modern, intuitive interface.

---

## Features

### Core Functionality
- **Smart Schedule Generation** — Automatically generates exam schedules based on constraints
- **Classroom Management** — Track room capacities and availability
- **Student & Course Tracking** — Manage enrollments and detect scheduling conflicts
- **Visual Calendar View** — Interactive calendar grid showing all scheduled exams
- **Dark/Light Theme** — Beautiful Nord-themed interface with theme switching

### Data Management
- **CSV Import** — Import classroom and enrollment data from CSV files
- **Profile-Based Projects** — Create and manage multiple schedule projects
- **JSON/CSV Export** — Export generated schedules to JSON or CSV format

### Technical Highlights
- **Fast & Responsive** — Built with React 19 and Framer Motion animations
- **Local Storage** — SQLite database for reliable local data storage
- **Windows Native** — Optimized for Windows desktop

---

## Installation

### Option 1: Download from Releases

Download the latest release:

| Platform | Download |
|----------|----------|
| Windows  | `timescroll-x.x.x-setup.exe` |

1. Download the installer from the releases page
2. Run the installer and follow the on-screen instructions
3. Launch TimeScroll from your Start menu or desktop shortcut

### Option 2: Run from Source

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

#### Steps

```bash
# Clone the repository
git clone https://github.com/ahmet-ciftci/TimeScroll.git
cd TimeScroll

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Usage

### Getting Started

When you first launch TimeScroll, you'll see the **Welcome screen** where you can create a new schedule or open a recent project.

![Welcome Screen](docs/screenshots/Welcome%20Screen.png)

---

### Creating a New Schedule

1. Click **"Create New Schedule"** on the welcome screen
2. Fill in the schedule details in the dialog:

![New Schedule Dialog](docs/screenshots/New%20Schedule%20Dialog.png)

**Required Inputs:**
- **Schedule Name** — A descriptive name for your schedule
- **Classroom Data (CSV)** — File with columns: `Room Name, Capacity`
- **Enrollment Data (CSV)** — File with columns: `Course Code, Student ID`
- **Exam Duration** — Default exam length in minutes
- **Schedule Duration** — Minimum and maximum days for the exam period
- **Time Range** — Daily start and end times (24-hour format, e.g., `09:00` to `18:00`)

3. Click **"Create Schedule"** to generate your exam schedule

---

### Dashboard View

After creating or opening a schedule, you'll see the **Dashboard** with an interactive calendar grid showing all scheduled exams.

![Dashboard Calendar View](docs/screenshots/Dashboard%20Calendar%20View.png)

**Calendar Features:**
- Click on exam blocks to view details

---

### Managing Classrooms

Navigate to the **Classroom** section from the sidebar to manage your rooms.

![Classroom Management View](docs/screenshots/Classroom%20Management%20View.png)

**Actions:**
- View all classrooms and their capacities

---

### Managing Students

The **Student** section allows you to view and manage student data.

![Student Management View](docs/screenshots/Student%20Management%20View.png)

**View Information:**
- Student IDs
- Course enrollments

---

### Managing Courses

The **Course** section displays all courses included in the schedule.

![Course Management View](docs/screenshots/Course%20Management%20View.png)

**Course Details:**
- Course codes
- Number of enrolled students
- Assigned exam date and time
- Room allocation

---

### Sidebar Navigation & Theme Toggle

The sidebar provides quick access to all sections of the application.

<img src="docs/screenshots/Sidebar%20with%20Theme%20Toggle.png" width="120" alt="Sidebar">

**Navigation Items:**
- Dashboard — Calendar overview
- Classroom — Room management
- Student — Student data
- Course — Course management
- Light/Dark Mode — Toggle between light and dark themes
- Export Schedule — Export the schedule to a JSON or CSV file

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Electron](https://www.electronjs.org/) | Desktop application framework |
| [React 19](https://reactjs.org/) | UI component library |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [SQLite](https://www.sqlite.org/) | Local database |
| [Vite](https://vitejs.dev/) | Build tool |