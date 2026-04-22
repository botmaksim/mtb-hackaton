import axios from 'axios';

// Создаем базовый инстанс axios
const apiClient = axios.create({
    // Замените на URL вашего Django сервера (или используйте .env: import.meta.env.VITE_API_URL)
    baseURL: 'https://api.mtbank-game.by/api/v1',
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('bank_game_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Стандарт Django REST
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Если бэкенд ответил 401 (Токен протух / Юзер не авторизован)
        if (error.response && error.response.status === 401) {
            console.warn('Токен истек. Перенаправление на авторизацию банка...');
            localStorage.removeItem('bank_game_token');
            // Прикрутить редирект на экран логина
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
