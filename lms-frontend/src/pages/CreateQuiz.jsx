import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './CreateCourse.css'; // Reuse existing styles

const CreateQuiz = () => {
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
        timeLimit: 15, // minutes
        passingScore: 70
    });

    // State for dynamic questions
    const [questions, setQuestions] = useState([
        {
            question: '',
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        }
    ]);

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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Question Handling
    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].question = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex].text = value;
        setQuestions(newQuestions);
    };

    const handleCorrectOptionSelect = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        // Reset all options for this question to false
        newQuestions[qIndex].options.forEach(opt => opt.isCorrect = false);
        // Set selected to true
        newQuestions[qIndex].options[oIndex].isCorrect = true;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            question: '',
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        }]);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Validate that each question has a correct answer selected
            const isValid = questions.every(q => q.options.some(opt => opt.isCorrect));
            if (!isValid) {
                alert('Please select a correct answer for every question.');
                setSaving(false);
                return;
            }

            const payload = {
                ...formData,
                course: courseId,
                questions
            };

            await axios.post('/api/courses/' + courseId + '/quizzes', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            alert('Quiz created successfully!');
            navigate(`/instructor/dashboard`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create quiz');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="create-course">
            <h1>Create Quiz for: {course.title}</h1>

            <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                    <label>Quiz Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Chapter 1 Review"
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Lesson</label>
                        <select
                            name="lessonIndex"
                            value={formData.lessonIndex}
                            onChange={handleInputChange}
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
                        <label>Time Limit (minutes)</label>
                        <input
                            type="number"
                            name="timeLimit"
                            value={formData.timeLimit}
                            onChange={handleInputChange}
                            min="1"
                        />
                    </div>
                </div>

                <div className="lessons-section">
                    <h2>Questions</h2>
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="lesson-form" style={{ marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label>Question {qIndex + 1}</label>
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                    placeholder="Enter your question here"
                                    required
                                />
                            </div>

                            <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="form-group">
                                        <div className={`option-wrapper ${opt.isCorrect ? 'correct' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`correct-${qIndex}`}
                                                checked={opt.isCorrect}
                                                onChange={() => handleCorrectOptionSelect(qIndex, oIndex)}
                                                title="Mark as correct answer"
                                            />
                                            <input
                                                type="text"
                                                className="option-input"
                                                value={opt.text}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                placeholder={`Option ${oIndex + 1}`}
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => removeQuestion(qIndex)}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Remove Question
                                </button>
                            )}
                        </div>
                    ))}

                    <button type="button" className="btn btn-secondary" onClick={addQuestion}>
                        + Add Question
                    </button>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Creating...' : 'Create Quiz'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuiz;
