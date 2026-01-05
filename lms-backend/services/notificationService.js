const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const createTransporter = () => {
  // For development, using ethereal.email (fake SMTP server)
  // In production, replace with real email service like Gmail, SendGrid, etc.
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your_test_email@ethereal.email',
      pass: process.env.EMAIL_PASS || 'your_test_password'
    }
  });
};

// Function to send email notification
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@intellilearn.com',
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Function to create in-app notification
const createNotification = async (userId, title, message, type, courseId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      courseId
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Function to send announcement notification
const sendAnnouncementNotification = async (courseId, announcementTitle) => {
  try {
    // Get all students enrolled in the course
    const course = await Course.findById(courseId).populate('studentsEnrolled');
    
    if (!course) {
      console.error('Course not found');
      return;
    }

    // Send notification to each enrolled student
    for (const studentId of course.studentsEnrolled) {
      const student = await User.findById(studentId);
      
      if (student) {
        // Create in-app notification
        await createNotification(
          studentId,
          'New Announcement',
          `A new announcement has been posted in ${course.title}: ${announcementTitle}`,
          'announcement',
          courseId
        );

        // Send email notification
        await sendEmail(
          student.email,
          `New Announcement in ${course.title}`,
          `Hello ${student.name},

A new announcement has been posted in ${course.title}:
${announcementTitle}

Visit IntelliLearn to view the full announcement.`
        );
      }
    }
  } catch (error) {
    console.error('Error sending announcement notification:', error);
  }
};

// Function to send grade notification
const sendGradeNotification = async (studentId, courseId, assignmentTitle, grade) => {
  try {
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      console.error('Student or course not found');
      return;
    }

    // Create in-app notification
    await createNotification(
      studentId,
      'Grade Update',
      `Your grade for ${assignmentTitle} in ${course.title} has been updated: ${grade}/100`,
      'grade',
      courseId
    );

    // Send email notification
    await sendEmail(
      student.email,
      `Grade Update for ${assignmentTitle}`,
      `Hello ${student.name},

Your grade for ${assignmentTitle} in ${course.title} has been updated:
Grade: ${grade}/100

Visit IntelliLearn to view your grades.`
    );
  } catch (error) {
    console.error('Error sending grade notification:', error);
  }
};

module.exports = {
  sendAnnouncementNotification,
  sendGradeNotification,
  createNotification
};