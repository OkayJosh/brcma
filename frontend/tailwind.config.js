/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
                    "colors": {
                        "surface-container": "#eceef0",
                        "tertiary-container": "#0b1c30",
                        "on-secondary-fixed": "#001a42",
                        "primary-fixed-dim": "#bec6e0",
                        "background": "#f7f9fb",
                        "on-primary-fixed-variant": "#3f465c",
                        "surface-container-lowest": "#ffffff",
                        "tertiary": "#000000",
                        "on-secondary": "#ffffff",
                        "secondary-container": "#2170e4",
                        "surface-container-highest": "#e0e3e5",
                        "surface-container-low": "#f2f4f6",
                        "on-tertiary-fixed-variant": "#38485d",
                        "on-primary-container": "#7c839b",
                        "secondary": "#0058be",
                        "on-secondary-container": "#fefcff",
                        "inverse-primary": "#bec6e0",
                        "surface": "#f7f9fb",
                        "on-surface-variant": "#45464d",
                        "surface-variant": "#e0e3e5",
                        "outline-variant": "#c6c6cd",
                        "surface-tint": "#565e74",
                        "tertiary-fixed": "#d3e4fe",
                        "tertiary-fixed-dim": "#b7c8e1",
                        "surface-bright": "#f7f9fb",
                        "secondary-fixed-dim": "#adc6ff",
                        "surface-dim": "#d8dadc",
                        "on-secondary-fixed-variant": "#004395",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#dae2fd",
                        "inverse-on-surface": "#eff1f3",
                        "surface-container-high": "#e6e8ea",
                        "on-tertiary-container": "#75859d",
                        "on-background": "#191c1e",
                        "primary-container": "#131b2e",
                        "on-primary": "#ffffff",
                        "on-surface": "#191c1e",
                        "on-tertiary-fixed": "#0b1c30",
                        "error-container": "#ffdad6",
                        "primary": "#000000",
                        "inverse-surface": "#2d3133",
                        "secondary-fixed": "#d8e2ff",
                        "on-error": "#ffffff",
                        "outline": "#76777d",
                        "on-primary-fixed": "#131b2e",
                        "on-error-container": "#93000a",
                        "error": "#ba1a1a"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "container-max": "1280px",
                        "gutter": "24px",
                        "margin-desktop": "40px",
                        "unit": "8px",
                        "section-gap": "64px",
                        "margin-mobile": "16px"
                    },
                    "fontFamily": {
                        "body-lg": ["Inter"],
                        "headline-md": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "body-md": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-lg": ["Inter"],
                        "label-md": ["Inter"]
                    },
                    "fontSize": {
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "500" }]
                    }
    }
  }
};