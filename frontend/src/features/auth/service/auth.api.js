const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const request = async (path, { token, ...options } = {}) => {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Something went wrong. Please try again.');
  }

  return payload;
};

const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (details) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    }),
  currentUser: (token) => request('/auth/me', { token }),
  adminUsers: (token) => request('/admin/users', { token }),
};

export { authApi };