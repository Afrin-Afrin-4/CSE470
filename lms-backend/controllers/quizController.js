const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a quiz
// @route   POST /api/courses/:courseId/quizzes
// @access  Private (Instructor/Admin)
const createQuiz = asyncHandler(async (req, res) => {
  const { lessonIndex, title, description, questions, timeLimit } = req.body;
  const { id: courseId } = req.params;

  // Check if user is the course instructor or admin
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to create quizzes for this course');
  }

  // Calculate total points based on number of questions
  const totalPoints = questions.length;

  const quiz = await Quiz.create({
    course: courseId,
    lessonIndex,
    title,
    description,
    questions,
    totalPoints,
    timeLimit: timeLimit || 0,
    isActive: true
  });

  res.status(201).json({
    success: true,
    data: quiz
  });
});

// @desc    Get a quiz
// @route   GET /api/quizzes/:quizId
// @access  Private (Enrolled Students, Instructor, Admin)
const getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId).populate('course', 'title');

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Check if user is enrolled in the course, is the instructor, or is an admin
  const course = await Course.findById(quiz.course._id);
  const isEnrolled = course.studentsEnrolled.some(student =>
    student.toString() === req.user.id
  );
  const isCourseInstructor = course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isEnrolled && !isCourseInstructor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to access this quiz');
  }

  res.status(200).json({
    success: true,
    data: quiz
  });
});

// @desc    Get all quizzes for a course lesson
// @route   GET /api/courses/:courseId/quizzes/lesson/:lessonIndex
// @access  Private (Enrolled Students, Instructor, Admin)
const getQuizzesForLesson = asyncHandler(async (req, res) => {
  const { id: courseId, lessonIndex } = req.params;

  // Check if user is enrolled in the course, is the instructor, or is an admin
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isEnrolled = course.studentsEnrolled.some(student =>
    student.toString() === req.user.id
  );
  const isCourseInstructor = course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isEnrolled && !isCourseInstructor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to access quizzes for this course');
  }

  const quizzes = await Quiz.find({
    course: courseId,
    lessonIndex: parseInt(lessonIndex)
  });

  res.status(200).json({
    success: true,
    count: quizzes.length,
    data: quizzes
  });
});

// @desc    Submit a quiz attempt
// @route   POST /api/quizzes/:quizId/attempt
// @access  Private (Enrolled Students)
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Check if user is enrolled in the course
  const course = await Course.findById(quiz.course);
  const isEnrolled = course.studentsEnrolled.some(student =>
    student.toString() === req.user.id
  );

  if (!isEnrolled) {
    res.status(401);
    throw new Error('Not authorized to take this quiz');
  }

  // Calculate score
  let score = 0;
  let maxScore = quiz.questions.length; // Assuming each question is worth 1 point

  const processedAnswers = quiz.questions.map((question, qIndex) => {
    const userAnswer = answers.find(a => a.questionId === qIndex.toString());
    let selectedOption = -1;

    if (userAnswer && userAnswer.selectedOption !== null && userAnswer.selectedOption !== undefined) {
      selectedOption = parseInt(userAnswer.selectedOption);
    }

    // Check if option exists validly
    if (isNaN(selectedOption) || selectedOption < 0 || selectedOption >= question.options.length) {
      selectedOption = -1;
    }

    const isCorrect = selectedOption !== -1 &&
      question.options[selectedOption] &&
      question.options[selectedOption].isCorrect;

    if (isCorrect) {
      score++;
    }

    return {
      questionId: qIndex.toString(),
      selectedOption: selectedOption !== -1 ? selectedOption.toString() : null,
      isCorrect,
      pointsAwarded: isCorrect ? 1 : 0
    };
  });

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // Create quiz attempt
  const quizAttempt = await QuizAttempt.create({
    quiz: quizId,
    user: req.user.id,
    answers: processedAnswers,
    score,
    maxScore,
    percentage,
    timeTaken
  });

  res.status(201).json({
    success: true,
    data: {
      quizAttempt,
      score,
      percentage
    }
  });
});

// @desc    Get quiz attempt results
// @route   GET /api/quizzes/:quizId/attempts/:attemptId
// @access  Private (Owner, Instructor, Admin)
const getQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId, attemptId } = req.params;

  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    quiz: quizId
  }).populate('user', 'name email');

  if (!attempt) {
    res.status(404);
    throw new Error('Quiz attempt not found');
  }

  // Check if user is the attempt owner, course instructor, or admin
  const quiz = await Quiz.findById(quizId).populate('course');
  const isOwner = attempt.user._id.toString() === req.user.id;
  const isCourseInstructor = quiz.course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isCourseInstructor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to view this quiz attempt');
  }

  res.status(200).json({
    success: true,
    data: attempt
  });
});

// @desc    Get all attempts for a quiz
// @route   GET /api/quizzes/:quizId/attempts
// @access  Private (Instructor, Admin)
const getQuizAttempts = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId).populate('course');
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Check if user is the course instructor or admin
  if (quiz.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to view quiz attempts');
  }

  const attempts = await QuizAttempt.find({ quiz: quizId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts
  });
});

// @desc    Get user's attempts for a quiz
// @route   GET /api/quizzes/:quizId/my-attempts
// @access  Private (Student)
const getUserQuizAttempts = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const attempts = await QuizAttempt.find({
    quiz: quizId,
    user: req.user.id
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts
  });
});

module.exports = {
  createQuiz,
  getQuiz,
  getQuizzesForLesson,
  submitQuizAttempt,
  getQuizAttempt,
  getQuizAttempts,
  getUserQuizAttempts
};