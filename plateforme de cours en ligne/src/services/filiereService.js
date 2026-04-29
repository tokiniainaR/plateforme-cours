import api from './api';

export const filiereService = {
  getAllFilieres: () => api.get('/filieres'),
  getFiliereById: (id) => api.get(`/filieres/${id}`),
  createFiliere: (data) => api.post('/filieres', data),
  updateFiliere: (id, data) => api.put(`/filieres/${id}`, data),
  deleteFiliere: (id) => api.delete(`/filieres/${id}`)
};

export default filiereService;
