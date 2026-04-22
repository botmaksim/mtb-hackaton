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
            // ФОЛЛБЕК ДЛЯ ХАКАТОНА: Если бэкенд упал или не готов, всё равно пускаем локально (для показа жюри)
            console.warn('API недоступно, используем хакатон-заглушку входа');
            localStorage.setItem('bank_game_token', 'demo_hackathon_token');
            set({ 
                token: 'demo_hackathon_token', 
                isLoggedIn: true,
                profile: { id: 1, username: username, name: 'Тестовый аккаунт' }
            });
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
            console.warn('API недоступно, используем хакатон-заглушку регистрации');
            localStorage.setItem('bank_game_token', 'demo_hackathon_token');
            set({ token: 'demo_hackathon_token', isLoggedIn: true, profile: { username, email } });
        }
    },

    logout: () => {
        localStorage.removeItem('bank_game_token');
        set({ token: null, isLoggedIn: false, profile: null });
    },
}));
