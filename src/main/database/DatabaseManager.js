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
}

module.exports = new DBManager();