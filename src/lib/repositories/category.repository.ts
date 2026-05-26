import api from "../services/api";
import { Category } from "@/types/inventory";

export const createCategory = async (
  businessId: string,
  data: Omit<Category, "id" | "createdAt">,
) => {
  const response = await api.post(`/api/businesses/${businessId}/categories`, {
    name: data.name,
  });
  return response.data;
};

export const getCategories = async (businessId: string) => {
  const response = await api.get(`/api/businesses/${businessId}/categories`);
  const data = response.data;
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    createdAt: c.created_at,
    businessId: c.business_id,
  })) as Category[];
};

