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
}

module.exports = new DBManager();