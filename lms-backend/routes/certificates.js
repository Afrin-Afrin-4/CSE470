const express = require('express');
const { 
  generateCertificate,
  getMyCertificates,
  getCourseCertificates,
  downloadCertificate
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Route for generating certificate for a specific course
router.route('/my')
  .get(protect, getMyCertificates);

// Route for getting certificates for a specific course
router.route('/course/:courseId')
  .get(protect, authorize('instructor', 'admin'), getCourseCertificates);

// Route for downloading a specific certificate
router.route('/:certificateId/download')
  .get(protect, downloadCertificate);

// Route for generating certificate for a specific course (nested under courses)
router.route('/')
  .post(protect, generateCertificate);

module.exports = router;