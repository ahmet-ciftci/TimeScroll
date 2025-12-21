/**
 * Mock Data Service Layer
 * 
 * This service abstracts data fetching. Currently returns mock JSON data.
 * After backend integration, replace internal implementations with IPC/API calls.
 * Components should only call these functions, never import mock data directly.
 */

import mockData from '../data/mockData.json';

// Simulate network delay (optional, set to 0 for instant loading)
const MOCK_DELAY = 0;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get list of recent projects for Welcome Screen
 * @returns {Promise<Array>} Recent projects sorted by last modified
 */
export async function getRecentProjects() {
    await delay(MOCK_DELAY);
    return [...mockData.recentProjects].sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
    );
}

/**
 * Get all classrooms
 * @returns {Promise<Array>} List of classrooms with id and capacity
 */
export async function getClassrooms() {
    await delay(MOCK_DELAY);
    return mockData.classrooms;
}

/**
 * Get classroom by ID
 * @param {string} classroomId 
 * @returns {Promise<Object|null>} Classroom object or null if not found
 */
export async function getClassroomById(classroomId) {
    await delay(MOCK_DELAY);
    return mockData.classrooms.find(c => c.classroom_id === classroomId) || null;
}

/**
 * Get all students (derived from enrollment data)
 * @returns {Promise<Array>} List of all unique students
 */
export async function getStudents() {
    await delay(MOCK_DELAY);
    // Derive unique students from course enrollments
    const studentIds = new Set();
    mockData.courses.forEach(course => {
        course.enrolled_students.forEach(id => studentIds.add(id));
    });
    return Array.from(studentIds).sort().map(id => ({ student_id: id }));
}

/**
 * Get student by ID
 * @param {string} studentId 
 * @returns {Promise<Object|null>} Student object or null if not found
 */
export async function getStudentById(studentId) {
    await delay(MOCK_DELAY);
    return mockData.students.find(s => s.student_id === studentId) || null;
}

/**
 * Search students by ID (for autocomplete)
 * @param {string} query Search query
 * @returns {Promise<Array>} Matching students
 */
export async function searchStudents(query) {
    await delay(MOCK_DELAY);
    const students = await getStudents();
    const lowerQuery = query.toLowerCase();
    return students.filter(s =>
        s.student_id.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get all courses
 * @returns {Promise<Array>} List of all courses with enrollment data
 */
export async function getCourses() {
    await delay(MOCK_DELAY);
    return mockData.courses;
}

/**
 * Get course by code
 * @param {string} courseCode 
 * @returns {Promise<Object|null>} Course object with enrolled_students array
 */
export async function getCourseByCode(courseCode) {
    await delay(MOCK_DELAY);
    return mockData.courses.find(c => c.course_code === courseCode) || null;
}

/**
 * Get all exams
 * @returns {Promise<Array>} List of all scheduled exams
 */
export async function getExams() {
    await delay(MOCK_DELAY);
    return mockData.exams;
}

/**
 * Get exam by ID
 * @param {string} examId 
 * @returns {Promise<Object|null>} Exam object or null if not found
 */
export async function getExamById(examId) {
    await delay(MOCK_DELAY);
    return mockData.exams.find(e => e.exam_id === examId) || null;
}

/**
 * Get exams for a specific classroom
 * @param {string} classroomId 
 * @returns {Promise<Array>} Exams scheduled in that classroom
 */
export async function getExamsByClassroom(classroomId) {
    await delay(MOCK_DELAY);
    return mockData.exams.filter(e => e.classroom_id === classroomId);
}

/**
 * Get exams for a specific student
 * @param {string} studentId 
 * @returns {Promise<Array>} Exams the student is enrolled in
 */
export async function getExamsByStudent(studentId) {
    await delay(MOCK_DELAY);

    // Find courses the student is enrolled in
    const enrolledCourses = mockData.courses
        .filter(c => c.enrolled_students.includes(studentId))
        .map(c => c.course_code);

    // Find exams for those courses
    return mockData.exams.filter(e => enrolledCourses.includes(e.course_code));
}

/**
 * Get exams for a specific course
 * @param {string} courseCode 
 * @returns {Promise<Array>} Exams for that course
 */
export async function getExamsByCourse(courseCode) {
    await delay(MOCK_DELAY);
    return mockData.exams.filter(e => e.course_code === courseCode);
}

/**
 * Get full exam details including course and classroom info
 * @param {string} examId 
 * @returns {Promise<Object|null>} Enriched exam object
 */
export async function getExamDetails(examId) {
    await delay(MOCK_DELAY);

    const exam = mockData.exams.find(e => e.exam_id === examId);
    if (!exam) return null;

    const course = mockData.courses.find(c => c.course_code === exam.course_code);
    const classroom = mockData.classrooms.find(c => c.classroom_id === exam.classroom_id);

    // Get full student objects for enrolled students
    const enrolledStudents = course
        ? mockData.students.filter(s => course.enrolled_students.includes(s.student_id))
        : [];

    return {
        ...exam,
        course_code: exam.course_code,
        classroom_capacity: classroom?.capacity,
        enrolled_students: enrolledStudents
    };
}
