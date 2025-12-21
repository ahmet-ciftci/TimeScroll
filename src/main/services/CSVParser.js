import fs from 'fs';
import Student from '../models/Student';
import Course from '../models/Course';
import Classroom from '../models/Classroom';

class CSVParser {
  /**
   * Parses the Classrooms CSV file.
   * Expected Format: RoomName;Capacity
   * @param {string} filePath - Path to the CSV file
   * @returns {Array<Classroom>} - List of classroom objects
   */
  static parseClassrooms(filePath) {
    const classrooms = [];
    console.log(`[CSVParser] Reading Classrooms file: ${filePath}`);

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const lines = data.split(/\r?\n/);

      lines.forEach((line, index) => {
        if (!line.trim()) return;

        const parts = line.split(/[;,]/);

        if (parts.length >= 2) {
          const name = parts[0].trim();
          const capacity = parseInt(parts[1].trim());

          if (name && !isNaN(capacity)) {
            classrooms.push(new Classroom(name, capacity));
          } else {
            console.warn(`[CSVParser] Invalid data at line ${index + 1}: ${line}`);
          }
        }
      });

      console.log(`[CSVParser] Successfully loaded ${classrooms.length} classrooms.`);
    } catch (error) {
      console.error('[CSVParser] Error reading classrooms file:', error);
      throw error;
    }
    return classrooms;
  }

  /**
   * Parses the Enrollments CSV file.
   * Expected Format: CourseCode;Student1;Student2;...
   * @param {string} filePath - Path to the CSV file
   * @returns {Object} - { students: Array<Student>, courses: Array<Course> }
   */
  static parseEnrollments(filePath) {
    console.log(`[CSVParser] Reading Enrollments file: ${filePath}`);

    const studentsMap = new Map();
    const coursesMap = new Map();

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const lines = data.split(/\r?\n/);

      lines.forEach((line, index) => {
        if (!line.trim()) return;

        const parts = line.split(/[;,]/);

        // ensure there is at least a course code and one student
        if (parts.length > 1) {
          const courseCode = parts[0].trim();

          if (!coursesMap.has(courseCode)) {
            coursesMap.set(courseCode, new Course(courseCode));
          }
          const course = coursesMap.get(courseCode);

          for (let i = 1; i < parts.length; i++) {
            const studentId = parts[i].trim();
            if (!studentId) continue;

            if (!studentsMap.has(studentId)) {
              studentsMap.set(studentId, new Student(studentId));
            }
            const student = studentsMap.get(studentId);

            student.addCourse(courseCode);
            course.incrementCount();
          }
        }
      });

      const students = Array.from(studentsMap.values());
      const courses = Array.from(coursesMap.values());

      console.log(`[CSVParser] Successfully processed enrollments.`);
      console.log(`[CSVParser] Total Courses: ${courses.length}`);
      console.log(`[CSVParser] Total Unique Students: ${students.length}`);

      return { students, courses };
    } catch (error) {
      console.error('[CSVParser] Error reading enrollments file:', error);
      throw error;
    }
  }
}

export default CSVParser;
