import { create } from 'zustand';
import { cityApi } from '../api/cityApi';
import axios from 'axios';

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

export const useCityStore = create((set, get) => ({
    // Текущий владелец отображаемого города
    viewingUserId: null,
    viewingUserName: null,

    buildings: [],
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

    fetchCityData: async (signal) => {
        const { viewingUserId } = get();
        try {
            // Передаем signal в API
            const response = await cityApi.getCityState(viewingUserId, { signal });

            // Axios возвращает данные в response.data
            // Проверь, как бекенд отдает данные: response.data.buildings или response.buildings?
            // Обычно в Axios это response.data
            const data = response.data || response;

            if (data && data.buildings) {
                const mappedBuildings = data.buildings.map(b => {
                    const catalogItem = BUILDING_CATALOG.find(cat => cat.id === b.type);
                    return {
                        ...b,
                        width: catalogItem ? catalogItem.width : 1,
                        height: catalogItem ? catalogItem.height : 1,
                    };
                });
                set({ buildings: mappedBuildings });
            }
        } catch (error) {
            // Игнорируем ошибку отмены запроса (Aborted)
            if (axios.isCancel(error)) {
                return;
            }
            console.error("Ошибка при загрузке данных города:", error.response?.data || error.message);
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
