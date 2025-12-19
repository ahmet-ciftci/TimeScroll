const ExamSlot = require('../models/ExamSlot');

class Scheduler {
    constructor(globalSettings) {
        this.globalSettings = {
            examDuration: parseInt(globalSettings.exam_duration || 90),
            minExamDays: parseInt(globalSettings.min_exam_days || 5),
            maxExamDays: parseInt(globalSettings.max_exam_days || 10),
            dayStartTime: globalSettings.day_start_time || "09:00",
            dayEndTime: globalSettings.day_end_time || "18:00"
        };

        this.assignedSlots = []; 
        this.failedCourses = []; 
        this.maxExamsPerDay = 2; 
    }
    // core algorithm
    generateSchedule(courses, students, classrooms) {
        console.log("[Scheduler] Generation started...");

        let currentDays = this.globalSettings.minExamDays;
        let success = false;

        courses.sort((a, b) => b.studentCount - a.studentCount);

        while (currentDays <= this.globalSettings.maxExamDays && !success) {
            console.log(`[Scheduler] Iteration: Trying with ${currentDays} days...`);
            
            this.assignedSlots = [];
            this.failedCourses = [];
            
            for (const course of courses) {
                const assigned = this.assignCourseToFirstValidSlot(course, students, classrooms, currentDays);
                if (!assigned) {
                    this.failedCourses.push(course);
                }
            }

            if (this.failedCourses.length > 0) {
                if (currentDays < this.globalSettings.maxExamDays) {
                    console.log("[Scheduler] Expanding schedule window by 1 day...");
                    currentDays++; 
                } else {
                    throw new Error(`Constraint Error: Cannot fit schedule within max ${this.globalSettings.maxExamDays} days.`);
                }
            } else {
                success = true;
            }
        }

        console.log("[Scheduler] Schedule successfully generated.");
        return { slots: this.assignedSlots, usedDays: currentDays };
    }

    assignCourseToFirstValidSlot(course, students, classrooms, totalDays) {
        const dailyStartTimes = this.generateTimeSlots();

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `Day ${day}`;

            for (const time of dailyStartTimes) {
                const validRooms = classrooms.filter(r => r.capacity >= course.studentCount);
                validRooms.sort((a, b) => a.capacity - b.capacity);

                for (const room of validRooms) {
                    if (this.checkConflict(course, time, room, dateStr, students)) {
                        const endTime = this.calculateEndTime(time);
                        const newSlot = new ExamSlot(course.courseCode, room.roomName, dateStr, time, endTime);
                        this.assignedSlots.push(newSlot);
                        return true;
                    }
                }
            }
        }
        return false;
    }


    checkConflict(course, time, room, date, allStudents) {

        if (room.capacity < course.studentCount) {
            return false;
        }

        const roomTaken = this.assignedSlots.some(slot =>
            slot.roomName === room.roomName &&
            slot.date === date &&
            slot.startTime === time
        );

        if (roomTaken) return false;
        const enrolledStudents = allStudents.filter(s => s.enrolledCourses.includes(course.courseCode));

        for (const student of enrolledStudents) {
            
            const hasConcurrency = this.assignedSlots.some(slot =>
                slot.date === date &&
                slot.startTime === time &&
                allStudents.find(s => s.studentId === student.studentId)?.enrolledCourses.includes(slot.courseCode)
            );

            if (hasConcurrency) return false;

            
            if (!this.checkDailyLimit(student, date, allStudents)) {
                return false;
            }

            
            if (!this.checkConsecutiveGap(student, time, date, allStudents)) {
                return false;
            }
        }

        return true;
    }
        //TODO: @emre


    // requirement 7
    checkDailyLimit(student, date, allStudents) {
        // TODO: @emre
        return true;
    }

    // requirement 6
    checkConsecutiveGap(student, newTime, date, allStudents) {
        // TODO: @emre
        return true;
    }

    generateTimeSlots() {
        const slots = [];
        let currentMin = this.parseTime(this.globalSettings.dayStartTime);
        const endMin = this.parseTime(this.globalSettings.dayEndTime);
        const duration = this.globalSettings.examDuration;

        while (currentMin + duration <= endMin) {
            slots.push(this.minutesToTimeStr(currentMin));
            currentMin += duration;
        }
        return slots;
    }

    calculateEndTime(startTime) {
        const totalMinutes = this.parseTime(startTime) + this.globalSettings.examDuration;
        return this.minutesToTimeStr(totalMinutes);
    }

    parseTime(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    minutesToTimeStr(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
}

module.exports = Scheduler;