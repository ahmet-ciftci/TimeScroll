import { motion } from 'framer-motion';

/**
 * Spinner Component
 * 
 * Loading indicator with size variants and fade animation.
 */
export default function Spinner({ size = 'medium', className = '' }) {
    const sizes = {
        small: 'w-4 h-4 border-2',
        medium: 'w-8 h-8 border-2',
        large: 'w-12 h-12 border-3'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-center ${className}`}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                }}
                className={`
                    ${sizes[size]}
                    rounded-full
                    border-nord-frost-3/30 dark:border-nord-frost-2/30
                    border-t-nord-frost-3 dark:border-t-nord-frost-2
                `}
                role="status"
                aria-label="Loading"
            />
        </motion.div>
    );
}
