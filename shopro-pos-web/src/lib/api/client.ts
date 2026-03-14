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

const SESSION_KEY = "shopro_session";

// Interceptor to inject DPoP header (FAPI 2.0 Compliance)
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            // Construct absolute URL for the htu claim (RFC 9449 Section 4.2)
            // We must match exactly what Axios will send as the request URI.
            const targetUrl = config.url || "";
            let absoluteUrl: string;

            if (targetUrl.startsWith('http')) {
                absoluteUrl = targetUrl;
            } else {
                const baseURL = config.baseURL || "";
                // Join baseURL and targetUrl correctly (stripping extra slashes)
                const combinedPath = targetUrl 
                    ? baseURL.replace(/\/+$/, '') + '/' + targetUrl.replace(/^\/+/, '')
                    : baseURL;
                
                if (combinedPath.startsWith('http')) {
                    absoluteUrl = combinedPath;
                } else {
                    // Prepend origin if we only have a partial path
                    const origin = window.location.origin;
                    absoluteUrl = `${origin}${combinedPath.startsWith('/') ? '' : '/'}${combinedPath}`;
                }
            }

            const proof = await DPoPWebService.generateProof(config.method || "GET", absoluteUrl);
            config.headers.set("DPoP", proof);
        } catch (error) {
            console.error("Failed to generate DPoP proof", error);
        }
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (raw) {
                const session = JSON.parse(raw);
                if (session?.id) {
                    config.headers.set("X-Staff-Id", session.id);
                }
            }
        } catch (error) {
            console.error("Failed to inject X-Staff-Id", error);
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
