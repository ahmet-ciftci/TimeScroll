
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL
);

INSERT OR IGNORE INTO system_settings (setting_key, setting_value) VALUES 
('exam_duration', '90'),
('min_exam_days', '5'),
('max_exam_days', '30'),
('day_start_time', '09:00'),
('day_end_time', '18:00');

CREATE TABLE IF NOT EXISTS classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT UNIQUE NOT NULL, -- "C201"
    capacity INTEGER NOT NULL CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS courses (
    course_code TEXT PRIMARY KEY,  
    course_name TEXT,
    total_students INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,  
    first_name TEXT,             
    last_name TEXT               
);

CREATE TABLE IF NOT EXISTS enrollments (
    student_id TEXT NOT NULL,
    course_code TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE CASCADE,
    PRIMARY KEY (student_id, course_code)
);

CREATE TABLE IF NOT EXISTS exam_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,  
    course_code TEXT NOT NULL,
    room_name TEXT NOT NULL,
    exam_date TEXT NOT NULL,   
    start_time TEXT NOT NULL,  
    end_time TEXT NOT NULL,    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_code) REFERENCES courses(course_code),
    FOREIGN KEY (room_name) REFERENCES classrooms(room_name)
);