import api from "../services/api";
import { StockCountSession, StockCountItem } from "@/types/inventory";

const mapStockCountItem = (item: any): StockCountItem => ({
  id: item.id,
  sessionId: item.session_id,
  itemId: item.item_id,
  itemName: item.item_name,
  itemSku: item.item_sku || "",
  baseUnit: item.base_unit || "pcs",
  expectedQty: item.expected_qty || 0,
  countedCartons: item.counted_cartons !== null ? item.counted_cartons : undefined,
  countedPieces: item.counted_pieces !== null ? item.counted_pieces : undefined,
  countedQty: item.counted_qty !== null ? item.counted_qty : undefined,
  variance: item.variance !== null ? item.variance : undefined,
  costVariance: item.cost_variance !== null ? item.cost_variance : undefined,
  notes: item.notes || "",
});

const mapStockCountSession = (sess: any): StockCountSession => ({
  id: sess.id,
  businessId: sess.business_id,
  locationId: sess.location_id || "",
  locationName: sess.location_name || "",
  countType: sess.count_type || "General Count",
  countDate: sess.count_date,
  countedByName: sess.counted_by_name,
  status: sess.status,
  notes: sess.notes || "",
  createdAt: sess.created_at,
  completedAt: sess.completed_at || "",
  itemsCount: sess.items_count || 0,
  totalVariance: sess.total_variance || 0,
  items: (sess.items || []).map(mapStockCountItem),
});

export const getStockCounts = async (businessId: string): Promise<StockCountSession[]> => {
  const response = await api.get(`/api/businesses/${businessId}/stock-counts`);
  return response.data.map(mapStockCountSession);
};

export const getStockCountDetail = async (
  businessId: string,
  sessionId: string,
): Promise<StockCountSession> => {
  const response = await api.get(`/api/businesses/${businessId}/stock-counts/${sessionId}`);
  return mapStockCountSession(response.data);
};

export const createStockCount = async (
  businessId: string,
  data: Omit<StockCountSession, "id" | "createdAt" | "status">,
): Promise<StockCountSession> => {
  const response = await api.post(`/api/businesses/${businessId}/stock-counts`, {
    location_id: data.locationId || null,
    count_type: data.countType,
    count_date: data.countDate,
    counted_by_name: data.countedByName,
    notes: data.notes || "",
    items: (data.items || []).map((item) => ({
      item_id: item.itemId,
      counted_cartons: item.countedCartons !== undefined ? item.countedCartons : null,
      counted_pieces: item.countedPieces !== undefined ? item.countedPieces : null,
      notes: item.notes || "",
    })),
  });
  return mapStockCountSession(response.data);
};

export const updateStockCount = async (
  businessId: string,
  sessionId: string,
  data: Omit<StockCountSession, "id" | "createdAt" | "status">,
  status?: string,
): Promise<StockCountSession> => {
  const params: Record<string, string> = {};
  if (status) {
    params.status = status;
  }
  const response = await api.put(
    `/api/businesses/${businessId}/stock-counts/${sessionId}`,
    {
      location_id: data.locationId || null,
      count_type: data.countType,
      count_date: data.countDate,
      counted_by_name: data.countedByName,
      notes: data.notes || "",
      items: (data.items || []).map((item) => ({
        item_id: item.itemId,
        counted_cartons: item.countedCartons !== undefined ? item.countedCartons : null,
        counted_pieces: item.countedPieces !== undefined ? item.countedPieces : null,
        notes: item.notes || "",
      })),
    },
    { params },
  );
  return mapStockCountSession(response.data);
};

export const deleteStockCount = async (
  businessId: string,
  sessionId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/api/businesses/${businessId}/stock-counts/${sessionId}`);
  return response.data;
};
