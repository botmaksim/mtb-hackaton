import apiClient from './client';

export const bankApi = {
    /**
     * Синхронизировать МСС транзакции для начисления бутсов (ТЗ Win-Win)
     */
    syncPurchases: async () => {
        try {
            const data = await apiClient.post('/bank/sync-mcc/');
            return data; 
        } catch (error) {
            console.error('Ошибка синхронизации транзакций:', error);
            throw error;
        }
    },

    /**
     * Отправить налоговую проверку другу (ТЗ Social/Месть)
     */
    sendAudit: async (friendId) => {
        try {
            const data = await apiClient.post('/social/audit/', { target_id: friendId });
            return data;
        } catch (error) {
            console.error('Ошибка проведения проверки:', error);
            throw error;
        }
    },

    /**
     * Совместно инвестировать в проект (ТЗ Синдикаты)
     */
    investInFriend: async (friendId, amount) => {
        try {
            const data = await apiClient.post('/social/invest/', { friend_id: friendId, amount });
            return data;
        } catch (error) {
            console.error('Ошибка инвестирования:', error);
            throw error;
        }
    }
};
