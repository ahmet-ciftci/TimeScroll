/**
 * Spinner Component - Simple loading indicator
 * 
 * A centered spinner shown during data loading states.
 */

export default function Spinner({ size = 'default', className = '' }) {
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        default: 'w-8 h-8 border-4',
        large: 'w-12 h-12 border-4',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`
                    ${sizeClasses[size] || sizeClasses.default}
                    border-nord-snow-1 dark:border-nord-polar-3
                    border-t-nord-frost-3 dark:border-t-nord-frost-2
                    rounded-full animate-spin
                `}
                role="status"
                aria-label="Loading"
            />
        </div>
    );
}
