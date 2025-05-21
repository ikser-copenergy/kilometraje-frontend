import axios from 'axios';
import type { Kilometraje } from '../types/Kilometraje';
import type { ApiResponse } from '../types/apiResponse';

const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}kilometraje`;
console.log("Url: ",API);

export const getAll = (fechaInicio?: string, fechaFin?: string) => {
  const params = fechaInicio && fechaFin ? { fechaInicio, fechaFin } : {};
  return axios.get<ApiResponse<Kilometraje[]>>(API, { params });
};
export const getById = (id: number) => axios.get<ApiResponse<Kilometraje>>(`${API}/${id}`);
export const create = (data: Omit<Kilometraje, 'id'|'vehiculo'>) => axios.post(API, data);
export const update = (id: number, data: Omit<Kilometraje, 'id'>) => axios.put(`${API}/${id}`, data);
export const remove = (id: number) => axios.delete(`${API}/${id}`);

