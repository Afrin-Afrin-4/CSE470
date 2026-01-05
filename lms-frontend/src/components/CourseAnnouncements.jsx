import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './CourseAnnouncements.css';

const CourseAnnouncements = ({ courseId }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchAnnouncements();
  }, [courseId]);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/announcements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnnouncements(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    setNewAnnouncement({ ...newAnnouncement, title: e.target.value });
  };

  const handleMessageChange = (e) => {
    setNewAnnouncement({ ...newAnnouncement, message: e.target.value });
  };

  const handleSubmitAnnouncement = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`/api/courses/${courseId}/announcements`, newAnnouncement, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add the new announcement to the list
      setAnnouncements([response.data.data, ...announcements]);
      setNewAnnouncement({ title: '', message: '' });
      setShowAnnouncementForm(false);
    } catch (error) {
      console.error('Error submitting announcement:', error);
      alert(error.response?.data?.message || 'Error submitting announcement');
    }
  };

  if (loading) {
    return <div className="course-announcements">Loading announcements...</div>;
  }

  const canCreateAnnouncement = user && (user.role === 'instructor' || user.role === 'admin');

  return (
    <div className="course-announcements">
      <div className="announcements-header">
        <h3>Course Announcements</h3>
        {canCreateAnnouncement && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
          >
            {showAnnouncementForm ? 'Cancel' : 'Create Announcement'}
          </button>
        )}
      </div>

      {showAnnouncementForm && canCreateAnnouncement && (
        <form className="announcement-form" onSubmit={handleSubmitAnnouncement}>
          <div className="announcement-input">
            <label>Announcement Title:</label>
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={handleTitleChange}
              placeholder="Enter announcement title..."
              required
            />
          </div>
          <div className="announcement-input">
            <label>Announcement Message:</label>
            <textarea
              value={newAnnouncement.message}
              onChange={handleMessageChange}
              placeholder="Enter announcement message..."
              rows="4"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Post Announcement</button>
        </form>
      )}

      {announcements.length > 0 ? (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="announcement-item">
              <div className="announcement-header">
                <div className="announcement-title">
                  <h4>{announcement.title}</h4>
                  <span className="announcement-date">
                    {new Date(announcement.createdAt).toLocaleDateString()} by {announcement.instructor.name}
                  </span>
                </div>
              </div>
              <div className="announcement-content">
                {announcement.message}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-announcements">No announcements yet for this course.</p>
      )}
    </div>
  );
};

export default CourseAnnouncements;