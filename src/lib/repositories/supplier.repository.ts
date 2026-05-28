import api from "../services/api";
import { Supplier } from "@/types/inventory";

export const createSupplier = async (
  businessId: string,
  data: Omit<Supplier, "id" | "createdAt">,
) => {
  const response = await api.post(`/api/businesses/${businessId}/suppliers`, {
    name: data.name,
    contact_person: data.contactPerson || "",
    phone: data.phone || "",
    email: data.email || "",
    address_line1: data.addressLine1,
    address_line2: data.addressLine2 || "",
    city: data.city,
    state_province: data.stateProvince || "",
    postal_code: data.postalCode || "",
    country: data.country,
    website: data.website || "",
    notes: data.notes || "",
    ordering_method: data.orderingMethod || null,
    is_active: data.isActive !== false,
  });
  return response.data;
};

export const getSuppliers = async (businessId: string) => {
  const response = await api.get(`/api/businesses/${businessId}/suppliers`);
  const data = response.data;
  return data.map((s: any) => ({
    id: s.id,
    businessId: s.business_id,
    name: s.name,
    contactPerson: s.contact_person || "",
    phone: s.phone || "",
    email: s.email || "",
    addressLine1: s.address_line1,
    addressLine2: s.address_line2 || "",
    city: s.city,
    stateProvince: s.state_province || "",
    postalCode: s.postal_code || "",
    country: s.country,
    website: s.website || "",
    notes: s.notes || "",
    orderingMethod: s.ordering_method || undefined,
    isActive: s.is_active !== false,
    createdAt: s.created_at,
  })) as Supplier[];
};

export const updateSupplier = async (
  businessId: string,
  supplierId: string,
  data: Partial<Omit<Supplier, "id" | "createdAt">>,
) => {
  const response = await api.put(
    `/api/businesses/${businessId}/suppliers/${supplierId}`,
    {
      name: data.name,
      contact_person: data.contactPerson || "",
      phone: data.phone || "",
      email: data.email || "",
      address_line1: data.addressLine1,
      address_line2: data.addressLine2 || "",
      city: data.city,
      state_province: data.stateProvince || "",
      postal_code: data.postalCode || "",
      country: data.country,
      website: data.website || "",
      notes: data.notes || "",
      ordering_method: data.orderingMethod || null,
      is_active: data.isActive !== false,
    }
  );
  return response.data;
};

export const deleteSupplier = async (
  businessId: string,
  supplierId: string,
) => {
  const response = await api.delete(
    `/api/businesses/${businessId}/suppliers/${supplierId}`
  );
  return response.data;
};
