const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Generate a certificate for a completed course
// @route   POST /api/courses/:courseId/certificates
// @access  Private (Student)
const generateCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check if user has completed the course (100% progress)
  const progress = await Progress.findOne({ 
    user: req.user.id, 
    course: courseId 
  });

  if (!progress || progress.completionPercentage < 100) {
    res.status(400);
    throw new Error('Cannot generate certificate for incomplete course');
  }

  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({
    user: req.user.id,
    course: courseId
  });

  if (existingCertificate) {
    res.status(200).json({
      success: true,
      data: existingCertificate
    });
    return;
  }

  // Generate a unique certificate ID
  const certificateId = `CERT-${Date.now()}-${req.user.id.substring(0, 8)}`;

  // Create a certificate document
  // The actual PDF generation will happen separately
  const certificate = await Certificate.create({
    user: req.user.id,
    course: courseId,
    certificateUrl: `/api/certificates/${certificateId}/download`,
    issuedAt: Date.now(),
    certificateId
  });

  res.status(201).json({
    success: true,
    data: certificate
  });
});

// @desc    Get all certificates for a user
// @route   GET /api/certificates/my
// @access  Private (Student)
const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user.id })
    .populate('course', 'title description')
    .sort({ issuedAt: -1 });

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});

// @desc    Get all certificates for a course
// @route   GET /api/courses/:courseId/certificates
// @access  Private (Instructor/Admin)
const getCourseCertificates = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check if user is the course instructor or admin
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to view certificates for this course');
  }

  const certificates = await Certificate.find({ course: courseId })
    .populate('user', 'name email')
    .sort({ issuedAt: -1 });

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});

// @desc    Download certificate (PDF generation)
// @route   GET /api/certificates/:certificateId/download
// @access  Private (Owner, Instructor, Admin)
const downloadCertificate = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({ certificateId })
    .populate('user course');

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  // Check if user is the certificate owner, course instructor, or admin
  const isOwner = certificate.user._id.toString() === req.user.id;
  const isCourseInstructor = certificate.course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isCourseInstructor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to download this certificate');
  }

  // Generate PDF certificate
  const PDFDocument = require('pdfkit');
  const fs = require('fs-extra');
  
  // Create temporary directory if it doesn't exist
  const tempDir = 'temp';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  // Create PDF file name
  const fileName = `certificate_${certificateId}.pdf`;
  const filePath = `${tempDir}/${fileName}`;
  
  // Create a new PDF document
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  // Pipe the PDF to a file
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);
  
  // Draw the certificate
  const width = doc.page.width;
  const height = doc.page.height;
  
  // Draw border
  doc.rect(20, 20, width - 40, height - 40).stroke();
  doc.rect(30, 30, width - 60, height - 60).stroke();
  
  // Add certificate title
  doc.fontSize(24).text('Certificate of Completion', width / 2, 100, { align: 'center' });
  
  // Add subtitle
  doc.fontSize(16).text('This is to certify that', width / 2, 150, { align: 'center' });
  
  // Add student name
  doc.fontSize(20).font('Helvetica-Bold').text(certificate.user.name, width / 2, 180, { align: 'center' });
  
  // Add course completion text
  doc.fontSize(16).font('Helvetica').text('has completed the course', width / 2, 220, { align: 'center' });
  
  // Add course title
  doc.fontSize(18).font('Helvetica-Bold').text(certificate.course.title, width / 2, 250, { align: 'center' });
  
  // Add instructor name
  doc.fontSize(14).text(`Instructor: ${certificate.course.instructor.name}`, width / 2, 300, { align: 'center' });
  
  // Add date of completion
  doc.fontSize(14).text(`Date: ${certificate.issuedAt.toLocaleDateString()}`, width / 2, 330, { align: 'center' });
  
  // Add certificate ID
  doc.fontSize(12).text(`Certificate ID: ${certificate.certificateId}`, width / 2, 360, { align: 'center' });
  
  // Add decorative elements
  doc.moveTo(50, 400).lineTo(width - 50, 400).stroke();
  
  // Add signature lines
  doc.fontSize(12).text('Instructor Signature', 100, 420, { align: 'center' });
  doc.text('Student Signature', width - 100, 420, { align: 'center' });
  
  // Finalize the PDF and end
  doc.end();
  
  // Wait for the file to be written
  writeStream.on('finish', () => {
    // Set headers for PDF download
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.course.title.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Stream the PDF file to the response
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    
    // Delete the temporary file after download
    readStream.on('close', () => {
      fs.unlinkSync(filePath);
    });
  });
  
  writeStream.on('error', (err) => {
    console.error('Error creating PDF:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating certificate'
    });
  });
});

module.exports = {
  generateCertificate,
  getMyCertificates,
  getCourseCertificates,
  downloadCertificate
};