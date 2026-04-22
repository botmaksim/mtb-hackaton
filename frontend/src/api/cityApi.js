import apiClient from './client';

export const cityApi = {
    getCityState: async () => await apiClient.get('/game/city/'),
    buildBuilding: async (buildingTypeId, x, y) => await apiClient.post('/game/build/', { type_id: buildingTypeId, pos_x: x, pos_y: y }),
    upgradeBuilding: async (buildingId) => await apiClient.post('/game/upgrade/', { building_id: buildingId }),
    collectIncome: async (buildingId) => await apiClient.post('/game/collect-income/', { building_id: buildingId }),
    openCase: async (caseId) => await apiClient.post('/game/cases/open/', { case_id: caseId }),

    /**
     * Ачивки
     */
    getAchievements: async () => await apiClient.get('/game/achievements/'),
    claimAchievement: async (achievementId) => await apiClient.post('/game/achievements/claim/', { achievement_id: achievementId }),

    /**
     * Кооперация (создание инвест. пула)
     */
    createSyndicate: async (buildingTypeId) => await apiClient.post('/game/syndicate/create/', { type_id: buildingTypeId }),

    /**
     * Банковский обменник валют в игре
     */
    exchangeCurrency: async (fromCurrency, toCurrency, amount) => await apiClient.post('/game/exchange/', { 
        from_currency: fromCurrency, 
        to_currency: toCurrency, 
        amount: amount 
    }),
};
