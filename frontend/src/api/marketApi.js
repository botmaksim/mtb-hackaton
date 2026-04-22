import apiClient from './client';

export const marketApi = {
    /**
     * Получить все активные лоты на P2P рынке
     */
    getListings: async () => {
        return await apiClient.get('/market/listings/');
    },

    /**
     * Купить лот у другого игрока
     */
    buyListing: async (listingId) => {
        return await apiClient.post('/market/buy/', { listing_id: listingId });
    },

    /**
     * Выставить свои ресурсы / предметы на продажу
     * @param {string} resourceType 'promoCoins', 'skin', 'booster'
     * @param {number} amount Количество
     * @param {number} price Цена в МТКоинах
     */
    createListing: async (resourceType, amount, price) => {
        return await apiClient.post('/market/sell/', { 
            resource_type: resourceType, 
            amount: amount, 
            price: price 
        });
    }
};
