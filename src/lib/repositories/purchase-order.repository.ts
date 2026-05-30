import api from "../services/api";
import { PurchaseOrder } from "@/types/inventory";

const mapPurchaseOrder = (po: any): PurchaseOrder => ({
  id: po.id,
  poNumber: po.po_number,
  supplierId: po.supplier_id,
  supplierName: po.supplier_name,
  status: po.status,
  createdAt: po.created_at,
  totalAmount: po.total_amount,
  notes: po.notes || "",
  items: (po.items || []).map((i: any) => ({
    id: i.id,
    stockItemId: i.stock_item_id,
    stockItemName: i.stock_item_name,
    sku: i.sku || "",
    quantity: i.quantity || 0,
    unitCost: i.unit_cost || 0,
    totalCost: i.total_cost || 0,
  })),
});

export const createPurchaseOrder = async (
  businessId: string,
  data: {
    supplierId: string;
    notes?: string;
    items: { stockItemId: string; quantity: number; unitCost: number }[];
  },
): Promise<PurchaseOrder> => {
  const response = await api.post(
    `/api/businesses/${businessId}/purchase-orders`,
    {
      supplier_id: data.supplierId,
      notes: data.notes || null,
      items: data.items.map((i) => ({
        stock_item_id: i.stockItemId,
        quantity: i.quantity,
        unit_cost: i.unitCost,
      })),
    },
  );
  return mapPurchaseOrder(response.data);
};

export const getPurchaseOrders = async (
  businessId: string,
): Promise<PurchaseOrder[]> => {
  const response = await api.get(
    `/api/businesses/${businessId}/purchase-orders`,
  );
  return response.data.map(mapPurchaseOrder);
};

export const getPurchaseOrder = async (
  businessId: string,
  poId: string,
): Promise<PurchaseOrder> => {
  const response = await api.get(
    `/api/businesses/${businessId}/purchase-orders/${poId}`,
  );
  return mapPurchaseOrder(response.data);
};

export const updatePurchaseOrderStatus = async (
  businessId: string,
  poId: string,
  status: "draft" | "sent" | "completed",
): Promise<PurchaseOrder> => {
  const response = await api.put(
    `/api/businesses/${businessId}/purchase-orders/${poId}`,
    {
      status,
    },
  );
  return mapPurchaseOrder(response.data);
};

export const deletePurchaseOrder = async (
  businessId: string,
  poId: string,
): Promise<void> => {
  await api.delete(`/api/businesses/${businessId}/purchase-orders/${poId}`);
};
