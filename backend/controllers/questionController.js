import {
  createQuestion,
  deleteQuestionById,
  getAllQuestions,
  getQuestionsByCourse,
  getQuestionsByInstructor,
  getQuestionsByStudent,
  replyToQuestion,
  updateQuestionById
} from '../models/questionModel.js';

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await getAllQuestions();
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

export const getCourseQuestions = async (req, res, next) => {
  try {
    const questions = await getQuestionsByCourse(req.params.courseId);
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

export const createQuestionHandler = async (req, res, next) => {
  try {
    const question = await createQuestion(req.user.id, req.body);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

export const updateQuestionHandler = async (req, res, next) => {
  try {
    const question = await updateQuestionById(req.params.id, req.body);
    res.json(question);
  } catch (error) {
    next(error);
  }
};

export const deleteQuestionHandler = async (req, res, next) => {
  try {
    await deleteQuestionById(req.params.id);
    res.json({ message: 'Question supprimée.' });
  } catch (error) {
    next(error);
  }
};

export const replyQuestionHandler = async (req, res, next) => {
  try {
    const question = await replyToQuestion(req.params.id, req.body.reply, req.user.id);
    res.json(question);
  } catch (error) {
    next(error);
  }
};

export const getStudentQuestions = async (req, res, next) => {
  try {
    const questions = await getQuestionsByStudent(req.user.id);
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

export const getInstructorQuestions = async (req, res, next) => {
  try {
    const questions = await getQuestionsByInstructor(req.user.id);
    res.json(questions);
  } catch (error) {
    next(error);
  }
};
