import apiClient from './client';

export const authApi = {
    /**
     * Стандартная авторизация через email/username и пароль (Django JWT / Token)
     */
    login: async (username, password) => {
        try {
            const data = await apiClient.post('/auth/login/', { username, password });
            return data; // Ожидаем { access: 'jwt...', user: {...} }
        } catch (error) {
            console.error('Ошибка входа:', error);
            throw error;
        }
    },

    /**
     * Регистрация
     */
    register: async (email, username, password) => {
        try {
            const data = await apiClient.post('/auth/register/', { email, username, password });
            return data; 
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            throw error;
        }
    },

    /**
     * Сброс пароля
     */
    resetPassword: async (email) => {
        try {
            const data = await apiClient.post('/auth/password-reset/', { email });
            return data; 
        } catch (error) {
            console.error('Ошибка сброса:', error);
            throw error;
        }
    },

    /**
     * Получить профиль текущего игрока (Аватарка, имя, базовая инфа)
     */
    getProfile: async () => {
        try {
            const data = await apiClient.get('/auth/profile/');
            return data;
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    }
};
