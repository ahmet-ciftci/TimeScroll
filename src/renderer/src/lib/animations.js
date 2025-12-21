/**
 * Animation Configuration
 * 
 * Centralized animation presets for the TimeScroll app.
 * Smooth & elegant style with maximum visual richness.
 */

// Smooth spring configuration for elegant motion
export const smoothSpring = {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 0.5,
};

// Snappy spring for quick interactions
export const snappySpring = {
    type: 'spring',
    stiffness: 400,
    damping: 25,
};

// Elegant ease for fades
export const elegantEase = {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
};

// Quick transition for micro-interactions
export const quickTransition = {
    duration: 0.2,
    ease: 'easeOut',
};

// ============ Page Transitions ============

export const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.99,
        transition: {
            duration: 0.3,
            ease: [0.55, 0.055, 0.675, 0.19],
        },
    },
};

// Slide variants for directional transitions
export const slideVariants = {
    initial: (direction = 1) => ({
        opacity: 0,
        x: direction > 0 ? 60 : -60,
    }),
    enter: {
        opacity: 1,
        x: 0,
        transition: elegantEase,
    },
    exit: (direction = 1) => ({
        opacity: 0,
        x: direction > 0 ? -60 : 60,
        transition: {
            duration: 0.3,
            ease: 'easeIn',
        },
    }),
};

// ============ Container & Stagger ============

export const staggerContainer = {
    initial: {},
    enter: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.05,
            staggerDirection: -1,
        },
    },
};

export const staggerItem = {
    initial: {
        opacity: 0,
        y: 20,
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: smoothSpring,
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: quickTransition,
    },
};

// Fade only stagger item
export const fadeStaggerItem = {
    initial: { opacity: 0 },
    enter: {
        opacity: 1,
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

// ============ Card Animations ============

export const cardVariants = {
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.95,
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: smoothSpring,
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: quickTransition,
    },
};

export const cardHover = {
    scale: 1.02,
    y: -4,
    transition: snappySpring,
};

export const cardTap = {
    scale: 0.98,
    transition: { duration: 0.1 },
};

// ============ Button Animations ============

export const buttonHover = {
    scale: 1.02,
    transition: snappySpring,
};

export const buttonTap = {
    scale: 0.95,
    transition: { duration: 0.1 },
};

// Primary button with glow effect
export const primaryButtonHover = {
    scale: 1.02,
    boxShadow: '0 8px 30px -10px rgba(136, 192, 208, 0.5)',
    transition: snappySpring,
};

// ============ Modal/Dialog Animations ============

export const modalOverlayVariants = {
    initial: {
        opacity: 0,
        backdropFilter: 'blur(0px)',
    },
    enter: {
        opacity: 1,
        backdropFilter: 'blur(8px)',
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        transition: { duration: 0.2 },
    },
};

export const modalContentVariants = {
    initial: {
        opacity: 0,
        scale: 0.9,
        y: 20,
    },
    enter: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: 0.2 },
    },
};

// ============ Dropdown Animations ============

export const dropdownVariants = {
    initial: {
        opacity: 0,
        y: -10,
        scale: 0.95,
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
    exit: {
        opacity: 0,
        y: -5,
        scale: 0.98,
        transition: { duration: 0.15 },
    },
};

// ============ Sidebar Animations ============

export const sidebarVariants = {
    expanded: {
        width: '14rem', // w-56 = 224px = 14rem
        transition: smoothSpring,
    },
    collapsed: {
        width: '4rem', // w-16 = 64px = 4rem
        transition: smoothSpring,
    },
};

export const sidebarTextVariants = {
    expanded: {
        opacity: 1,
        x: 0,
        display: 'block',
        transition: { delay: 0.1, duration: 0.2 },
    },
    collapsed: {
        opacity: 0,
        x: -10,
        transitionEnd: { display: 'none' },
        transition: { duration: 0.1 },
    },
};

// ============ Theme Toggle Animation ============

export const sunMoonVariants = {
    initial: { rotate: 0, scale: 1 },
    animate: { rotate: 360, scale: 1 },
    exit: { rotate: 0, scale: 0.5, opacity: 0 },
    transition: {
        type: 'spring',
        stiffness: 200,
        damping: 10,
    },
};

// ============ List Item Animations ============

export const listItemVariants = {
    initial: { opacity: 0, x: -20 },
    enter: {
        opacity: 1,
        x: 0,
        transition: smoothSpring,
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: quickTransition,
    },
};

export const listItemHover = {
    x: 4,
    backgroundColor: 'rgba(136, 192, 208, 0.1)',
    transition: snappySpring,
};

// ============ Loading/Spinner ============

export const spinnerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    enter: {
        opacity: 1,
        scale: 1,
        transition: smoothSpring,
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: quickTransition,
    },
};

// ============ Hero Section ============

export const heroContainerVariants = {
    initial: {},
    enter: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

export const heroItemVariants = {
    initial: {
        opacity: 0,
        y: 30,
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12,
        },
    },
};

// ============ Calendar Animations ============

// Slide variants for directional transitions - Optimized for performance
export const calendarSlideVariants = {
    initial: (direction) => ({
        x: direction > 0 ? '110%' : '-110%', // Push slightly further to avoid edge bleeding
        position: 'absolute',
        willChange: 'transform',
        boxShadow: '-5px 0 25px rgba(0,0,0,0.05)', // Subtle shadow for depth
    }),
    enter: {
        x: '0%',
        position: 'relative',
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30, // Higher damping for less oscillation (smoother slide)
            mass: 0.8,
        },
    },
    exit: (direction) => ({
        x: direction > 0 ? '-110%' : '110%',
        position: 'absolute',
        transition: {
            duration: 0.25,
            ease: 'easeInOut'
        },
    }),
};

export const slideHeaderVariants = {
    initial: (direction) => ({
        opacity: 0,
        x: direction > 0 ? 20 : -20,
    }),
    enter: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 },
    },
    exit: (direction) => ({
        opacity: 0,
        x: direction > 0 ? -20 : 20,
        transition: { duration: 0.2 },
    }),
};

export const examCardVariants = {
    initial: {
        opacity: 0,
        scale: 0.9,
    },
    enter: {
        opacity: 1,
        scale: 1,
        transition: smoothSpring,
    },
    hover: {
        scale: 1.03,
        y: -2,
        boxShadow: '0 8px 25px -5px rgba(136, 192, 208, 0.3)',
        transition: snappySpring,
    },
};

// ============ Breadcrumb Animation ============

export const breadcrumbVariants = {
    initial: { opacity: 0, x: -10 },
    enter: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        x: 10,
        transition: { duration: 0.2 },
    },
};

// ============ Input Focus Animation ============

export const inputFocusVariants = {
    initial: {
        boxShadow: '0 0 0 0px rgba(136, 192, 208, 0)',
    },
    focus: {
        boxShadow: '0 0 0 3px rgba(136, 192, 208, 0.3)',
        transition: { duration: 0.2 },
    },
};
