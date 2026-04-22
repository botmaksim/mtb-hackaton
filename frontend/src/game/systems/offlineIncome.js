/**
 * Для хакатона: считаем оффлайн прибыль.
 * Функция может вызываться при старте игры, 
 * чтобы выдать попап "Пока вас не было, город заработал Х коинов"
 */
export function calculateOfflineIncome(buildings) {
    const now = Date.now();
    let totalGenerated = 0;
    
    const updatedBuildings = buildings.map(b => {
        const hoursPassed = (now - b.lastCollected) / (1000 * 60 * 60);
        if (hoursPassed <= 0) return { ...b, uncollected: 0 };
        
        // Для хакатона делаем быстрый рейт (например доход идет за секунды, а не часы)
        // Чтобы на демо-показе коины капали прям на глазах
        const secondsPassed = (now - b.lastCollected) / 1000;
        const generated = Math.floor(secondsPassed * (b.incomeRate / 10)); // Arbitrary fast rate
        
        // Ограничиваем вместимость
        const uncollected = Math.min(b.maxCapacity, generated);
        totalGenerated += uncollected;
        
        return { ...b, uncollected };
    });

    return { totalGenerated, updatedBuildings };
}
