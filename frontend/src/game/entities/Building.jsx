import React, { useState, useEffect } from 'react';
import { Building2, Landmark, Store } from 'lucide-react';

/**
 * Рендерит само здание и подсчитывает, готово ли оно к сбору
 */
export function Building({ building, cellSize = 60, onCollect, isSpectator }) {
    const [isReady, setIsReady] = useState(false);

    // Локальный тик, чтобы показывать иконку монетки над зданием
    useEffect(() => {
        if (isSpectator) {
            return;
        }

        const interval = setInterval(() => {
            const secondsPassed = (Date.now() - building.lastCollected) / 1000;
            const generated = Math.floor(secondsPassed * (building.incomeRate / 10)); // Быстрый рейт для хакатона
            if (generated > 5) {
                setIsReady(true);
            } else {
                setIsReady(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [building.lastCollected, building.incomeRate, isSpectator]);

    const bWidth = building.width || 1;
    const bHeight = building.height || 1;

    // Center coordinates for custom placement of visuals
    const pixelWidth = cellSize * bWidth;
    const pixelHeight = cellSize * bHeight;

    return (
        <div
            className={`absolute z-10 flex flex-col items-center justify-end group ${isSpectator ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'}`}
            style={{
                width: pixelWidth,
                height: pixelHeight,
                left: building.x * cellSize,
                top: building.y * cellSize,
                transform: 'translateZ(1px)', // Исправление z-index для 3D контекста
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (isSpectator) return;

                if (isReady) {
                    setIsReady(false); // Прячем до следующего апдейта стейта
                    onCollect(e, building);
                }
            }}
        >
            {/* Base tile indication just to show size accurately in development, remove or replace with actual textures later */}
            <div className="absolute inset-0 bg-black/10 border-2 border-white/20 rounded shadow-inner" style={{
                transform: 'translateZ(-1px)'
            }}></div>

            {/* Разворачиваем графику здания обратно к камере */}
            <div className={`absolute isolate transition-transform duration-200 bottom-[20%]`}
                style={{
                    transform: 'rotateZ(-45deg) rotateX(-60deg)',
                    transformOrigin: 'bottom center'
                }}>

                <BuildingGraphic building={building} />

                {/* Выпадающая монетка-уведомление */}
                {isReady && !isSpectator && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce w-10 h-10 bg-amber-400 rounded-full border-[3px] border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center z-50">
                        <span className="text-amber-800 font-extrabold text-sm drop-shadow">🪙</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function BuildingGraphic({ building }) {
    const isMega = building.type === 'hypermarket' || building.type === 'mega';
    const isCommercial = building.type === 'shop_1' || building.type === 'bank_branch' || building.type.startsWith('com_');
    const isDecor = building.type === 'decor' || building.type.startsWith('road') || building.id === 'tree' || building.id === 'bush';

    const w = (building.width || 1) * 32 + 30; // Scale visual width a bit

    // Scale visual height based on level! (Level 1, 2, 3)
    const baseHeightStr = (building.height || 1) * 40;
    const h = isDecor ? (baseHeightStr + 40) : (baseHeightStr + 40 + (building.level * 20));

    if (isDecor) {
        const typeId = building.type;
        const imageUrl = new URL(`../../assets/entities/${typeId}.png`, import.meta.url).href;

        return (
            <div className="w-16 h-16 rounded-full shadow-2xl relative flex items-center justify-center" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'contain', backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat' }}>
            </div>
        )
    }

    if (isMega) {
        const typeId = building.type;
        const level = Math.min(building.level || 1, 3);
        const imageUrl = new URL(`../../assets/entities/${typeId}_lvl${level}.png`, import.meta.url).href;

        return (
            <div className={`bg-gradient-to-t rounded-t-xl border-4 shadow-2xl relative flex items-end pb-4 justify-center group-hover:-translate-y-2 transition-transform ${building.level === 3 ? 'from-purple-700 to-red-500 border-purple-900' : building.level === 2 ? 'from-red-600 to-orange-400 border-red-800' : 'from-red-500 to-orange-300 border-red-700'}`} style={{ width: w, height: h, backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                <Store className="text-white/80 w-16 h-16 mb-6 drop-shadow-md" />
                <div className="absolute bottom-0 w-full h-8 bg-black/60 backdrop-blur-sm border-t border-white/20 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{building.name}</span>
                </div>
            </div>
        );
    }

    if (isCommercial) {
        const typeId = building.type;
        const level = Math.min(building.level || 1, 3);
        const imageUrl = new URL(`../../assets/entities/${typeId}_lvl${level}.png`, import.meta.url).href;

        return (
            <div className={`bg-gradient-to-t rounded-t-lg border-2 shadow-2xl relative flex items-end pb-4 justify-center group-hover:-translate-y-2 transition-transform ${building.level === 3 ? 'from-indigo-800 to-purple-500 border-indigo-900' : building.level === 2 ? 'from-blue-700 to-sky-400 border-blue-900' : 'from-sky-600 to-cyan-400 border-blue-800'}`} style={{ width: w, height: h, backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                <Landmark className="text-white/80 w-10 h-10 mb-2 drop-shadow-md" />
                <div className="absolute bottom-0 w-full h-6 bg-blue-900/50 backdrop-blur-sm border-t border-white/20 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold px-1 text-center truncate w-full">{building.name} {building.level > 1 && `L${building.level}`}</span>
                </div>
            </div>
        );
    }

    // Default Residential
    const typeId = building.type;
    const level = Math.min(building.level || 1, 3);
    const imageUrl = new URL(`../../assets/entities/${typeId}_lvl${level}.png`, import.meta.url).href;

    return (
        <div className={`bg-gradient-to-t rounded-t-xl border-2 shadow-2xl relative flex items-center justify-center flex-col group-hover:-translate-y-2 transition-transform
            ${building.level === 3 ? 'from-rose-600 to-pink-500 border-rose-800' : building.level === 2 ? 'from-orange-600 to-orange-400 border-orange-800' : 'from-amber-500 to-yellow-400 border-amber-700'}`} style={{ width: w, height: h, backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
            <Building2 className="text-white/60 w-8 h-8 mb-2" />
            <div className="text-white font-bold text-[10px] bg-black/40 px-2 py-0.5 rounded shadow-inner mb-2 backdrop-blur border border-white/10 text-center truncate max-w-[90%]">
                {building.name || `LVL ${building.level}`}
            </div>
        </div>
    );
}
