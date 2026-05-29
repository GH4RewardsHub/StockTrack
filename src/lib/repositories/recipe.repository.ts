import api from "../services/api";
import { Recipe } from "@/types/inventory";

const mapRecipe = (r: any): Recipe => ({
  id: r.id,
  businessId: r.business_id,
  recipeName: r.recipe_name,
  recipeCode: r.recipe_code,
  categoryId: r.category_id,
  categoryName: r.category_name,
  yieldQty: r.yield_qty,
  yieldUnit: r.yield_unit,
  description: r.description,
  status: r.status,
  isActive: r.status === "active",
  createdAt: r.created_at,
  ingredientsCount: r.ingredients_count,
  costPerServing: r.cost_per_serving,
  ingredients: (r.ingredients || []).map((ing: any) => ({
    id: ing.id,
    recipeId: ing.recipe_id,
    itemId: ing.item_id,
    itemName: ing.item_name,
    qtyUsed: ing.qty_used,
    unit: ing.unit,
    costPerUnit: ing.cost_per_unit,
    totalCost: ing.total_cost,
  })),
});

export const createRecipe = async (
  businessId: string,
  data: Omit<Recipe, "id" | "createdAt" | "isActive" | "ingredientsCount" | "costPerServing">,
) => {
  const response = await api.post(`/api/businesses/${businessId}/recipes`, {
    recipe_name: data.recipeName,
    recipe_code: data.recipeCode,
    category_id: data.categoryId || null,
    yield_qty: data.yieldQty,
    yield_unit: data.yieldUnit,
    description: data.description,
    status: data.status,
    ingredients: data.ingredients.map((ing) => ({
      item_id: ing.itemId,
      qty_used: ing.qtyUsed,
    })),
  });
  return mapRecipe(response.data);
};

export const getRecipes = async (businessId: string) => {
  const response = await api.get(`/api/businesses/${businessId}/recipes`);
  return response.data.map(mapRecipe);
};

export const updateRecipe = async (
  businessId: string,
  recipeId: string,
  data: Omit<Recipe, "id" | "createdAt" | "isActive" | "ingredientsCount" | "costPerServing">,
) => {
  const response = await api.put(`/api/businesses/${businessId}/recipes/${recipeId}`, {
    recipe_name: data.recipeName,
    recipe_code: data.recipeCode,
    category_id: data.categoryId || null,
    yield_qty: data.yieldQty,
    yield_unit: data.yieldUnit,
    description: data.description,
    status: data.status,
    ingredients: data.ingredients.map((ing) => ({
      item_id: ing.itemId,
      qty_used: ing.qtyUsed,
    })),
  });
  return mapRecipe(response.data);
};

export const deleteRecipe = async (businessId: string, recipeId: string) => {
  const response = await api.delete(`/api/businesses/${businessId}/recipes/${recipeId}`);
  return response.data;
};
