import { create } from 'zustand';

export const BUILDING_CATALOG = [
    // Декор (выступает как база 1x1)
    { id: 'tree', name: 'Декоративное дерево', width: 1, height: 1, type: 'decor' },
    { id: 'bush', name: 'Декоративный куст', width: 1, height: 1, type: 'decor' },
    { id: 'road_pedestrian', name: 'Пешеходная дорога', width: 1, height: 1, type: 'decor' },
    { id: 'road_auto', name: 'Автомоб. дорога', width: 1, height: 1, type: 'decor' },

    // Жилые
    { id: 'res_2x2_1', name: 'Жилое здание A', width: 2, height: 2, type: 'residential' },
    { id: 'res_2x3_1', name: 'Жилой комплекс B1', width: 2, height: 3, type: 'residential' },
    { id: 'res_2x3_2', name: 'Жилой комплекс B2', width: 2, height: 3, type: 'residential' },
    { id: 'res_2x4_1', name: 'Жилая башня C', width: 2, height: 4, type: 'residential' },

    // Торговые
    { id: 'com_3x3_1', name: 'Торговый центр 3х3', width: 3, height: 3, type: 'commercial' },
    { id: 'com_2x4_1', name: 'Торговая улица A', width: 2, height: 4, type: 'commercial' },
    { id: 'com_2x4_2', name: 'Торговая галерея B', width: 2, height: 4, type: 'commercial' },
    { id: 'com_2x3_1', name: 'Супермаркет', width: 2, height: 3, type: 'commercial' },

    // Mega
    { id: 'hypermarket', name: 'Гипермаркет', width: 3, height: 4, type: 'mega' },
];

export const useCityStore = create((set) => ({
    // Текущий владелец отображаемого города
    viewingUserId: null,
    viewingUserName: null,

    buildings: [
        { id: 'b1', type: 'res_2x2_1', name: 'Жилое здание A', x: 10, y: 10, width: 2, height: 2, level: 1, lastCollected: Date.now() - 3600000, maxCapacity: 100, incomeRate: 10 },
        { id: 'b2', type: 'com_3x3_1', name: 'Торговый центр 3х3', x: 15, y: 15, width: 3, height: 3, level: 1, lastCollected: Date.now(), maxCapacity: 1000, incomeRate: 100 }
    ],
    season: 'Season 1: Neon Lights',
    gridSize: 100,

    // Режим стройки (ручная расстановка)
    placementMode: {
        active: false,
        type: null,
        name: null,
        price: 0,
        width: 1,
        height: 1
    },

    fetchCityData: async () => {
        const { viewingUserId } = get();
        try {
            const response = await cityApi.getCity(viewingUserId);

            if (response && response.buildings) {
                set({ buildings: response.buildings });
            }
        } catch (error) {
            console.error("Ошибка при загрузке данных города:", error);
        }
    },

    setViewingUser: (userId, userName) => set({ viewingUserId: userId, viewingUserName: userName }),

    // Установить здания для чужого города (вызывается после API запроса)
    setBuildings: (buildings) => set({ buildings }),

    setPlacementMode: (active, type = null, name = null, price = 0, width = 1, height = 1) => set({
        placementMode: { active, type, name, price, width, height }
    }),

    placeBuilding: (type, name, x, y, width = 1, height = 1) => set((state) => ({
        buildings: [...state.buildings, {
            id: Math.random().toString(),
            type,
            name,
            x,
            y,
            width,
            height,
            level: 1,
            lastCollected: Date.now(),
            maxCapacity: 500,
            incomeRate: 50
        }],
        placementMode: { active: false, type: null, name: null, price: 0, width: 1, height: 1 }
    })),

    collectIncome: (buildingId, amount) => set((state) => ({
        buildings: state.buildings.map(b =>
            b.id === buildingId ? { ...b, lastCollected: Date.now() } : b
        )
    })),

    upgradeBuilding: (buildingId) => set((state) => ({
        buildings: state.buildings.map(b =>
            (b.id === buildingId && b.level < 3) ? {
                ...b,
                level: b.level + 1,
                incomeRate: b.incomeRate * 2,
                maxCapacity: b.maxCapacity * 2
            } : b
        )
    })),
}));
