import React from 'react';
import { motion } from 'framer-motion';

export function Cloud({ top = 20, delay = 0, scale = 1, duration = 30 }) {
    return (
        <motion.div
            initial={{ x: '-50vw' }}
            animate={{ x: '150vw' }}
            transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
            className="absolute pointer-events-none z-0"
            style={{ top: `${top}%`, scale }}
        >
            <div className="relative">
                <div className="w-32 h-10 bg-white/40 rounded-full blur-md" />
                <div className="w-20 h-20 bg-white/40 rounded-full blur-md absolute -top-10 left-6" />
                <div className="w-16 h-16 bg-white/40 rounded-full blur-md absolute -top-4 -left-4" />
            </div>
        </motion.div>
    );
}
