import apiClient from './client';

export const cityApi = {
    // Получить состояние города и баланс
    getCityState: () => apiClient.get('/game/city/'),
    
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
    exchangeCurrency: (fromCurrency, toCurrency, amount) => 
        apiClient.post('/game/exchange/', { from_currency: fromCurrency, to_currency: toCurrency, amount }),
};