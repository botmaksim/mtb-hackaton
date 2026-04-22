import apiClient from './client';

export const socialApi = {
    /**
     * Получить лидерборд по очкам/коинам и список друзей
     */
    getLeaderboard: async () => {
        return await apiClient.get('/social/leaderboard/');
    },

    /**
     * Отправить налоговую проверку другу (Конкуренция)
     */
    sendAudit: async (friendId) => {
        return await apiClient.post('/social/audit/', { target_id: friendId });
    },

    /**
     * Совместно инвестировать в проект (Синдикаты)
     */
    investInFriend: async (friendId, amount) => {
        return await apiClient.post('/social/invest/', { friend_id: friendId, amount });
    }
};
