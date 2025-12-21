import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

import Student from '../models/Student';
import Course from '../models/Course';
import Classroom from '../models/Classroom';

class DBManager {
    constructor() {
        if (DBManager.instance) {
            return DBManager.instance;
        }

        this.dbPath = null; // Will be set in connect()
        this.db = null;

        DBManager.instance = this;
    }

    connect() {
        try {
            // Import app dynamically to avoid issues during module loading
            const { app } = require('electron');
            
            // Use app.getPath for user data in production, or project root in dev
            const userDataPath = app.isPackaged 
                ? app.getPath('userData') 
                : process.cwd();
            this.dbPath = path.join(userDataPath, 'data', 'timescroll.db');
            
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            this.db = new Database(this.dbPath);
            console.log(`[DBManager] Connected to SQLite: ${this.dbPath}`);

            this.initSchema();
        } catch (error) {
            console.error("[DBManager] Connection failed:", error);
            throw error;
        }
    }

    initSchema() {
        // The schema is embedded directly to avoid file path issues after bundling
        // All data is scoped by profile_name for complete schedule isolation
        const schema = `
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    UNIQUE(profile_name, setting_key)
);

CREATE TABLE IF NOT EXISTS classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    room_name TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    UNIQUE(profile_name, room_name)
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    course_name TEXT,
    total_students INTEGER DEFAULT 0,
    UNIQUE(profile_name, course_code)
);

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    UNIQUE(profile_name, student_id)
);

CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    course_code TEXT NOT NULL,
    UNIQUE(profile_name, student_id, course_code)
);

CREATE TABLE IF NOT EXISTS exam_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,  
    course_code TEXT NOT NULL,
    room_name TEXT NOT NULL,
    exam_date TEXT NOT NULL,   
    start_time TEXT NOT NULL,  
    end_time TEXT NOT NULL,    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_profiles (
    profile_name TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    exam_duration INTEGER DEFAULT 90,
    min_exam_days INTEGER DEFAULT 5,
    max_exam_days INTEGER DEFAULT 30,
    day_start_time TEXT DEFAULT '09:00',
    day_end_time TEXT DEFAULT '18:00'
);
`;
        this.db.exec(schema);
        console.log("[DBManager] Schema initialized/verified.");
    }

    // ==================== PROFILE MANAGEMENT ====================

    /**
     * Create a new schedule profile with settings
     */
    createProfile(profileName, settings = {}) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO schedule_profiles 
            (profile_name, exam_duration, min_exam_days, max_exam_days, day_start_time, day_end_time)
            VALUES (@profileName, @examDuration, @minDays, @maxDays, @startTime, @endTime)
        `);
        
        stmt.run({
            profileName,
            examDuration: settings.exam_duration || 90,
            minDays: settings.min_exam_days || 5,
            maxDays: settings.max_exam_days || 30,
            startTime: settings.day_start_time || '09:00',
            endTime: settings.day_end_time || '18:00'
        });
        
        console.log(`[DBManager] Created profile: ${profileName}`);
        return profileName;
    }

    /**
     * Get profile settings
     */
    getProfileSettings(profileName) {
        const stmt = this.db.prepare('SELECT * FROM schedule_profiles WHERE profile_name = ?');
        const row = stmt.get(profileName);
        
        if (!row) return null;
        
        return {
            profile_name: row.profile_name,
            exam_duration: row.exam_duration,
            min_exam_days: row.min_exam_days,
            max_exam_days: row.max_exam_days,
            day_start_time: row.day_start_time,
            day_end_time: row.day_end_time,
            created_at: row.created_at
        };
    }

    /**
     * Get all profiles summary
     */
    getAllProfiles() {
        const stmt = this.db.prepare(`
            SELECT profile_name, created_at, exam_duration, day_start_time, day_end_time
            FROM schedule_profiles 
            ORDER BY created_at DESC
        `);
        return stmt.all();
    }

    /**
     * Delete a profile and all its associated data
     */
    deleteProfile(profileName) {
        const deleteTransaction = this.db.transaction(() => {
            this.db.prepare('DELETE FROM exam_slots WHERE profile_name = ?').run(profileName);
            this.db.prepare('DELETE FROM enrollments WHERE profile_name = ?').run(profileName);
            this.db.prepare('DELETE FROM students WHERE profile_name = ?').run(profileName);
            this.db.prepare('DELETE FROM courses WHERE profile_name = ?').run(profileName);
            this.db.prepare('DELETE FROM classrooms WHERE profile_name = ?').run(profileName);
            this.db.prepare('DELETE FROM schedule_profiles WHERE profile_name = ?').run(profileName);
        });
        
        deleteTransaction();
        console.log(`[DBManager] Deleted profile: ${profileName}`);
    }

    // ==================== DATA SAVING (SCOPED BY PROFILE) ====================

    saveClassrooms(profileName, classrooms) {
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO classrooms (profile_name, room_name, capacity) 
            VALUES (@profileName, @roomName, @capacity)
        `);

        const insertMany = this.db.transaction((rooms) => {
            for (const room of rooms) {
                insert.run({
                    profileName,
                    roomName: room.roomName,
                    capacity: room.capacity
                });
            }
        });

        insertMany(classrooms);
        console.log(`[DBManager] Saved ${classrooms.length} classrooms to profile: ${profileName}`);
    }

    saveEnrollmentData(profileName, { students, courses }) {
        console.log(`[DBManager] Saving enrollment data for profile: ${profileName}`);

        const insertCourse = this.db.prepare(`
            INSERT OR REPLACE INTO courses (profile_name, course_code, total_students)
            VALUES (@profileName, @courseCode, @studentCount)
        `);

        const insertStudent = this.db.prepare(`
            INSERT OR REPLACE INTO students (profile_name, student_id)
            VALUES (@profileName, @studentId)
        `);

        const insertEnrollment = this.db.prepare(`
            INSERT OR IGNORE INTO enrollments (profile_name, student_id, course_code)
            VALUES (?, ?, ?)
        `);

        const transaction = this.db.transaction(() => {
            for (const course of courses) {
                insertCourse.run({
                    profileName,
                    courseCode: course.courseCode,
                    studentCount: course.studentCount
                });
            }

            for (const student of students) {
                insertStudent.run({
                    profileName,
                    studentId: student.studentId
                });
                
                for (const courseCode of student.enrolledCourses) {
                    insertEnrollment.run(profileName, student.studentId, courseCode);
                }
            }
        });

        transaction();
        console.log(`[DBManager] Saved ${courses.length} courses and ${students.length} students to profile: ${profileName}`);
    }

    // ==================== DATA RETRIEVAL (SCOPED BY PROFILE) ====================
    
    getGlobalSettings() {
        // For backwards compatibility - get settings from latest profile
        const profiles = this.getAllProfiles();
        if (profiles.length === 0) {
            return {
                exam_duration: '90',
                min_exam_days: '5',
                max_exam_days: '30',
                day_start_time: '09:00',
                day_end_time: '18:00'
            };
        }
        return this.getProfileSettings(profiles[0].profile_name);
    }

    updateGlobalSettings(newSettings) {
        // Deprecated - settings are now per-profile
        console.log("[DBManager] updateGlobalSettings is deprecated. Use profile settings instead.");
    }

    getAllClassrooms(profileName = null) {
        let rows;
        if (profileName) {
            rows = this.db.prepare('SELECT room_name, capacity FROM classrooms WHERE profile_name = ?').all(profileName);
        } else {
            // Fallback: get from latest profile
            const profiles = this.getAllProfiles();
            if (profiles.length === 0) return [];
            rows = this.db.prepare('SELECT room_name, capacity FROM classrooms WHERE profile_name = ?').all(profiles[0].profile_name);
        }
        return rows.map(row => new Classroom(row.room_name, row.capacity));
    }

    getAllDataForScheduler(profileName = null) {
        const targetProfile = profileName || this.getLatestProfileName();
        if (!targetProfile) {
            return { courses: [], students: [] };
        }

        const courseRows = this.db.prepare('SELECT course_code, total_students FROM courses WHERE profile_name = ?').all(targetProfile);
        const courses = courseRows.map(row => {
            const c = new Course(row.course_code);
            c.studentCount = row.total_students;
            return c;
        });

        const studentRows = this.db.prepare('SELECT student_id FROM students WHERE profile_name = ?').all(targetProfile);
        const studentsMap = new Map();
        
        studentRows.forEach(row => {
            studentsMap.set(row.student_id, new Student(row.student_id));
        });

        const enrollmentRows = this.db.prepare('SELECT student_id, course_code FROM enrollments WHERE profile_name = ?').all(targetProfile);
        
        enrollmentRows.forEach(row => {
            const student = studentsMap.get(row.student_id);
            if (student) {
                student.addCourse(row.course_code);
            }
        });

        return {
            courses: courses,
            students: Array.from(studentsMap.values())
        };
    }

    getLatestProfileName() {
        const profiles = this.getAllProfiles();
        return profiles.length > 0 ? profiles[0].profile_name : null;
    }


    saveSchedule(profileName, slots) {
        console.log(`[DBManager] Saving schedule for profile: "${profileName}"`);
        
        const deleteStmt = this.db.prepare('DELETE FROM exam_slots WHERE profile_name = ?');
        
        const insertStmt = this.db.prepare(`
            INSERT INTO exam_slots (profile_name, course_code, room_name, exam_date, start_time, end_time)
            VALUES (@profileName, @courseCode, @roomName, @date, @startTime, @endTime)
        `);

        const saveTx = this.db.transaction((slotList) => {
            deleteStmt.run(profileName);
            for (const slot of slotList) {
                insertStmt.run({
                    profileName: profileName,
                    courseCode: slot.courseCode,
                    roomName: slot.roomName,
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                });
            }
        });

        saveTx(slots);
        console.log("[DBManager] Schedule committed successfully.");
    }

    getSchedule(profileName) {
        return this.db.prepare('SELECT * FROM exam_slots WHERE profile_name = ?').all(profileName);
    }

    getAllSchedulesSummary() {
        const stmt = this.db.prepare(`
            SELECT profile_name, created_at, exam_duration, day_start_time, day_end_time
            FROM schedule_profiles 
            ORDER BY created_at DESC
        `);
        return stmt.all();
    }

    getStudentCourses(profileName, studentId) {
        const stmt = this.db.prepare('SELECT course_code FROM enrollments WHERE profile_name = ? AND student_id = ?');
        const rows = stmt.all(profileName, studentId);
        return rows.map(row => row.course_code);
    }

    getAllStudents(profileName = null) {
        const targetProfile = profileName || this.getLatestProfileName();
        if (!targetProfile) return [];
        
        return this.db.prepare('SELECT student_id FROM students WHERE profile_name = ?').all(targetProfile);
    }
}

// Export singleton instance
const dbManager = new DBManager();
export default dbManager;