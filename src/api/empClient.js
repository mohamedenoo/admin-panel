import axios from 'axios';
import { getEmpToken, clearEmpToken } from '../authEmployee';

export const empApi = axios.create({
  baseURL: 'http://192.168.1.124:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

empApi.interceptors.request.use((config)=>{
  const t = getEmpToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

empApi.interceptors.response.use(
  (res)=>res,
  (err)=>{
    if (err?.response?.status === 401){
      clearEmpToken();
      window.location.href = '/emp/login';
    }
    return Promise.reject(err);
  }
);