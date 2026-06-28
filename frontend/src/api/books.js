import api from './client';

export const fetchBooks = (query, genre, page = 0, size = 12) =>
  api.get('/api/books', { params: { query, genre, page, size } });

export const fetchBook = (id) =>
  api.get(`/api/books/${id}`);

export const fetchChunk = (bookId, chunkIndex, easyRead = false) =>
  api.get(`/api/books/${bookId}/chunks/${chunkIndex}`, { params: { easyRead } });

export const prefetchChunk = (bookId, chunkIndex, easyRead = false) =>
  api.get(`/api/books/${bookId}/prefetch/${chunkIndex}`, { params: { easyRead } });

export const uploadBook = (file, thumbnail, title, author, genre) => {
  const formData = new FormData();
  formData.append('file', file);
  if (thumbnail) formData.append('thumbnail', thumbnail);
  if (title) formData.append('title', title);
  if (author) formData.append('author', author);
  if (genre) formData.append('genre', genre);
  
  return api.post('/api/books/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 5 minutes for large PDF processing
  });
};

export const fetchChunks = (bookId, page = 0, size = 50) =>
  api.get(`/api/books/${bookId}/chunks`, { params: { page, size } });

export const askChat = (data) =>
  api.post('/api/chat/ask', data);

export const getProgress = (bookId) =>
  api.get(`/api/books/${bookId}/progress`);

export const saveProgress = (bookId, lastChunk, easyReadOn = true) =>
  api.put(`/api/books/${bookId}/progress`, null, {
    params: { lastChunk, easyReadOn },
  });

export const sendChatMessage = (bookId, question, currentChunk) =>
  api.post(`/api/books/${bookId}/chat`, { question, currentChunk });

export const fetchTopBooks = (limit = 10) =>
  api.get('/api/books/top', { params: { limit } });

export const fetchUsers = () =>
  api.get('/api/admin/users');

export const updateUserRole = (userId, role) =>
  api.put(`/api/admin/users/${userId}/role`, null, { params: { role } });

export const deleteBook = (bookId) =>
  api.delete(`/api/admin/books/${bookId}`);
