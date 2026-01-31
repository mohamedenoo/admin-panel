// src/api/client.js
import axios from 'axios';
import { getToken, clearToken } from '../auth';

export const api = axios.create({
  baseURL: 'http://192.168.1.124:4000/api/v1',
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