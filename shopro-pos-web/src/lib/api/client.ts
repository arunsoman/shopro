import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { DPoPWebService } from "@/lib/security/dpop-service";

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

// Interceptor to inject DPoP header (FAPI 2.0 Compliance)
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            // Construct absolute URL for the htu claim (RFC 9449 Section 4.2)
            const targetUrl = config.url || "";
            let absoluteUrl: string;

            if (targetUrl.startsWith('http')) {
                absoluteUrl = targetUrl;
            } else {
                // Determine absolute base
                const base = config.baseURL?.startsWith('http') 
                    ? config.baseURL 
                    : `${window.location.origin}${config.baseURL || ''}`;
                
                absoluteUrl = new URL(targetUrl, base).href;
            }

            const proof = await DPoPWebService.generateProof(config.method || "GET", absoluteUrl);
            config.headers.set("DPoP", proof);
        } catch (error) {
            console.error("Failed to generate DPoP proof", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

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
