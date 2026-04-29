import api from './api';

const userService = {
  getUserById: (id) => api.get(`/users/public/${id}`)
};

export default userService;
