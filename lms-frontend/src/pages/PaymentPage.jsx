import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './PaymentPage.css';

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [bkashNumber, setBkashNumber] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCourse();
  }, [courseId, isAuthenticated]);

  const fetchCourse = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      const res = await axios.get(`/api/courses/${courseId}`, isAuthenticated ? config : {});
      setCourse(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert(err.response?.data?.message || 'Failed to fetch course');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simple validation for card payment
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName) {
        alert('Please fill in all card details');
        setProcessing(false);
        return;
      }

      // Basic card number validation (16 digits)
      const cardNumberClean = cardDetails.cardNumber.replace(/\s/g, '');
      if (cardNumberClean.length !== 16) {
        alert('Please enter a valid 16-digit card number');
        setProcessing(false);
        return;
      }
    }

    // Validation for bKash
    if (paymentMethod === 'bkash') {
      if (bkashNumber !== '01568981336') {
        alert('For this demo, please use the test number: 01568981336');
        setProcessing(false);
        return;
      }
    }

    try {
      // Process payment and enroll
      if (paymentMethod === 'points') {
        await axios.post('/api/payments/redeem-points', {
          courseId
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert(`Payment successful! Enrolled using ${course.price * 10} badge points.`);
      } else {
        await axios.post('/api/payments/simple-process', {
          courseId,
          paymentMethod,
          amount: course.price
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('Payment successful! You are now enrolled in the course.');
      }
      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Payment failed. Please try again.';
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="payment-page">
        <div className="payment-error">Course not found.</div>
      </div>
    );
  }

  // Check if course is free
  if (course.price <= 0) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-header">
            <h1>🎓 Enroll in Course</h1>
          </div>
          <div className="course-summary">
            <img
              src={course.thumbnail || 'https://via.placeholder.com/300x200/4361ee/ffffff?text=Course'}
              alt={course.title}
              className="course-thumbnail"
            />
            <div className="course-details">
              <h2>{course.title}</h2>
              <p className="course-price free">FREE</p>
              <p className="course-instructor">By {course.instructor?.name}</p>
            </div>
          </div>
          <button
            className="btn btn-primary btn-enroll-free"
            onClick={async () => {
              try {
                setProcessing(true);
                await axios.put(`/api/courses/${courseId}/enroll`, {}, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
                alert('Successfully enrolled in the course!');
                navigate(`/courses/${courseId}`);
              } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Failed to enroll. Please try again.');
              } finally {
                setProcessing(false);
              }
            }}
            disabled={processing}
          >
            {processing ? 'Enrolling...' : 'Enroll Now - Free'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>💳 Complete Your Purchase</h1>
          <p>Secure payment for course enrollment</p>
        </div>

        <div className="payment-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="course-summary">
              <img
                src={course.thumbnail || 'https://via.placeholder.com/300x200/4361ee/ffffff?text=Course'}
                alt={course.title}
                className="course-thumbnail"
              />
              <div className="course-details">
                <h3>{course.title}</h3>
                <p className="course-instructor">By {course.instructor?.name}</p>
                <p className="course-level">{course.level}</p>
              </div>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Course Price</span>
                <span>${course.price.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>${course.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="payment-form">
            <h2>Payment Details</h2>

            <div className="payment-methods">
              <label className={`payment-method ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">💳</span>
                <span>Credit/Debit Card</span>
              </label>

              <label className={`payment-method ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">🅿️</span>
                <span>PayPal</span>
              </label>

              <label className={`payment-method ${paymentMethod === 'bkash' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={paymentMethod === 'bkash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">📱</span>
                <span>bKash</span>
              </label>

              <label className={`payment-method ${paymentMethod === 'points' ? 'selected' : ''} ${user?.badgePoints < (course.price * 10) ? 'disabled' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="points"
                  checked={paymentMethod === 'points'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={user?.badgePoints < (course.price * 10)}
                />
                <span className="method-icon">🏅</span>
                <span>Badge Points ({user?.badgePoints || 0} available)</span>
              </label>
            </div>

            {paymentMethod === 'credit_card' && (
              <div className="card-details">
                <div className="form-group">
                  <label htmlFor="cardName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails(prev => ({
                      ...prev,
                      cardNumber: formatCardNumber(e.target.value)
                    }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={(e) => setCardDetails(prev => ({
                        ...prev,
                        expiryDate: formatExpiryDate(e.target.value)
                      }))}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({
                        ...prev,
                        cvv: e.target.value.replace(/\D/g, '').substring(0, 4)
                      }))}
                      placeholder="123"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="alternative-payment">
                <p>You will be redirected to PayPal to complete your payment.</p>
              </div>
            )}

            {paymentMethod === 'bkash' && (
              <div className="alternative-payment">
                <div className="form-group">
                  <label htmlFor="bkashNumber">bKash Number</label>
                  <input
                    type="text"
                    id="bkashNumber"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    maxLength="11"
                  />
                </div>
                <p>You will receive a payment confirmation request on your bKash app.</p>
              </div>
            )}

            {paymentMethod === 'points' && (
              <div className="alternative-payment points-payment">
                <p>You are using <strong>{course.price * 10}</strong> badge points to enroll.</p>
                <p>Remaining balance after purchase: <strong>{user.badgePoints - (course.price * 10)}</strong> points.</p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-pay"
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay $${course.price.toFixed(2)}`
              )}
            </button>

            <div className="security-info">
              <span className="lock-icon">🔒</span>
              <span>Your payment information is secure and encrypted</span>
            </div>
          </form>
        </div>

        <button
          className="btn btn-outline btn-back"
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          ← Back to Course
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;