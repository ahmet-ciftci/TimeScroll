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
}

module.exports = new DBManager();