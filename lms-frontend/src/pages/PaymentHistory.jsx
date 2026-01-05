import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const res = await axios.get('/api/payments/history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPayments(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'refunded':
        return 'status-refunded';
      default:
        return '';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'paypal':
        return 'PayPal';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'crypto':
        return 'Cryptocurrency';
      default:
        return method;
    }
  };

  if (loading) {
    return <div className="payment-history">Loading payment history...</div>;
  }

  return (
    <div className="payment-history">
      <h1>Payment History</h1>
      <p>View your course purchase history and payment details.</p>
      
      {payments.length > 0 ? (
        <div className="payments-list">
          {payments.map((payment) => (
            <div key={payment._id} className="payment-card">
              <div className="payment-header">
                <h3>{payment.course?.title || 'Unknown Course'}</h3>
                <span className={`status-badge ${getStatusClass(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">${payment.amount}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Payment Method:</span>
                  <span className="value">{getPaymentMethodLabel(payment.paymentMethod)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{payment.transactionId}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">
                    {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                    {new Date(payment.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                
                {payment.refundedAt && (
                  <div className="detail-row">
                    <span className="label">Refunded:</span>
                    <span className="value">
                      {new Date(payment.refundedAt).toLocaleDateString()} at{' '}
                      {new Date(payment.refundedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-payments">
          <p>You haven't made any payments yet.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;