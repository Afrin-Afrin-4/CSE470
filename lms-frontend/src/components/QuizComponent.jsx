import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuizComponent.css';

const QuizComponent = ({ courseId, lessonIndex }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [courseId, lessonIndex]);

  useEffect(() => {
    // Timer effect
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleSubmitQuiz(); // Auto-submit when time runs out
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}/quizzes/lesson/${lessonIndex}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.data && response.data.data.length > 0) {
        const quizData = response.data.data[0]; // Get the first quiz for this lesson
        setQuiz(quizData);

        // Initialize answers state
        const initialAnswers = {};
        quizData.questions.forEach((_, idx) => {
          initialAnswers[idx] = null;
        });
        setAnswers(initialAnswers);

        // Set up timer if applicable
        if (quizData.timeLimit && quizData.timeLimit > 0) {
          setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
          setTimerActive(true);
        }
      } else {
        setQuiz(null); // No quiz for this lesson
      }

      setLoading(false);
      setError(null); // Clear any previous errors
    } catch (err) {
      // If the error is 404 (no quiz found), it's not really an error - just no quiz exists
      if (err.response?.status === 404) {
        setQuiz(null);
        setError(null); // Don't show error for missing quiz
      } else {
        setError(err.response?.data?.message || 'Failed to fetch quiz');
      }
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (!quizSubmitted) {
      setAnswers(prev => ({
        ...prev,
        [questionIndex]: optionIndex
      }));
    }
  };

  const handleSubmitQuiz = async () => {
    if (quizSubmitted) return;

    try {
      // Calculate time taken
      const totalTimeLimit = quiz.timeLimit * 60;
      const timeTaken = totalTimeLimit - timeLeft;

      const response = await axios.post(`/api/quizzes/${quiz._id}/attempt`, {
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption
        })),
        timeTaken
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setQuizResult(response.data.data);
      setQuizSubmitted(true);
      setTimerActive(false); // Stop the timer
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    }
  };

  if (loading) {
    return <div className="quiz-component">Loading quiz...</div>;
  }

  if (error) {
    // Only show error if it's not a "no quiz found" situation
    return <div className="quiz-component">Error: {error}</div>;
  }

  if (!quiz) {
    return null; // Don't render anything if there's no quiz for this lesson
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="quiz-component">
      <div className="quiz-header">
        <h3>{quiz.title}</h3>
        {quiz.timeLimit > 0 && (
          <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {quiz.description && (
        <p className="quiz-description">{quiz.description}</p>
      )}

      <div className="questions-container">
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="question">
            <h4>Question {qIndex + 1}: {question.question}</h4>
            <div className="options">
              {question.options.map((option, oIndex) => (
                <label
                  key={oIndex}
                  className={`option ${quizSubmitted
                    ? option.isCorrect
                      ? 'correct-answer'
                      : answers[qIndex] === oIndex
                        ? 'wrong-answer'
                        : ''
                    : ''
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    checked={answers[qIndex] === oIndex}
                    onChange={() => handleAnswerSelect(qIndex, oIndex)}
                    disabled={quizSubmitted}
                  />
                  <span className="option-text">{option.text}</span>
                  {quizSubmitted && option.isCorrect && (
                    <span className="feedback-icon">✓ Correct Answer</span>
                  )}
                  {quizSubmitted && !option.isCorrect && answers[qIndex] === oIndex && (
                    <span className="feedback-icon">✗ Your Answer</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!quizSubmitted && (
        <button
          className="btn btn-primary submit-btn"
          onClick={handleSubmitQuiz}
          disabled={Object.values(answers).some(answer => answer === null)}
        >
          Submit Quiz
        </button>
      )}

      {quizSubmitted && quizResult && (
        <div className="quiz-result-card">
          <div className={`result-header ${quizResult.percentage >= 70 ? 'pass' : 'fail'}`}>
            <h4>{quizResult.percentage >= 70 ? '🎉 Congratulations! You Passed!' : '📚 Keep Studying, Try Again!'}</h4>
          </div>
          <div className="result-stats">
            <div className="stat-item">
              <span className="label">Score</span>
              <span className="value">{quizResult.score} / {quizResult.maxScore}</span>
            </div>
            <div className="stat-item">
              <span className="label">Percentage</span>
              <span className="value">{quizResult.percentage}%</span>
            </div>
            <div className="stat-item">
              <span className="label">Rate</span>
              <span className="value">{quizResult.percentage >= 70 ? 'PASS' : 'FAIL'}</span>
            </div>
            {quizResult.timeTaken && (
              <div className="stat-item">
                <span className="label">Time Taken</span>
                <span className="value">{Math.floor(quizResult.timeTaken / 60)}m {quizResult.timeTaken % 60}s</span>
              </div>
            )}
          </div>
          <p className="review-msg">Review your answers below:</p>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;