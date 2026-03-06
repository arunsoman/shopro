import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

export interface ApiResult<T> {
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    status: number;
    message: string;
    details?: Record<string, string[]>;
}

// Simple interceptor to normalize error responses based on our Java GlobalExceptionHandler
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const apiError: ApiError = {
            status: error.response?.status || 500,
            message: "An unexpected error occurred.",
        };

        if (error.response?.data) {
            const data = error.response.data as any;
            apiError.message = data.message || apiError.message;
            apiError.details = data.details;
        }

        return Promise.reject(apiError);
    }
);
