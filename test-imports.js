try {
    console.log('Testing imports...');
    require('./lms-backend/routes/auth');
    console.log('Auth routes OK');
    require('./lms-backend/routes/courses');
    console.log('Course routes OK');
    require('./lms-backend/routes/users');
    console.log('User routes OK');
    require('./lms-backend/routes/progress');
    console.log('Progress routes OK');
    require('./lms-backend/routes/submissions');
    console.log('Submissions routes OK');
    require('./lms-backend/routes/attendance');
    console.log('Attendance routes OK');
    require('./lms-backend/routes/reports');
    console.log('Reports routes OK');
    require('./lms-backend/routes/payments');
    console.log('Payments routes OK');
    require('./lms-backend/routes/notifications');
    console.log('Notifications routes OK');
    require('./lms-backend/routes/categories');
    console.log('Categories routes OK');
    require('./lms-backend/routes/badges');
    console.log('Badges routes OK');
    require('./lms-backend/routes/certificates');
    console.log('Certificates routes OK');
    require('./lms-backend/routes/reviews');
    console.log('Reviews routes OK');
    require('./lms-backend/routes/quizzes');
    console.log('Quizzes routes OK');
    require('./lms-backend/routes/assignments');
    console.log('Assignments routes OK');
    console.log('All imports OK!');
} catch (err) {
    console.error('Import failed:');
    console.error(err);
    process.exit(1);
}
