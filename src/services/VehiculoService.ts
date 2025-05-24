import axios from 'axios';
import type { Vehiculo } from '../types/Vehiculo';
import type { ApiResponse } from '../types/apiResponse';

const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}vehiculo`;
console.log("Url: ",API);

export const getAll = (fechaInicio?: string, fechaFin?: string) => {
  const params = fechaInicio && fechaFin ? { fechaInicio, fechaFin } : {};
  return axios.get<ApiResponse<Vehiculo[]>>(API, { params });
};
export const getById = (id: number) => axios.get<ApiResponse<Vehiculo>>(`${API}/${id}`);
export const create = (data: Omit<Vehiculo, 'id'>) => axios.post(API, data);
export const update = (id: number, data: Omit<Vehiculo, 'id'>) => axios.put(`${API}/${id}`, data);
export const remove = (id: number) => axios.delete(`${API}/${id}`);

