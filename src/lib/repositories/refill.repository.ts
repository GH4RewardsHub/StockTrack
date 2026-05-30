import api from "../services/api";
import { RefillSuggestion } from "@/types/inventory";

export const getRefillSuggestions = async (
  businessId: string,
): Promise<RefillSuggestion[]> => {
  const response = await api.get(
    `/api/businesses/${businessId}/refill-suggestions`,
  );
  return response.data.map((item: any) => ({
    stockItemId: item.stock_item_id,
    stockItemName: item.stock_item_name,
    sku: item.sku || "",
    categoryName: item.category_name,
    supplierId: item.supplier_id,
    supplierName: item.supplier_name,
    locationId: item.location_id,
    locationName: item.location_name,
    currentStock: item.current_stock || 0,
    capacity: item.capacity || 0,
    reorderLevel: item.reorder_level || 0,
    toRefill: item.to_refill || 0,
    costPerBaseUnit: item.cost_per_base_unit || 0,
    estCost: item.est_cost || 0,
  }));
};
