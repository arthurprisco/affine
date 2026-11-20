/** @type {import('tailwindcss').Config} */
const { colors } = require("./src/shared/colors");
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily: {
        title: ["PurplePurse_400Regular"],
        body: ["Poppins_400Regular"],
        "body-medium": ["Poppins_500Medium"],
        "body-semibold": ["Poppins_600SemiBold"],
      },
      borderRadius: {
        sm: "6px", // inputs, botões, chips, badges, tags
        md: "8px", // cards
        lg: "12px", // card de destaque
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "22px" }],
        lg: ["20px", { lineHeight: "26px" }],
      },
    },
  },
  plugins: [],
};
