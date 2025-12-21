const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const Student = require('../models/Student');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');

class DBManager {
    constructor() {
        if (DBManager.instance) {
            return DBManager.instance;
        }

        this.dbPath = path.join(process.cwd(), 'data', 'timescroll.db');
        this.db = null;

        DBManager.instance = this;
    }

    connect() {
        try {
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
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            this.db.exec(schema);
            console.log("[DBManager] Schema initialized/verified.");
        } else {
            console.error("[DBManager] schema.sql not found!");
        }
    }

    saveClassrooms(classrooms) {
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO classrooms (room_name, capacity) 
            VALUES (@roomName, @capacity)
        `);

        const insertMany = this.db.transaction((rooms) => {
            for (const room of rooms) {
                insert.run({
                    roomName: room.roomName,
                    capacity: room.capacity
                });
            }
        });

        insertMany(classrooms);
        console.log(`[DBManager] Saved ${classrooms.length} classrooms to DB.`);
    }

    saveEnrollmentData({ students, courses }) {
        console.log("[DBManager] Saving bulk enrollment data...");

        const insertCourse = this.db.prepare(`
            INSERT OR REPLACE INTO courses (course_code, total_students)
            VALUES (@courseCode, @studentCount)
        `);

        const insertStudent = this.db.prepare(`
            INSERT OR REPLACE INTO students (student_id)
            VALUES (@studentId)
        `);

        const insertEnrollment = this.db.prepare(`
            INSERT OR IGNORE INTO enrollments (student_id, course_code)
            VALUES (?, ?)
        `);

        const transaction = this.db.transaction(() => {
            for (const course of courses) {
                insertCourse.run({
                    courseCode: course.courseCode,
                    studentCount: course.studentCount
                });
            }

            for (const student of students) {
                insertStudent.run({
                    studentId: student.studentId
                });
                
                for (const courseCode of student.enrolledCourses) {
                    insertEnrollment.run(student.studentId, courseCode);
                }
            }
        });

        transaction();
        console.log(`[DBManager] Saved ${courses.length} courses and ${students.length} students to DB.`);
    }
    
    getGlobalSettings() {
        const stmt = this.db.prepare('SELECT setting_key, setting_value FROM system_settings');
        const rows = stmt.all();
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        return settings;
    }

    updateGlobalSettings(newSettings) {
        console.log("[DBManager] Updating system settings...", newSettings);
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO system_settings (setting_key, setting_value)
            VALUES (@key, @value)
        `);

        const updateTransaction = this.db.transaction((settings) => {
            for (const [key, value] of Object.entries(settings)) {
                if (value !== undefined && value !== null) {
                    stmt.run({ 
                        key: key, 
                        value: String(value) 
                    });
                }
            }
        });

        updateTransaction(newSettings);
        console.log("[DBManager] Settings updated successfully.");
    }


    getAllClassrooms() {
        const rows = this.db.prepare('SELECT room_name, capacity FROM classrooms').all();
        return rows.map(row => new Classroom(row.room_name, row.capacity));
    }


    getAllDataForScheduler() {
        const courseRows = this.db.prepare('SELECT course_code, total_students FROM courses').all();
        const courses = courseRows.map(row => {
            const c = new Course(row.course_code);
            c.studentCount = row.total_students;
            return c;
        });

        const studentRows = this.db.prepare('SELECT student_id FROM students').all();
        const studentsMap = new Map();
        
        studentRows.forEach(row => {
            studentsMap.set(row.student_id, new Student(row.student_id));
        });

        const enrollmentRows = this.db.prepare('SELECT student_id, course_code FROM enrollments').all();
        
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


    saveSchedule(profileName, slots) {
        console.log(`[DBManager] Saving schedule profile: "${profileName}"`);
        
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
            SELECT profile_name, created_at 
            FROM exam_slots 
            GROUP BY profile_name 
            ORDER BY created_at DESC
        `);
        return stmt.all();
    }
}

module.exports = new DBManager();