import api from "../services/api";
import { StockItem } from "@/types/inventory";

export const createStockItem = async (
  businessId: string,
  data: Omit<StockItem, "id" | "createdAt">,
) => {
  const response = await api.post(`/api/businesses/${businessId}/stock-items`, {
    name: data.name,
    sku: data.sku || "",
    image_url: data.imageUrl || "",
    description: data.description || "",
    base_unit: data.baseUnit || "pcs",
    reorder_level_base_qty: data.reorderLevelBaseQty || 0,
    max_stock_base_qty: data.maxStockBaseQty || 0,
    cost_per_base_unit: data.costPerBaseUnit || null,
    is_active: data.isActive !== false,
    category_id: data.categoryId || null,
  });
  return response.data;
};

export const getStockItems = async (businessId: string) => {
  const response = await api.get(`/api/businesses/${businessId}/stock-items`);
  const data = response.data;
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    sku: item.sku || "",
    imageUrl: item.image_url || "",
    description: item.description || "",
    baseUnit: item.base_unit || "pcs",
    reorderLevelBaseQty: item.reorder_level_base_qty || 0,
    maxStockBaseQty: item.max_stock_base_qty || 0,
    costPerBaseUnit: item.cost_per_base_unit || 0,
    isActive: item.is_active !== false,
    categoryId: item.category_id,
    businessId: item.business_id,
    createdAt: item.created_at,
  })) as StockItem[];
};

export const getDashboardMetrics = async (businessId: string) => {
  const response = await api.get(`/api/businesses/${businessId}/dashboard-metrics`);
  return response.data;
};
