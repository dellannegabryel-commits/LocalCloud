import axios from 'axios';

// Nginx serves frontend on localhost:80 and proxies API calls.
// baseURL is set to the IP address the user uses to access the app externally,
// ensuring correct Host header and routing through Nginx.
const apiClient = axios.create({
  baseURL: '/', // Use relative URL to work correctly with Nginx proxy and different access methods
  timeout: 0, // No timeout for large uploads
});

export const getFiles = async () => {
  const response = await apiClient.get('/api/files'); // Prefix with /api/
  return response.data;
};

export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/upload', formData, { // Prefix with /api/
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

export const deleteFile = async (id) => {
  const response = await apiClient.delete(`/api/files/${id}`); // Prefix with /api/
  return response.data;
};

export const searchFiles = async (query) => {
  if (!query) return [];
  const response = await apiClient.get('/api/search', { params: { q: query } }); // Prefix with /api/
  return response.data;
};

// These should point to paths Nginx handles directly
export const getDownloadUrl = (id) => `/download/${id}`;
export const getViewUrl = (id) => `/view/${id}`;

export default apiClient;
