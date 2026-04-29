import api from './api';

export const courseService = {
  getAllCourses: () => 
    api.get('/courses'),
  
  getCourseById: (id) => 
    api.get(`/courses/${id}`),
  
  createCourse: (courseData) => 
    api.post('/courses', courseData),
  
  updateCourse: (id, courseData) => 
    api.put(`/courses/${id}`, courseData),
  
  deleteCourse: (id) => 
    api.delete(`/courses/${id}`),
  
  enrollCourse: (id) => 
    api.post(`/courses/${id}/enroll`, {}),
  
  getCourseProgress: (id) => 
    api.get(`/courses/${id}/progress`),
  
  getCourseStudents: (id) => 
    api.get(`/courses/${id}/students`),
  
  addCourseContent: (id, contentData) => 
    api.post(`/courses/${id}/content`, contentData),
  uploadCourseVideo: (id, file) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.postFormData(`/courses/${id}/videos/upload`, formData);
  },

  uploadCoursePdf: (id, file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.postFormData(`/courses/${id}/pdfs/upload`, formData);
  },

  uploadCourseResource: (id, file) => {
    const formData = new FormData();
    formData.append('resource', file);
    return api.postFormData(`/courses/${id}/resources/upload`, formData);
  },
  
  getInstructorCourses: async () => {
    const data = await api.get('/courses/instructor/courses');
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.courses)
        ? data.courses
        : [];
  },
  
  getStudentCourses: async () => {
    const data = await api.get('/courses/student/courses');
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.courses)
        ? data.courses
        : [];
  },
  
  getInstructorActivities: async () => {
    const data = await api.get('/courses/instructor/activities');
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.activities)
        ? data.activities
        : [];
  },
  
  getStudentStats: () =>
    api.get('/courses/student/stats')
};

export default courseService;
