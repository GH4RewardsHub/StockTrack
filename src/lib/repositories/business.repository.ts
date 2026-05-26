import api from "../services/api";
import { Business } from "@/types/business";

export const createBusinessAndLink = async (userId: string, name: string) => {
  const response = await api.post("/api/businesses", { name });
  const data = response.data;
  return { id: data.id, name: data.name };
};

export const getUserBusinesses = async (businessIds: string[]) => {
  const response = await api.get("/api/businesses");
  const data = response.data;
  return data.map((b: any) => ({
    id: b.id,
    name: b.name,
    isActive: b.is_active,
    createdAt: b.created_at,
    createdBy: b.created_by_id,
    locationsCount: b.locations_count || 0,
    itemsCount: b.items_count || 0,
  })) as any[];
};
