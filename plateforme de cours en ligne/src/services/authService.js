import api from './api';

export const authService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    // Ajouter ici d'autres clés persistantes si l'app en utilise.
  },
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  updateProfile: (userData) => 
    api.put('/auth/profile', userData),
  
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
  
  resetPassword: (email) => 
    api.post('/auth/reset-password', { email })
};

export default authService;
