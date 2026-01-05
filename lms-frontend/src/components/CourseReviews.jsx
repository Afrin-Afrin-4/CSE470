import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StarRating from './StarRating';
import './CourseReviews.css';

const CourseReviews = ({ courseId }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, review: '' });
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchReviewsAndEnrollmentStatus();
  }, [courseId]);
  
  const fetchReviewsAndEnrollmentStatus = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`);
      const course = response.data.data;
      
      // Check if current user is enrolled
      if (isAuthenticated && user) {
        const enrolled = course.studentsEnrolled?.some(studentId => 
          studentId.toString() === user._id
        );
        setIsEnrolled(enrolled);
      }
      
      const reviewsResponse = await axios.get(`/api/courses/${courseId}/reviews`);
      setReviews(reviewsResponse.data.data);
      setLoading(false);
      
      // Check if current user has already reviewed
      if (isAuthenticated && user) {
        const hasReviewed = reviewsResponse.data.data.some(review => 
          review.user._id === user._id
        );
        setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/reviews`);
      setReviews(response.data.data);
      setLoading(false);
      
      // Check if current user has already reviewed
      if (isAuthenticated && user) {
        const hasReviewed = response.data.data.some(review => 
          review.user._id === user._id
        );
        setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, review: e.target.value });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`/api/courses/${courseId}/reviews`, newReview, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add the new review to the list
      setReviews([response.data.data, ...reviews]);
      setNewReview({ rating: 0, review: '' });
      setShowReviewForm(false);
      setUserHasReviewed(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Error submitting review');
    }
  };

  if (loading) {
    return <div className="course-reviews">Loading reviews...</div>;
  }

  return (
    <div className="course-reviews">
      <div className="reviews-header">
        <h3>Course Reviews ({reviews.length})</h3>
        {isAuthenticated && user && (
          isEnrolled ? (
            !userHasReviewed ? (
              <button 
                className="btn btn-primary"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                disabled
                title="You have already reviewed this course"
              >
                Reviewed
              </button>
            )
          ) : (
            <button 
              className="btn btn-primary"
              disabled
              title="You must be enrolled in this course to review it"
            >
              Enroll to Review
            </button>
          )
        )}
      </div>

      {showReviewForm && isAuthenticated && user && isEnrolled && !userHasReviewed && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="rating-input">
            <label>Your Rating:</label>
            <StarRating 
              rating={newReview.rating} 
              onRatingChange={handleRatingChange} 
              size="large"
            />
          </div>
          <div className="review-input">
            <label>Your Review:</label>
            <textarea
              value={newReview.review}
              onChange={handleReviewChange}
              placeholder="Share your experience with this course..."
              rows="4"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Submit Review</button>
        </form>
      )}

      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.user.name}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <StarRating rating={review.rating} readonly size="small" />
              </div>
              {review.review && (
                <div className="review-text">
                  {review.review}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-reviews">No reviews yet. Be the first to review this course!</p>
      )}
    </div>
  );
};

export default CourseReviews;