/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./pages/**/*.{ts,tsx}",
    ],
    extend: {
        fontFamily: {
            sans: ["Pretendard Variable", "Pretendard", "ui-sans-serif", "system-ui"],
        },
    }
}