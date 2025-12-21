export default class Course {
    constructor(courseCode) {
        this.courseCode = courseCode;
        this.studentCount = 0; 
    }

    incrementCount() {
        this.studentCount++;
    }
}