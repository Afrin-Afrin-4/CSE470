import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './CreateCourse.css';

const CreateAssignment = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        lessonIndex: 0,
        dueDate: ''
    });

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const res = await axios.get(`/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCourse(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch course details');
            navigate('/instructor/dashboard');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.post(`/api/courses/${courseId}/assignments`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            alert('Assignment created successfully!');
            navigate('/instructor/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create assignment');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="create-course">
            <h1>Create Assignment for: {course.title}</h1>

            <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                    <label>Assignment Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Final Project Submission"
                    />
                </div>

                <div className="form-group">
                    <label>Description / Instructions</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        required
                        placeholder="Detailed instructions for the student..."
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Link to Lesson</label>
                        <select
                            name="lessonIndex"
                            value={formData.lessonIndex}
                            onChange={handleChange}
                            required
                        >
                            {course.lessons && course.lessons.map((lesson, idx) => (
                                <option key={idx} value={idx}>
                                    Lesson {idx + 1}: {lesson.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Due Date</label>
                        <input
                            type="datetime-local"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Creating...' : 'Create Assignment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAssignment;
