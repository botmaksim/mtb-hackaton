import React, { useEffect } from 'react';
import { useCityStore } from '../store/useCityStore';
import { usePlayerStore } from '../store/usePlayerStore'; // Проверь опечатку в названии файла Store
import { cityApi } from '../api/cityApi';

import { useCameraZoom } from './systems/cameraZoom';
import { IsometricGrid } from './entities/IsometricGrid';
import { Building } from './entities/Building';
import { Cloud } from './entities/Cloud';
import { Button } from '../ui/components/Button';
import { X, CheckCircle2 } from 'lucide-react';

export default function MainCityScene() {
    const { buildings, gridSize, placementMode, setPlacementMode, fetchCityData, viewingUserId } = useCityStore();
    const { updateBalance } = usePlayerStore()

    const { pan, zoom, handlers } = useCameraZoom();
    const isSpectator = viewingUserId !== null;

    // Первоначальная загрузка данных
    useEffect(() => {
        const controller = new AbortController();

        // Передаем signal в стор
        fetchCityData(controller.signal);

        // Функция очистки: отменяет запрос, если компонент размонтируется
        return () => {
            controller.abort();
        };
    }, []);

    // Безопасный сбор дохода
    const handleCollect = async (e, b) => {
        e.stopPropagation();
        if (isSpectator) return;

        try {
            // 1. Шлем запрос ннеа бэк
            const data = await cityApi.collectIncome(b.id);

            // 2. Обновляем глобальный баланс игрока из ответа сервера
            if (updateBalance) {
                updateBalance(data.new_balance);
            }

            // 3. Перезапрашиваем данные города, чтобы обновить lastCollected у здания
            fetchCityData();

            console.log(`Успешно собрано: ${data.collected} коинов`);
        } catch (err) {
            console.error("Ошибка при сборе дохода:", err.response?.data?.error || err.message);
        }
    };

    const handleGridClick = async (x, y) => {
        if (placementMode.active && !isSpectator) {
            try {
                const catalogItem = useCityStore.getState().buildings?.find(b => b.type === placementMode.type);
                // But wait, the catalog is imported from store
                // Let's just compare placementMode width/height with original
                await cityApi.buildBuilding(placementMode.type, x, y, placementMode.rotated || false);
                setPlacementMode(false);
                fetchCityData(); // Обновляем карту
                const res = await cityApi.getCityState();
                if (res.profile) {
                    usePlayerStore.getState().updateFromProfile(res.profile);
                }
            } catch (err) {
                alert(err.response?.data?.error || "Ошибка постройки");
            }
        }
    };

    const CellSize = 60;

    return (
        <div className="w-full h-full relative touch-none bg-emerald-900" {...handlers}>
            <div
                className="absolute transition-transform duration-75 ease-out"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
                <div className="relative" style={{ transform: 'rotateX(60deg) rotateZ(45deg)', transformStyle: 'preserve-3d' }}>
                    <Cloud top={10} delay={0} scale={1.5} duration={40} />
                    <Cloud top={30} delay={15} scale={0.8} duration={55} />
                    <Cloud top={40} delay={5} scale={1.2} duration={45} />
                    <Cloud top={60} delay={22} scale={1.8} duration={35} />
                    <Cloud top={80} delay={10} scale={1.0} duration={50} />

                    <IsometricGrid
                        size={gridSize}
                        cellSize={CellSize}
                        onCellClick={handleGridClick}
                        placementMode={placementMode.active}
                    >
                        {buildings.map((b) => (
                            <Building
                                key={b.id}
                                building={b}
                                cellSize={CellSize}
                                onCollect={(e) => handleCollect(e, b)}
                                isSpectator={isSpectator}
                            />
                        ))}
                    </IsometricGrid>
                </div>
            </div>

            {placementMode.active && (
                <div className="absolute top-20 left-4 right-4 z-50 flex flex-col gap-2">
                    <div className="bg-indigo-900/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-indigo-500 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-indigo-400" />
                            <div>
                                <p className="text-white font-bold text-sm">Выберите место для: {placementMode.name}</p>
                                <p className="text-indigo-200 text-xs">Размер: {placementMode.width}x{placementMode.height}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={() => useCityStore.setState(s => ({
                                placementMode: { ...s.placementMode, width: s.placementMode.height, height: s.placementMode.width, rotated: !s.placementMode.rotated }
                            }))}>
                                🔄 Повернуть
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => setPlacementMode(false)}>
                                <X size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}