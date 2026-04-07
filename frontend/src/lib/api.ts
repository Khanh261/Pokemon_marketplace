import axios from 'axios';
import {
  Pokemon,
  PaginatedResponse,
  PokemonQuery,
  CreatePokemonInput,
  UpdatePokemonInput,
  AuthResponse,
} from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const pokemonApi = {
  getAll: (query?: PokemonQuery) =>
    api.get<PaginatedResponse<Pokemon>>('/pokemon', { params: query }).then((r) => r.data),
  getOne: (id: string) => api.get<Pokemon>(`/pokemon/${id}`).then((r) => r.data),
  create: (data: CreatePokemonInput) => api.post<Pokemon>('/pokemon', data).then((r) => r.data),
  update: (id: string, data: UpdatePokemonInput) =>
    api.patch<Pokemon>(`/pokemon/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/pokemon/${id}`),
  getMetadata: (id: string) => api.get(`/pokemon/${id}/metadata`).then((r) => r.data),
  mint: (id: string) => api.post<Pokemon>(`/pokemon/${id}/mint`).then((r) => r.data),
  confirmPurchase: (id: string, data: { txHash: string; buyerAddress: string }) =>
    api.post<Pokemon>(`/pokemon/${id}/purchase`, data).then((r) => r.data),
};

export const authApi = {
  getNonce: () => api.get<{ message: string }>('/auth/nonce').then((r) => r.data),
  walletAuth: (data: { walletAddress: string; signature: string; message: string; name?: string }) =>
    api.post<AuthResponse>('/auth/wallet', data).then((r) => r.data),
};

export default api;
