import api from './api';

export const matiereService = {
  getAllMatieres: () => api.get('/matieres'),
  getAvailableMatieres: () => api.get('/matieres?available=true'),
  getMatiereById: (id) => api.get(`/matieres/${id}`),
  createMatiere: (data) => api.post('/matieres', data),
  updateMatiere: (id, data) => api.put(`/matieres/${id}`, data),
  deleteMatiere: (id) => api.delete(`/matieres/${id}`)
};

export default matiereService;
