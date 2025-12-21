import { motion } from 'framer-motion';
import { pageVariants } from '../lib/animations';

/**
 * AnimatedPage Component
 * 
 * Wraps page content with enter/exit animations.
 * Use this as the outer wrapper for each view component.
 */
export default function AnimatedPage({ children, className = '' }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
}
