import { useState, useRef, useCallback } from 'react';

export function useCameraZoom() {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const onPointerDown = useCallback((e) => {
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const onPointerMove = useCallback((e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const onPointerUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const onWheel = useCallback((e) => {
        // Simple zoom logic
        const zoomDelta = e.deltaY * -0.001;
        setZoom(z => Math.max(0.5, Math.min(2, z + zoomDelta)));
    }, []);

    return {
        pan,
        zoom,
        handlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerLeave: onPointerUp,
            onWheel
        }
    };
}
