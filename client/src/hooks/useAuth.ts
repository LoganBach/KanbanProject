import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/api';

export interface AuthState {
    isLoggedIn: boolean;
    user: string | null;
    loading: boolean;
}

/**
 * Hook for managing authentication state
 */
export function useAuth(): AuthState {
    const [authState, setAuthState] = useState<AuthState>({
        isLoggedIn: false,
        user: null,
        loading: true,
    });

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            const user = getCurrentUser();

            setAuthState({
                isLoggedIn: authenticated,
                user,
                loading: false,
            });
        };

        checkAuth();
    }, []);

    return authState;
}

/**
 * Hook for protecting routes that require authentication
 * @param redirectTo - Path to redirect if not authenticated (default: '/login')
 */
export function useAuthGuard(redirectTo: string = '/login'): AuthState {
    const authState = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authState.loading && !authState.isLoggedIn) {
            navigate(redirectTo);
        }
    }, [authState.loading, authState.isLoggedIn, navigate, redirectTo]);

    return authState;
}
