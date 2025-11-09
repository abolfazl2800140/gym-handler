const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// GET all attendance records
router.get('/', attendanceController.getAllAttendance);

// GET attendance by date
router.get('/date/:date', attendanceController.getAttendanceByDate);

// POST create or update attendance
router.post('/', attendanceController.saveAttendance);

// DELETE attendance
router.delete('/date/:date', attendanceController.deleteAttendance);

// GET attendance statistics
router.get('/stats/summary', attendanceController.getAttendanceStats);

// GET member attendance report
router.get('/stats/members', attendanceController.getMemberAttendanceReport);

module.exports = router;
