import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <img 
        src={course.thumbnail || 'https://via.placeholder.com/300x200/4361ee/ffffff?text=Course+Image'} 
        alt={course.title} 
        className="course-image"
      />
      <div className="course-info">
        <h3>{course.title}</h3>
        <p className="instructor">By {course.instructor?.name}</p>
        <p className="description">{course.description}</p>
        <div className="course-meta">
          <span className="level">{course.level || 'Beginner'}</span>
          <span className="price">${course.price}</span>
          <span className="enrolled">{course.studentsEnrolled?.length || 0} enrolled</span>
        </div>
        <div className="course-rating">
          <span className="rating-stars">
            {'★'.repeat(Math.floor(course.ratingsAverage))}
            {'☆'.repeat(5 - Math.floor(course.ratingsAverage))}
          </span>
          <span className="rating-value">{course.ratingsAverage?.toFixed(1)}</span>
          <span className="rating-count">({course.ratingsQuantity} reviews)</span>
        </div>
        <div className="course-actions">
          <Link to={`/courses/${course._id}`} className="btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;