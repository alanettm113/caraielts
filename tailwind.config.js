/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        ],
        theme: {
            extend: {
                fontFamily: {
                    roboto: ['Roboto', 'sans-serif'],
                },
            colors: {
                amber: {
                100: "#FEF3C7",
                200: "#FDE68A",
                300: "#FCD34D",
                500: "#F59E0B",
                600: "#D97706",
                700: "#B45309",
                },
                neutral: {
                50: "#FAFAFA",
                100: "#F5F5F5",
                200: "#E5E5E5",
                600: "#4B5563",
                900: "#1F2937",
                },
            },
            },
        },
        plugins: [require('tailwind-scrollbar'),],
        };