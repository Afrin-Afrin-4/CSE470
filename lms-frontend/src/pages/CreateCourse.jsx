import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './CreateCourse.css';

const CreateCourse = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    level: 'beginner',
    thumbnail: '',
    isPublished: false
  });
  
  const [lessons, setLessons] = useState([{ title: '', description: '', videoUrl: '', duration: '' }]);
  const [loading, setLoading] = useState(false);

  const { title, description, category, price, level, thumbnail, isPublished } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleLessonChange = (index, e) => {
    const newLessons = [...lessons];
    newLessons[index][e.target.name] = e.target.value;
    setLessons(newLessons);
  };

  const addLesson = () => {
    setLessons([...lessons, { title: '', description: '', videoUrl: '', duration: '' }]);
  };

  const removeLesson = (index) => {
    if (lessons.length > 1) {
      const newLessons = lessons.filter((_, i) => i !== index);
      setLessons(newLessons);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const courseData = {
        ...formData,
        lessons: lessons.filter(lesson => lesson.title || lesson.description),
        instructor: user._id
      };
      
      await axios.post('/api/courses', courseData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      alert('Course created successfully!');
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course">
      <h1>Create New Course</h1>
      
      <form onSubmit={onSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={category}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={price}
              onChange={onChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="level">Level</label>
            <select
              id="level"
              name="level"
              value={level}
              onChange={onChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="thumbnail">Thumbnail URL</label>
            <input
              type="text"
              id="thumbnail"
              name="thumbnail"
              value={thumbnail}
              onChange={onChange}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="isPublished">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={isPublished}
              onChange={onCheckboxChange}
            /> Publish this course
          </label>
        </div>
        
        <div className="lessons-section">
          <h2>Lessons</h2>
          {lessons.map((lesson, index) => (
            <div key={index} className="lesson-form">
              <h3>Lesson {index + 1}</h3>
              <div className="form-group">
                <label htmlFor={`title-${index}`}>Lesson Title</label>
                <input
                  type="text"
                  id={`title-${index}`}
                  name="title"
                  value={lesson.title}
                  onChange={(e) => handleLessonChange(index, e)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor={`description-${index}`}>Description</label>
                <textarea
                  id={`description-${index}`}
                  name="description"
                  value={lesson.description}
                  onChange={(e) => handleLessonChange(index, e)}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`videoUrl-${index}`}>Video URL</label>
                  <input
                    type="text"
                    id={`videoUrl-${index}`}
                    name="videoUrl"
                    value={lesson.videoUrl}
                    onChange={(e) => handleLessonChange(index, e)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`duration-${index}`}>Duration (e.g., 10:30)</label>
                  <input
                    type="text"
                    id={`duration-${index}`}
                    name="duration"
                    value={lesson.duration}
                    onChange={(e) => handleLessonChange(index, e)}
                  />
                </div>
              </div>
              
              {lessons.length > 1 && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => removeLesson(index)}
                >
                  Remove Lesson
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="btn btn-secondary" onClick={addLesson}>
            Add Another Lesson
          </button>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/instructor/dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;