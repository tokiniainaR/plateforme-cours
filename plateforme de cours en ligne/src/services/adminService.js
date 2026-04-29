import api from './api';

export const adminService = {
  // Gestion des comptes
  getAllAccounts: (filter = 'all') => 
    api.get(`/admin/accounts?filter=${filter}`),
  
  getAccountById: (id) => 
    api.get(`/admin/accounts/${id}`),
  
  suspendAccount: (id) => 
    api.post(`/admin/accounts/${id}/suspend`, {}),
  
  blockAccount: (id) => 
    api.post(`/admin/accounts/${id}/block`, {}),
  
  unblockAccount: (id) => 
    api.post(`/admin/accounts/${id}/unblock`, {}),
  
  deleteAccount: (id) => 
    api.delete(`/admin/accounts/${id}`),
  
  // Gestion des cours
  getAllCoursesAdmin: () => 
    api.get('/admin/courses'),
  
  approveCourse: (id) => 
    api.post(`/admin/courses/${id}/approve`, {}),
  
  rejectCourse: (id) => 
    api.post(`/admin/courses/${id}/reject`, {}),
  
  deleteCourseAdmin: (id) => 
    api.delete(`/admin/courses/${id}`),
  
  // Gestion des examens
  getAllExamsAdmin: () => 
    api.get('/admin/exams'),
  
  deleteExamAdmin: (id) => 
    api.delete(`/admin/exams/${id}`),
  
  // Modération
  getAllReports: () => 
    api.get('/admin/reports'),
  
  getReportById: (id) => 
    api.get(`/admin/reports/${id}`),
  
  resolveReport: (id) => 
    api.post(`/admin/reports/${id}/resolve`, {}),
  
  deleteReport: (id) => 
    api.delete(`/admin/reports/${id}`),
  
  // Statistiques
  getDashboardStats: () => 
    api.get('/admin/statistics'),
  
  getSystemHealth: () => 
    api.get('/admin/health')
};

export default adminService;
