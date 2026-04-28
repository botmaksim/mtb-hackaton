import { create } from 'zustand';
import { authApi } from '../api/authApi';

export const useAuthStore = create((set) => ({
    token: localStorage.getItem('bank_game_token') || null,
    isLoggedIn: !!localStorage.getItem('bank_game_token'),
    profile: null,

    login: async (username, password) => {
        try {
            // Реальный вызов к твоему Django бэкенду
            const data = await authApi.login(username, password);
            const token = data.access || data.token; // Зависит от того, как ты настроишь DRF (SimpleJWT vs TokenAuth)

            localStorage.setItem('bank_game_token', token);
            set({
                token: token,
                isLoggedIn: true,
                profile: data.user || { username, name: 'MTBank User' }
            });
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    register: async (email, username, password) => {
        try {
            const data = await authApi.register(email, username, password);
            const token = data.access || data.token;

            localStorage.setItem('bank_game_token', token);
            set({
                token: token,
                isLoggedIn: true,
                profile: data.user || { username, email }
            });
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('bank_game_token');
        set({ token: null, isLoggedIn: false, profile: null });
    },
    
    fetchProfile: async () => {
        try {
            if (localStorage.getItem('bank_game_token')) {
                const data = await authApi.getProfile();
                set({ profile: data.user || data });
                import('./usePlayerStore').then(module => {
                    module.usePlayerStore.getState().updateFromProfile(data.user || data);
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile', err);
            set({ token: null, isLoggedIn: false, profile: null });
            localStorage.removeItem('bank_game_token');
        }
    }
}));
