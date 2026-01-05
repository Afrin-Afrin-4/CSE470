import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ProgressTracker from '../components/ProgressTracker';
import CourseReviews from '../components/CourseReviews';
import CourseAnnouncements from '../components/CourseAnnouncements';
import QuizComponent from '../components/QuizComponent';
import AssignmentSubmission from '../components/AssignmentSubmission';
import CourseDiscussions from '../components/CourseDiscussions';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      const res = await axios.get(`/api/courses/${id}`, isAuthenticated ? config : {});
      setCourse(res.data.data);

      // If user is authenticated, fetch their progress for this course
      if (isAuthenticated) {
        try {
          const progressRes = await axios.get(`/api/progress/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setUserProgress(progressRes.data.data);
        } catch (progressErr) {
          console.log('Could not fetch progress data');
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch course');
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If course has a price > 0, redirect to payment page
    if (course.price > 0) {
      navigate(`/checkout/${id}`);
      return;
    }

    // For free courses, enroll directly
    try {
      setEnrolling(true);
      await axios.put(`/api/courses/${id}/enroll`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh course data
      fetchCourse();
      alert('Successfully enrolled in the course!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to enroll in course';
      alert(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };


  // Function to handle lesson completion
  const handleLessonCompletion = async (lessonId) => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    try {
      await axios.put(`/api/progress/${id}/lessons/${lessonId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh progress data
      const progressRes = await axios.get(`/api/progress/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserProgress(progressRes.data.data);
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
    }
  };

  // Function to render video content based on URL with better error handling and fallbacks
  const renderVideo = (videoUrl) => {
    if (!videoUrl) return null;

    // Check if it's a YouTube URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Extract YouTube video ID with more robust pattern matching
      let videoId = '';

      // Match different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
        /youtube\.com\/attribution_link\?.*v=([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
      ];

      for (const pattern of patterns) {
        const match = videoUrl.match(pattern);
        if (match) {
          videoId = match[1];
          break;
        }
      }

      if (videoId) {
        // Clean up the video ID in case it has extra characters
        videoId = videoId.split('&')[0].split('?')[0].split('%')[0].trim();

        // Validate video ID format (YouTube IDs are 11 characters)
        if (videoId.length >= 11) {
          // Take only the first 11 characters to handle any extra parameters
          videoId = videoId.substring(0, 11);
        }

        const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1&enablejsapi=1`;

        return (
          <div className="video-container">
            <iframe
              width="100%"
              height="400"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={(e) => {
                console.error('Video failed to load:', videoUrl);
              }}
            ></iframe>
            <div className="video-fallback">
              <p>Having trouble viewing the video?</p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <i className="fas fa-external-link-alt"></i> Open in YouTube
              </a>
            </div>
          </div>
        );
      }
    }

    // For other video types, try to render as video element
    return (
      <div className="video-container">
        <video controls width="100%" height="400">
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
          <p>Video URL: <a href={videoUrl} target="_blank" rel="noopener noreferrer">Click to open video</a></p>
        </video>
        <div className="video-fallback">
          <p>Having trouble viewing the video?</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <i className="fas fa-external-link-alt"></i> Open Video in New Tab
          </a>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="course-detail">
      <div className="loading-spinner">Loading course details...</div>
    </div>;
  }

  if (error) {
    return <div className="course-detail">
      <div className="error-message">Error: {error}</div>
    </div>;
  }

  const isEnrolled = user && course?.studentsEnrolled?.some(studentId => studentId.toString() === user._id);
  const canEnroll = isAuthenticated && !isEnrolled && course?.instructor?._id !== user._id;
  const canAccessContent = isEnrolled || (user && course?.instructor?._id === user._id);

  // Determine which lesson to continue with based on progress
  const getNextLessonIndex = () => {
    if (!userProgress || !userProgress.completedLessons || !course?.lessons) return 0;

    for (let i = 0; i < course.lessons.length; i++) {
      if (!userProgress.completedLessons.includes(course.lessons[i]._id?.toString())) {
        return i;
      }
    }
    // If all lessons are completed, return the last index
    return course.lessons.length - 1;
  };

  const nextLessonIndex = getNextLessonIndex();

  return (
    <div className="course-detail">
      <div className="course-header">
        <img
          src={course.thumbnail || `https://source.unsplash.com/800x400/?education,learning,${course.title.replace(/\s+/g, '-')}`}
          alt={course.title}
          className="course-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://via.placeholder.com/800x400/4361ee/ffffff?text=${encodeURIComponent(course.title.substring(0, 30))}`;
          }}
        />
        <div className="course-info">
          <h1>{course.title}</h1>
          <p className="instructor">
            <i className="fas fa-user-graduate"></i>
            By {course.instructor?.name}
          </p>
          <p className="course-description">{course.description}</p>

          <div className="course-meta">
            <span className="level">
              <i className="fas fa-graduation-cap"></i>
              {course.level || 'Beginner'}
            </span>
            <span className="price">
              <i className="fas fa-tag"></i>
              ${course.price || 0}
            </span>
            <span className="enrolled">
              <i className="fas fa-users"></i>
              {course.studentsEnrolled?.length || 0} students
            </span>
          </div>

          <div className="course-rating">
            <span className="rating-stars">
              {'★'.repeat(Math.floor(course.ratingsAverage))}
              {'☆'.repeat(5 - Math.floor(course.ratingsAverage))}
            </span>
            <span className="rating-value">{course.ratingsAverage?.toFixed(1) || 'No ratings'}</span>
            <span className="rating-count">({course.ratingsQuantity} reviews)</span>
          </div>

          <div className="course-actions">
            {canEnroll ? (
              <button className="btn" onClick={handleEnroll} disabled={enrolling}>
                <i className="fas fa-graduation-cap"></i> {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            ) : isEnrolled ? (
              <button className="btn btn-enrolled" onClick={() => {
                // Scroll to the next lesson to continue with
                const lessonElement = document.getElementById(`lesson-${nextLessonIndex}`);
                if (lessonElement) {
                  lessonElement.scrollIntoView({ behavior: 'smooth' });
                  lessonElement.focus();
                }
              }}>
                <i className="fas fa-play-circle"></i> Continue Learning
              </button>
            ) : (
              <button className="btn btn-outline" onClick={() => navigate('/login')}>
                <i className="fas fa-sign-in-alt"></i> Login to Enroll
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="course-tabs">
        <button
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Course Content
        </button>
        <button
          className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </button>
        <button
          className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussions')}
        >
          Discussions
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {activeTab === 'content' && (
        <div className="course-content">
          <div className="course-sections">
            <div className="course-section">
              <h2>Course Content</h2>
              <div className="lessons-list">
                {course.lessons?.length > 0 ? (
                  course.lessons.map((lesson, index) => {
                    const isCompleted = userProgress?.completedLessons?.includes(lesson._id?.toString());
                    const isNextLesson = index === nextLessonIndex && isEnrolled;

                    return (
                      <div
                        key={lesson._id || index}
                        className={`lesson-item ${isCompleted ? 'completed' : ''} ${isNextLesson ? 'next-lesson' : ''}`}
                        id={`lesson-${index}`}
                      >
                        <div className="lesson-header">
                          <h3>
                            <i className={`fas ${isCompleted ? 'fa-check-circle completed-icon' : 'fa-play-circle'}`}></i>
                            {index + 1}. {lesson.title}
                            {isCompleted && <span className="completed-badge">Completed</span>}
                            {isNextLesson && isEnrolled && <span className="next-badge">Continue Here</span>}
                          </h3>
                          <div className="lesson-completion">
                            <button
                              className={`lesson-complete-btn ${isCompleted ? 'completed' : ''}`}
                              onClick={() => handleLessonCompletion(lesson._id)}
                              disabled={!isEnrolled}
                              title={isCompleted ? 'Lesson completed' : 'Mark as completed'}
                            >
                              {isCompleted ? (
                                <i className="fas fa-check"></i>
                              ) : (
                                <i className="fas fa-plus"></i>
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="lesson-description">{lesson.description}</p>

                        {lesson.videoUrl && (
                          <div className="lesson-video">
                            <h4><i className="fas fa-video"></i> Lesson Video</h4>
                            {renderVideo(lesson.videoUrl)}
                          </div>
                        )}

                        {lesson.duration && (
                          <p><i className="fas fa-clock"></i> Duration: {lesson.duration}</p>
                        )}

                        {/* Add quiz and assignment components for each lesson if user is enrolled */}
                        {canAccessContent && (
                          <div className="lesson-components">
                            <QuizComponent
                              courseId={id}
                              lessonIndex={index}
                            />
                            <AssignmentSubmission
                              courseId={id}
                              lessonIndex={index}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p>No lessons available for this course yet.</p>
                )}
              </div>
            </div>
          </div>

          {canAccessContent && userProgress && (
            <div className="progress-section">
              <h2>Your Progress</h2>
              <ProgressTracker courseId={id} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && <CourseAnnouncements courseId={id} />}
      {activeTab === 'discussions' && <CourseDiscussions courseId={id} />}
      {activeTab === 'reviews' && <CourseReviews courseId={id} />}
    </div>
  );
};

export default CourseDetail;