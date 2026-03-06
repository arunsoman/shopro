import { apiClient } from "@/lib/api/client";
import type {
    MenuCategoryResponse,
    CreateMenuCategoryRequest,
    ReorderCategoriesRequest,
    MenuItemResponse,
    CreateMenuItemRequest,
    DuplicateCheckResponse,
} from "../schema/menuSchema";

export const menuCategoriesApi = {
    getAll: async (): Promise<MenuCategoryResponse[]> => {
        const res = await apiClient.get("/menu-categories");
        return res.data;
    },
    create: async (data: CreateMenuCategoryRequest): Promise<MenuCategoryResponse> => {
        const res = await apiClient.post("/menu-categories", data);
        return res.data;
    },
    update: async (id: string, data: CreateMenuCategoryRequest): Promise<MenuCategoryResponse> => {
        const res = await apiClient.put(`/menu-categories/${id}`, data);
        return res.data;
    },
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/menu-categories/${id}`);
    },
    reorder: async (data: ReorderCategoriesRequest): Promise<void> => {
        await apiClient.post("/menu-categories/reorder", data);
    },
};

export const menuItemsApi = {
    getPublished: async (): Promise<MenuItemResponse[]> => {
        const res = await apiClient.get("/menu-items/published");
        return res.data;
    },
    getDrafts: async (): Promise<MenuItemResponse[]> => {
        const res = await apiClient.get("/menu-items/drafts");
        return res.data;
    },
    getById: async (id: string): Promise<MenuItemResponse> => {
        const res = await apiClient.get(`/menu-items/${id}`);
        return res.data;
    },
    create: async (data: CreateMenuItemRequest): Promise<MenuItemResponse> => {
        const res = await apiClient.post("/menu-items", data);
        return res.data;
    },
    update: async (id: string, data: CreateMenuItemRequest): Promise<MenuItemResponse> => {
        const res = await apiClient.put(`/menu-items/${id}`, data);
        return res.data;
    },
    updateStatus: async (id: string, status: string): Promise<MenuItemResponse> => {
        const res = await apiClient.put(`/menu-items/${id}/status?status=${status}`);
        return res.data;
    },
    checkDuplicate: async (name: string, categoryId: string): Promise<DuplicateCheckResponse> => {
        const res = await apiClient.get(`/menu-items/duplicate-check?name=${encodeURIComponent(name)}&categoryId=${categoryId}`);
        return res.data;
    },
    uploadPhoto: async (id: string, file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiClient.post(`/menu-items/${id}/photo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },
};
