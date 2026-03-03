import axios, { AxiosError } from 'axios';
import { getClerkInstance } from '@clerk/clerk-expo';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/** Request timeout in milliseconds (30s) */
export const API_TIMEOUT_MS = 30_000;

/**
 * API client with Clerk token injection and error handling.
 * Use this instance for all backend requests.
 */
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
    validateStatus: (status) => status >= 200 && status < 300,
});

/** Normalized API error for consistent handling */
export interface ApiError {
    message: string;
    code: 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'CLIENT_ERROR' | 'SERVER_ERROR';
    status?: number;
    data?: unknown;
}

/**
 * Request interceptor: injects Clerk Bearer token into requests.
 */
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const clerkInstance = getClerkInstance();
            const token = await clerkInstance.session?.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // No session or Clerk not ready - skip token; request may fail with 401
        }
        return config;
    },
    (error) => Promise.reject(error),
);

/**
 * Response interceptor: handles 401 (sign out), network errors, and normalizes errors.
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            try {
                const clerkInstance = getClerkInstance();
                await clerkInstance.signOut();
            } catch {
                // Ignore signOut errors
            }
            const apiError: ApiError = {
                message: 'Session expired. Please sign in again.',
                code: 'UNAUTHORIZED',
                status: 401,
            };
            return Promise.reject(apiError);
        }

        if (error.code === 'ERR_NETWORK' || !error.response) {
            const apiError: ApiError = {
                message: 'Network error. Please check your connection.',
                code: 'NETWORK_ERROR',
            };
            return Promise.reject(apiError);
        }

        const status = error.response.status;
        const data = error.response.data;
        let message = error.message;
        if (data && typeof data === 'object' && 'message' in data) {
            const msg = (data as { message?: string | string[] }).message;
            message = Array.isArray(msg)
                ? msg.join(', ')
                : String(msg ?? message);
        }

        const apiError: ApiError = {
            message: message ?? `Request failed with status ${status}`,
            code: status >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR',
            status,
            data,
        };
        return Promise.reject(apiError);
    },
);

/**
 * Creates an AbortController for request cancellation.
 * Use with apiClient: apiClient.get(url, { signal: controller.signal })
 * React Query passes signal in queryFn: ({ signal }) => apiClient.get(url, { signal })
 */
export function createAbortController(): AbortController {
    return new AbortController();
}
