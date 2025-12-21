export default class Student {
    constructor(studentId) {
        this.studentId = studentId;
        this.enrolledCourses = []; 
    }

    addCourse(courseCode) {
        if (!this.enrolledCourses.includes(courseCode)) {
            this.enrolledCourses.push(courseCode);
        }
    }
}