// API request utilities

/** Request method, body, headers */
export interface ApiRequestOptions {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

/**
 * Get authentication headers with JWT token
 */
export function getAuthHeaders(): Record<string, string> {
    const token = sessionStorage.getItem("token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest(
    url: string,
    options: ApiRequestOptions = {},
): Promise<Response> {
    const { method = "GET", body, headers = {} } = options;

    const requestOptions: RequestInit = {
        method,
        headers: { ...getAuthHeaders(), ...headers },
    };

    if (body && method !== "GET") {
        requestOptions.body =
            typeof body === "string" ? body : JSON.stringify(body);
    }

    return fetch(url, requestOptions);
}

/**
 * Make an authenticated API request and parse JSON response
 */
export async function apiRequestJson<T>(
    url: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const response = await apiRequest(url, options);

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status} ${response.statusText}`,
        );
    }

    return response.json();
}

/**
 * Check if JWT exists
 */
export function isAuthenticated(): boolean {
    return !!sessionStorage.getItem("token");
}

/**
 * Get current username
 */
export function getCurrentUser(): string | null {
    return sessionStorage.getItem("user");
}

/**
 * Get current email
 */
export function getCurrentEmail(): string | null {
    return sessionStorage.getItem("email");
}

/**
 * Clear auth session storage
 */
export function clearAuth(): void {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("email");
}
