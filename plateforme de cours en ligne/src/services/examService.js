import api from './api';

export const examService = {
  getAllExams: () => 
    api.get('/exams'),
  
  getExamById: (id) => 
    api.get(`/exams/${id}`),
  
  createExam: (examData) => {
    return examData instanceof FormData
      ? api.postFormData('/exams', examData)
      : api.post('/exams', examData);
  },
  
  updateExam: (id, examData) => 
    api.put(`/exams/${id}`, examData),
  
  deleteExam: (id) => 
    api.delete(`/exams/${id}`),
  
  submitExam: (id, answers) => 
    api.post(`/exams/${id}/submit`, { answers }),
  
  getExamResult: (id) => 
    api.get(`/exams/${id}/result`),
  
  getStudentExams: () => 
    api.get('/exams/student/exams'),
  
  getInstructorExams: () => 
    api.get('/exams/instructor/exams'),
  
  getStudentSubmissions: (examId) => 
    api.get(`/exams/${examId}/submissions`),
  
  gradeSubmission: (submissionId, grade) => 
    api.post(`/exams/submissions/${submissionId}/grade`, { grade }),

  // Exam questions
  getExamQuestions: (examId) => 
    api.get(`/exams/${examId}/questions`),
  
  createExamQuestion: (examId, questionData) => 
    api.post(`/exams/${examId}/questions`, questionData),
  
  updateExamQuestion: (questionId, questionData) => 
    api.put(`/exams/questions/${questionId}`, questionData),
  
  deleteExamQuestion: (questionId) => 
    api.delete(`/exams/questions/${questionId}`)
};

export default examService;
