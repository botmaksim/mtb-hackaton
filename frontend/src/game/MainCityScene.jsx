import { useEffect } from 'react';
import { useCityStore } from '../store/useCityStore';
import { usePlayerStore } from '../store/usePlayerStrore';

import { useCameraZoom } from './systems/cameraZoom';
import { calculateOfflineIncome } from './systems/offlineIncome';
import { IsometricGrid } from './entities/IsometricGrid';
import { Building } from './entities/Building';
import { Cloud } from './entities/Cloud';
import { Button } from '../ui/components/Button';
import { X, CheckCircle2 } from 'lucide-react';

export default function MainCityScene() {
    const { buildings, gridSize, collectIncome, placementMode, setPlacementMode, placeBuilding, viewingUserId } = useCityStore();
    const { addCoins, subtractCoins } = usePlayerStore();
    
    const { pan, zoom, handlers } = useCameraZoom();
    
    const isSpectator = viewingUserId !== null;

    useEffect(() => {
        if (!isSpectator) {
            const { totalGenerated } = calculateOfflineIncome(buildings);
            if (totalGenerated > 0) {
                console.log(`Пока вас не было, город сгенерировал ${totalGenerated} коинов!`);
            }
        }
    }, [buildings, isSpectator]);

    const handleCollect = (e, b) => {
        e.stopPropagation();
        if (isSpectator) return;
        
        const secondsPassed = (Date.now() - b.lastCollected) / 1000;
        const generated = Math.floor(secondsPassed * (b.incomeRate / 10));
        const reward = Math.floor(Math.min(b.maxCapacity, Math.max(1, generated)));
        
        collectIncome(b.id, reward);
        addCoins(reward);
    };

    const handleCellClick = (x, y) => {
        if (!placementMode.active || isSpectator) return;
        
        const newW = placementMode.width || 1;
        const newH = placementMode.height || 1;
        
        // Проверка границ города
        if (x + newW > gridSize || y + newH > gridSize) {
            alert('Здание выходит за пределы города!');
            return;
        }

        // Проверка: занята ли площадь? (пересечение прямоугольников)
        const isOccupied = buildings.some(b => {
            const bW = b.width || 1;
            const bH = b.height || 1;
            
            const intersectX = x < (b.x + bW) && (x + newW) > b.x;
            const intersectY = y < (b.y + bH) && (y + newH) > b.y;
            
            return intersectX && intersectY;
        });

        if (isOccupied) {
            alert('Эта территория уже занята!');
            return;
        }

        // Списываем и строим
        subtractCoins(placementMode.price);
        placeBuilding(placementMode.type, placementMode.name, x, y, newW, newH);
    };

    const CellSize = 60;

    return (
        <div 
            className="w-full h-full bg-[#7dd3fc] overflow-hidden relative select-none"
            style={{ touchAction: 'none' }}
            {...handlers}
        >
            {/* Environment Background Layer */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full blur-sm opacity-90 shadow-[0_0_50px_rgba(253,224,71,0.8)]" />
            
            <Cloud top={15} duration={40} />
            <Cloud top={35} duration={35} delay={10} scale={0.8} />
            <Cloud top={60} duration={50} delay={5} scale={1.2} />

            {/* Camera & Game World Layer */}
            <div 
                className={`absolute inset-0 transition-transform duration-0 ${placementMode.active && !isSpectator ? 'pointer-events-auto cursor-crosshair' : 'cursor-grab active:cursor-grabbing pointer-events-none'}`}
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) translate(50vw, 50vh) scale(${zoom}) rotateX(60deg) rotateZ(45deg)`
                }}
            >
                <IsometricGrid 
                    size={gridSize} 
                    cellSize={CellSize} 
                    onCellClick={handleCellClick}
                    placementMode={placementMode.active && !isSpectator}
                >
                    {buildings.map(b => (
                        <Building 
                            key={b.id} 
                            building={b} 
                            cellSize={CellSize} 
                            onCollect={handleCollect} 
                            isSpectator={isSpectator}
                        />
                    ))}
                </IsometricGrid>
            </div>
            
            {/* Режим Стройки: Overlay */}
            {placementMode.active && !isSpectator && (
                <div className="absolute top-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-indigo-900/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-indigo-500 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                                <CheckCircle2 />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Установка: {placementMode.name}</p>
                                <p className="text-indigo-200 text-xs">Занимает: {placementMode.width}x{placementMode.height}</p>
                            </div>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => setPlacementMode(false)}>
                            <X size={16} /> Отмена
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
