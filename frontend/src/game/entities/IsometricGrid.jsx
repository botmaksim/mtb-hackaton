import React from 'react';

/**
 * Изометрическая сетка поверх которой ставятся здания.
 * Оптимизирована: использует CSS-паттерн вместо тысяч div элементов.
 */
export function IsometricGrid({ size = 100, cellSize = 60, children, onCellClick, placementMode }) {
    const gridWidth = size * cellSize;
    const gridHeight = size * cellSize;

    const handleGridClick = (e) => {
        if (!placementMode || !onCellClick) return;

        // Изометрическая проекция означает, что offsetX/Y на враппере уже искажены.
        // Используем layerX / layerY если доступны, иначе fallback на offsetX
        const rawX = e.nativeEvent.layerX !== undefined ? e.nativeEvent.layerX : e.nativeEvent.offsetX;
        const rawY = e.nativeEvent.layerY !== undefined ? e.nativeEvent.layerY : e.nativeEvent.offsetY;

        const x = Math.floor(rawX / cellSize);
        const y = Math.floor(rawY / cellSize);

        console.log("Grid clicked at raw:", rawX, rawY, "cell:", x, y);

        if (x >= 0 && x < size && y >= 0 && y < size) {
            onCellClick(x, y);
        }
    };

    return (
        <div
            className={`relative bg-emerald-500/80 rounded-2xl shadow-[20px_20px_0_rgba(6,78,59,0.3)] border-4 border-emerald-600/50 ${placementMode ? 'cursor-pointer hover:border-indigo-400' : ''}`}
            onClick={handleGridClick}
            style={{
                width: gridWidth,
                height: gridHeight,
                marginLeft: -(gridWidth) / 2,
                marginTop: -(gridHeight) / 2,
                backgroundImage: placementMode ? `
                    linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
                ` : 'none',
                backgroundSize: `${cellSize}px ${cellSize}px`,
                pointerEvents: placementMode ? 'auto' : 'none'
            }}
        >
            {/* Здесь будут рендериться здания (Entities) */}
            <div className="absolute inset-0 pointer-events-none">
                {children}
            </div>

            {/* Click overlay for placement mode */}
            {placementMode && (
                <div className="absolute inset-0 z-50 cursor-pointer" />
            )}
        </div>
    );
}
