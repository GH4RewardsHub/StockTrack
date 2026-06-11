import { create } from "zustand";
import { Recipe } from "@/types/inventory";
import {
  createRecipe,
  getRecipes,
  updateRecipe,
  deleteRecipe,
} from "@/lib/repositories/recipe.repository";

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  fetchRecipes: (businessId: string) => Promise<void>;
  addRecipe: (
    businessId: string,
    data: Omit<Recipe, "id" | "createdAt" | "isActive" | "ingredientsCount" | "costPerServing">,
  ) => Promise<void>;
  updateRecipe: (
    businessId: string,
    recipeId: string,
    data: Omit<Recipe, "id" | "createdAt" | "isActive" | "ingredientsCount" | "costPerServing">,
  ) => Promise<void>;
  deleteRecipe: (businessId: string, recipeId: string) => Promise<void>;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  loading: false,
  error: null,
  fetchRecipes: async (businessId) => {
    set({ loading: true, error: null });
    try {
      const data = await getRecipes(businessId);
      set({ recipes: data, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to load recipes",
        loading: false,
      });
    }
  },
  addRecipe: async (businessId, data) => {
    set({ loading: true, error: null });
    try {
      await createRecipe(businessId, data);
      const updated = await getRecipes(businessId);
      set({ recipes: updated, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to add recipe",
        loading: false,
      });
      throw err;
    }
  },
  updateRecipe: async (businessId, recipeId, data) => {
    set({ loading: true, error: null });
    try {
      await updateRecipe(businessId, recipeId, data);
      const updated = await getRecipes(businessId);
      set({ recipes: updated, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to update recipe",
        loading: false,
      });
      throw err;
    }
  },
  deleteRecipe: async (businessId, recipeId) => {
    set({ loading: true, error: null });
    try {
      await deleteRecipe(businessId, recipeId);
      const updated = await getRecipes(businessId);
      set({ recipes: updated, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to delete recipe",
        loading: false,
      });
      throw err;
    }
  },
}));
