import api from './api';

export const questionService = {
  getAllQuestions: () => 
    api.get('/questions'),
  
  getQuestionsByCourse: (courseId) => 
    api.get(`/courses/${courseId}/questions`),
  
  createQuestion: (questionData) => 
    api.post('/questions', questionData),
  
  updateQuestion: (id, questionData) => 
    api.put(`/questions/${id}`, questionData),
  
  deleteQuestion: (id) => 
    api.delete(`/questions/${id}`),
  
  replyQuestion: (id, reply) => 
    api.post(`/questions/${id}/reply`, { reply }),
  
  getStudentQuestions: () => 
    api.get('/student/questions'),
  
  getInstructorQuestions: () => 
    api.get('/instructor/questions')
};

export default questionService;
