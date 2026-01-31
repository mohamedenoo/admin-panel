// src/api/client.js
import axios from 'axios';
import { getToken, clearToken } from '../auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      // ممكن نوجّه لصفحة تسجيل الدخول لاحقًا
    }
    return Promise.reject(err);
  }
);