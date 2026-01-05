import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './CertificateGenerator.css';

const CertificateGenerator = ({ courseId, progress }) => {
  const { user } = useContext(AuthContext);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canGenerateCertificate = progress && progress.completionPercentage === 100;

  const handleGenerateCertificate = async () => {
    if (!canGenerateCertificate) {
      setError('You must complete 100% of the course to generate a certificate');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/api/courses/${courseId}/certificates`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setCertificate(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;

    try {
      // Download the certificate by redirecting to the download endpoint
      window.open(`/api/certificates/${certificate.certificateId}/download`, '_blank');
    } catch (err) {
      setError('Failed to download certificate');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="certificate-generator">
      <h3>Certificate</h3>
      
      {!canGenerateCertificate ? (
        <div className="certificate-incomplete">
          <p>Complete 100% of the course to earn a certificate.</p>
          <p>Your progress: {progress?.completionPercentage || 0}%</p>
        </div>
      ) : certificate ? (
        <div className="certificate-available">
          <p>Congratulations! You have earned a certificate.</p>
          <button className="btn btn-primary" onClick={handleDownloadCertificate}>
            Download Certificate
          </button>
        </div>
      ) : (
        <div className="certificate-action">
          <p>You have completed this course! Generate your certificate.</p>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerateCertificate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Certificate'}
          </button>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default CertificateGenerator;