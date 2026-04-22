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
        
        // e.nativeEvent.offsetX / Y gives coordinates relative to the clicked wrapper, perfectly adapting to 3D transforms
        const x = Math.floor(e.nativeEvent.offsetX / cellSize);
        const y = Math.floor(e.nativeEvent.offsetY / cellSize);
        
        if(x >= 0 && x < size && y >= 0 && y < size) {
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
                marginLeft: -(gridWidth)/2, 
                marginTop: -(gridHeight)/2,
                backgroundImage: placementMode ? `
                    linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
                ` : 'none',
                backgroundSize: `${cellSize}px ${cellSize}px`,
                pointerEvents: placementMode ? 'auto' : 'none'
            }}
        >
            {/* Здесь будут рендериться здания (Entities) */}
            <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                {children}
            </div>
        </div>
    );
}
