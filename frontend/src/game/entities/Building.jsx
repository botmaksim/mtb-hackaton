import React, { useState, useEffect } from 'react';

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
            className={`absolute group ${isSpectator ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'}`}
            style={{
                width: pixelWidth,
                height: pixelHeight,
                left: building.x * cellSize,
                top: building.y * cellSize,
                zIndex: Math.floor(building.x + building.y + Math.max(bWidth, bHeight)),
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

            {/* Разворачиваем графику здания обратно к камере, центрируем по середине занимаемой области */}
            <div className="absolute top-1/2 left-1/2 w-0 h-0">
                <div className={`absolute isolate transition-transform duration-200`}
                    style={{
                        transform: 'rotateZ(-45deg) rotateX(-60deg)',
                    }}>
                    <div
                        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-end"
                        style={{ bottom: -(((bWidth + bHeight) / 2) * (cellSize * 0.3535)) }}
                    >
                        <BuildingGraphic building={building} />

                        {/* Выпадающая монетка-уведомление */}
                        {isReady && !isSpectator && (
                            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 animate-bounce w-10 h-10 bg-amber-400 rounded-full border-[3px] border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center z-50">
                                <span className="text-amber-800 font-extrabold text-sm drop-shadow">🪙</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BuildingGraphic({ building }) {
    const isMega = building.type === 'hypermarket' || building.type === 'mega';
    const isCommercial = building.type === 'shop_1' || building.type === 'bank_branch' || building.type.startsWith('com_');
    const isDecor = building.type === 'decor' || building.type.startsWith('road') || building.id === 'tree' || building.id === 'bush';

    const bWidth = building.width || 1;
    const bHeight = building.height || 1;
    
    // Cell diagonal in screen pixels = cellSize * sqrt(2) ≈ 84.85
    // Each cell contributes half of that to the total width
    const isoWidth = (bWidth + bHeight) * 60 * 0.7071;
    
    // For background-size: 100% auto, we just need the height to be larger than the max sprite aspect ratio.
    // Making it extra tall (2.5x width) guarantees no vertical clipping for tall skyscrapers.
    const containerWidth = isoWidth;
    const containerHeight = isoWidth * 2.5; 

    if (isDecor) {
        const typeId = building.type;
        const imageUrl = new URL(`../../assets/entities/${typeId}.png`, import.meta.url).href;

        return (
            <div className="relative flex items-end justify-center" style={{ width: containerWidth, height: containerHeight, backgroundImage: `url(${imageUrl})`, backgroundSize: '100% auto', backgroundPosition: 'bottom center', backgroundRepeat: 'no-repeat', transform: building.rotated ? 'scaleX(-1)' : 'none' }}>
            </div>
        );
    }

    const typeId = building.type;
    const level = Math.min(building.level || 1, 3);
    const imageUrl = new URL(`../../assets/entities/${typeId}_lvl${level}.png`, import.meta.url).href;

    return (
        <div className="relative flex items-end pb-[10%] justify-center group-hover:-translate-y-2 transition-transform" style={{ width: containerWidth, height: containerHeight, backgroundImage: `url(${imageUrl})`, backgroundSize: '100% auto', backgroundPosition: 'bottom center', backgroundRepeat: 'no-repeat', transform: building.rotated ? 'scaleX(-1)' : 'none' }}>
            {!isDecor && (
                <div className="absolute -bottom-2 w-auto px-3 h-6 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center shadow-lg" style={{ transform: building.rotated ? 'scaleX(-1)' : 'none', zIndex: 10 }}>
                    <span className="text-[10px] text-white font-bold text-center truncate whitespace-nowrap">{building.name} {building.level > 1 && `L${building.level}`}</span>
                </div>
            )}
        </div>
    );
}
