/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/renderer/**/*.{js,jsx,ts,tsx,html}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Skyrim Nord Theme - Light Mode Base
                nord: {
                    // Polar Night (Dark backgrounds for dark mode)
                    'polar-1': '#2E3440', // Darkest
                    'polar-2': '#3B4252',
                    'polar-3': '#434C5E',
                    'polar-4': '#4C566A', // Lightest dark

                    // Snow Storm (Light backgrounds for light mode)
                    'snow-1': '#D8DEE9', // Darkest light
                    'snow-2': '#E5E9F0',
                    'snow-3': '#ECEFF4', // Lightest (main bg)

                    // Frost (Accent blues - the Skyrim ice feel)
                    'frost-1': '#8FBCBB', // Frozen polar water
                    'frost-2': '#88C0D0', // Clear sky blue
                    'frost-3': '#81A1C1', // Arctic ocean
                    'frost-4': '#5E81AC', // Deep steel blue

                    // Aurora (Status/accent colors)
                    'aurora-red': '#BF616A',    // Errors
                    'aurora-orange': '#D08770', // Warnings
                    'aurora-yellow': '#EBCB8B', // Highlights
                    'aurora-green': '#A3BE8C',  // Success
                    'aurora-purple': '#B48EAD', // Special
                },
            },
            fontFamily: {
                // Headers - elegant serif with manuscript feel
                heading: ['Cinzel', 'Cormorant Garamond', 'Georgia', 'serif'],
                // Body - clean, readable sans-serif
                sans: ['Inter', 'Source Sans Pro', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                // Subtle frost-like shadows
                'frost': '0 4px 14px 0 rgba(136, 192, 208, 0.15)',
                'frost-lg': '0 10px 40px -10px rgba(136, 192, 208, 0.25)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
        },
    },
    plugins: [],
};
