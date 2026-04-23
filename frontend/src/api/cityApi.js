import apiClient from './client';

export const cityApi = {
    // Получить состояние города и баланс
    getCityState: (userId = null, config = {}) => {
        let url = '/game/city/';
        if (userId) {
            url += `?user_id=${userId}`;
        }
        return apiClient.get(url, config); // Передаем config в axios
    },
    
    // Постройка здания (отправляем pos_x и pos_y)
    buildBuilding: (buildingTypeId, x, y) => 
        apiClient.post('/game/build/', { 
            type_id: buildingTypeId, 
            pos_x: x, 
            pos_y: y 
        }),
    
    // Сбор дохода
    collectIncome: (buildingId) => 
        apiClient.post('/game/collect-income/', { 
            building_id: buildingId 
        }),

    // Остальные методы (для ТЗ)
    upgradeBuilding: (buildingId) => apiClient.post('/game/upgrade/', { building_id: buildingId }),
    openCase: (caseId) => apiClient.post('/game/cases/open/', { case_id: caseId }),
    getAchievements: () => apiClient.get('/game/achievements/'),
    claimAchievement: (achievementId) => apiClient.post('/game/achievements/claim/', { achievement_id: achievementId }),
    exchangeCurrency: (fromCurrency, toCurrency, amount) => 
        apiClient.post('/game/exchange/', { from_currency: fromCurrency, to_currency: toCurrency, amount }),
};