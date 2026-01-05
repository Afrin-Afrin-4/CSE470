import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../pages/CourseDetail.css'; // Correct path to CSS

const CourseDiscussions = ({ courseId }) => {
    const { user } = useContext(AuthContext);
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState({ title: '', message: '' });
    const [replyText, setReplyText] = useState({}); // Map of discussion Id -> reply text
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDiscussions();
    }, [courseId]);

    const fetchDiscussions = async () => {
        try {
            const res = await axios.get(`/api/courses/${courseId}/discussions`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDiscussions(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handlePostQuestion = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`/api/courses/${courseId}/discussions`, {
                title: newQuestion.title,
                content: newQuestion.message // Map message input to content field
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNewQuestion({ title: '', message: '' });
            fetchDiscussions(); // Refresh list
            alert('Question posted successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to post question');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePostReply = async (discussionId) => {
        if (!replyText[discussionId]) return;
        try {
            await axios.put(`/api/discussions/${discussionId}/reply`,
                { content: replyText[discussionId] },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setReplyText({ ...replyText, [discussionId]: '' });
            fetchDiscussions();
        } catch (err) {
            console.error(err);
            alert('Failed to post reply');
        }
    };

    return (
        <div className="course-discussions">
            <h3>Course Discussions & Queries</h3>

            {/* Ask Question Form */}
            <div className="ask-question-form" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                <h4>Ask a Question</h4>
                <form onSubmit={handlePostQuestion}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Topic / Title"
                            value={newQuestion.title}
                            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            placeholder="What would you like to ask?"
                            value={newQuestion.message}
                            onChange={(e) => setNewQuestion({ ...newQuestion, message: e.target.value })}
                            required
                            rows="3"
                            style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post Question'}
                    </button>
                </form>
            </div>

            {/* Discussion List */}
            {loading ? (
                <p>Loading discussions...</p>
            ) : discussions.length === 0 ? (
                <p>No discussions yet. Be the first to ask!</p>
            ) : (
                <div className="discussions-list">
                    {discussions.map((discussion) => (
                        <div key={discussion._id} className="discussion-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="discussion-header" style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{discussion.title}</h4>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    <span>Posted by: {discussion.user?.name || 'Unknown'}</span>
                                    <span style={{ margin: '0 0.5rem' }}>•</span>
                                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <p className="discussion-message" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>{discussion.content}</p>

                            {/* Replies */}
                            <div className="replies-section" style={{ marginLeft: '1.5rem', borderLeft: '3px solid #e2e8f0', paddingLeft: '1rem' }}>
                                {discussion.replies && discussion.replies.map((reply) => (
                                    <div key={reply._id} className="reply-item" style={{ marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '4px' }}>
                                        <div className="reply-header" style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                                            {reply.user?.name}
                                            {reply.user?.role === 'instructor' && <span style={{ marginLeft: '0.5rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Instructor</span>}
                                        </div>
                                        <div className="reply-content">{reply.content}</div>
                                    </div>
                                ))}

                                {/* Reply Input */}
                                <div className="reply-input-container" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Write a reply..."
                                        value={replyText[discussion._id] || ''}
                                        onChange={(e) => setReplyText({ ...replyText, [discussion._id]: e.target.value })}
                                        style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                    />
                                    <button
                                        onClick={() => handlePostReply(discussion._id)}
                                        className="btn btn-small btn-secondary"
                                        disabled={!replyText[discussion._id]}
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseDiscussions;
