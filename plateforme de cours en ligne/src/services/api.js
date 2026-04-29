// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const createHeaders = (isFormData = false) => {
  const token = localStorage.getItem('authToken');
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
    throw new Error('Authentification requise.');
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue');
  }
  
  return data;
};

export const apiCall = async (method, endpoint, body = null, isFormData = false) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: createHeaders(isFormData),
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return handleResponse(response);
};

export default {
  get: (endpoint) => apiCall('GET', endpoint),
  post: (endpoint, body) => apiCall('POST', endpoint, body),
  put: (endpoint, body) => apiCall('PUT', endpoint, body),
  delete: (endpoint) => apiCall('DELETE', endpoint),
  patch: (endpoint, body) => apiCall('PATCH', endpoint, body),
  postFormData: (endpoint, formData) => apiCall('POST', endpoint, formData, true)
};
