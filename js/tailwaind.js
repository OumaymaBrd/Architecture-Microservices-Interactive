// Configuration Tailwind
tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: "#3b82f6",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#1e293b",
            foreground: "#ffffff",
          },
          muted: {
            DEFAULT: "#f1f5f9",
            foreground: "#64748b",
          },
          accent: {
            DEFAULT: "#f1f5f9",
            foreground: "#1e293b",
          },
          destructive: {
            DEFAULT: "#ef4444",
            foreground: "#ffffff",
          },
          border: "#e2e8f0",
          input: "#e2e8f0",
          ring: "#3b82f6",
          background: "#ffffff",
          foreground: "#0f172a",
          card: {
            DEFAULT: "#ffffff",
            foreground: "#0f172a",
          },
        },
        borderRadius: {
          lg: "0.5rem",
          md: "0.375rem",
          sm: "0.25rem",
        },
        animation: {
          pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
        keyframes: {
          pulse: {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.7 },
          },
        },
      },
    },
  }