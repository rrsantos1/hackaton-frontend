module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: "#808000",
          50: "#f6f6f0",
          100: "#e6e6d9",
          200: "#c6c6a9",
          300: "#a5a57a",
          400: "#85854a",
          500: "#6b6b30",
          600: "#55551f",
          700: "#3f3f0e",
          800: "#29290e",
          900: "#14140e",
        },
      },
      animation: {
        slideInLeft: 'slideInLeft 1s ease-in-out forwards',
        slideOutRight: 'slideOutRight 1s ease-in-out forwards',
        'jump-in': 'jumpIn 0.8s ease-out forwards',
        'rotate-x': 'rotateX 1s ease-in-out forwards',
        'rotate-y': 'rotateY 1s ease-in-out forwards',
        shake: 'shake 0.5s ease-in-out forwards',
        wiggle: 'wiggle 1s ease-in-out forwards',
      },
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        jumpIn: {
          '0%': { transform: 'translateY(50%) scale(0.5)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        rotateX: {
          '0%': { transform: 'rotateX(0deg)', opacity: '1' },
          '100%': { transform: 'rotateX(360deg)', opacity: '1' },
        },
        rotateY: {
          '0%': { transform: 'rotateY(0deg)', opacity: '1' },
          '100%': { transform: 'rotateY(360deg)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-10px)' },
          '40%, 80%': { transform: 'translateX(10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  safelist: [
    "animate-slideInLeft",
    "animate-slideOutRight",
    "animate-jump-in",
    "animate-rotate-x",
    "animate-rotate-y",
    "animate-shake",
    "animate-wiggle"
  ],
  plugins: [],
};
