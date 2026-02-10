import api from './api';
import { MonthlyReport } from './types/reports';

export const getMonthlyReport = async (month?: number, year?: number): Promise<MonthlyReport> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  
  const response = await api.get(`/api/reports/monthly?${params.toString()}`);
  return response.data;
};
