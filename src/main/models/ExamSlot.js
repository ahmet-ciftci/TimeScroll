class ExamSlot {
    constructor(courseCode, roomName, date, startTime, endTime) {
        this.courseCode = courseCode;
        this.roomName = roomName;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime; 
    }
}

module.exports = ExamSlot;